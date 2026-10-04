"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/guards";
import { AppError } from "@/lib/errors";
import { checkoutSchema, type CheckoutInput } from "@/lib/validations";
import { fail, safe, zodErrors, type ActionResult } from "@/lib/action-result";
import { isValidProvider } from "@/lib/payments";

function pad(n: number, size: number) {
  return String(n).padStart(size, "0");
}

async function nextInvoice(tx: Prisma.TransactionClient, now: Date): Promise<string> {
  const prefix = `TRX-${now.getFullYear()}${pad(now.getMonth() + 1, 2)}${pad(now.getDate(), 2)}-`;
  const last = await tx.transaction.findFirst({
    where: { invoiceNumber: { startsWith: prefix } },
    orderBy: { invoiceNumber: "desc" },
    select: { invoiceNumber: true },
  });
  const n = last ? Number(last.invoiceNumber.slice(prefix.length)) || 0 : 0;
  return `${prefix}${pad(n + 1, 4)}`;
}

async function createTransaction(input: CheckoutInput, userId: number): Promise<number> {
  return prisma.$transaction(async (tx) => {
    // Gabungkan item yang sama
    const merged = new Map<number, number>();
    for (const item of input.items) {
      merged.set(item.productId, (merged.get(item.productId) ?? 0) + item.quantity);
    }

    const products = await tx.product.findMany({
      where: { id: { in: Array.from(merged.keys()) } },
    });
    if (products.length !== merged.size) throw new AppError("Barang tidak ditemukan.");

    const lines = products.map((p) => {
      const quantity = merged.get(p.id) as number;
      if (p.status !== "ACTIVE") throw new AppError(`${p.name} sudah tidak aktif.`);
      if (p.stock <= 0) throw new AppError(`Stok produk habis: ${p.name}`);
      if (p.stock < quantity) throw new AppError(`Stok tidak mencukupi: ${p.name} (sisa ${p.stock})`);
      return { product: p, quantity, price: p.sellingPrice, subtotal: p.sellingPrice * quantity };
    });

    const subtotal = lines.reduce((s, l) => s + l.subtotal, 0);
    if (input.discount > subtotal) throw new AppError("Diskon melebihi total belanja.");
    const total = subtotal - input.discount;

    const method = input.paymentMethod;
    const provider = input.paymentProvider || null;
    if (!isValidProvider(method, provider)) {
      throw new AppError(method === "EWALLET" ? "Pilih e-wallet." : method === "TRANSFER" ? "Pilih bank." : "Provider tidak valid.");
    }

    let paid = input.paymentAmount;
    if (method === "CASH") {
      if (paid < total) throw new AppError("Nominal pembayaran tidak mencukupi");
    } else {
      paid = total;
    }
    const change = method === "CASH" ? paid - total : 0;

    if (input.memberId) {
      const member = await tx.member.findUnique({ where: { id: input.memberId } });
      if (!member || member.status !== "ACTIVE") throw new AppError("Member tidak ditemukan atau nonaktif.");
    }

    // Kurangi stok secara atomik; gagal bila stok sudah berubah
    for (const l of lines) {
      const res = await tx.product.updateMany({
        where: { id: l.product.id, stock: { gte: l.quantity } },
        data: { stock: { decrement: l.quantity } },
      });
      if (res.count === 0) throw new AppError(`Stok tidak mencukupi: ${l.product.name}`);
    }

    const now = new Date();
    const invoiceNumber = await nextInvoice(tx, now);

    const created = await tx.transaction.create({
      data: {
        invoiceNumber,
        userId,
        memberId: input.memberId ?? null,
        subtotal,
        discount: input.discount,
        total,
        paymentMethod: method,
        paymentProvider: provider,
        paymentAmount: paid,
        changeAmount: change,
        status: "PAID",
        createdAt: now,
        details: {
          create: lines.map((l) => ({
            productId: l.product.id,
            quantity: l.quantity,
            price: l.price,
            subtotal: l.subtotal,
          })),
        },
        payment: {
          create: {
            method,
            provider,
            reference: input.paymentReference || null,
            amount: paid,
            status: "PAID",
            paidAt: now,
          },
        },
      },
    });

    await tx.stockHistory.createMany({
      data: lines.map((l) => ({
        productId: l.product.id,
        type: "SALE" as const,
        quantity: l.quantity,
        beforeStock: l.product.stock,
        afterStock: l.product.stock - l.quantity,
        description: `Penjualan ${invoiceNumber}`,
        userId,
      })),
    });

    return created.id;
  });
}

export async function checkout(input: CheckoutInput): Promise<ActionResult<{ id: number }>> {
  return safe<{ id: number }>(async () => {
    const user = await authorize(["ADMIN", "KASIR"]);
    const parsed = checkoutSchema.safeParse(input);
    if (!parsed.success) {
      return fail(Object.values(zodErrors(parsed.error))[0] ?? "Data transaksi tidak valid.");
    }

    // Nomor invoice bisa bentrok bila dua kasir bayar bersamaan: ulangi beberapa kali
    let lastError: unknown;
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const id = await createTransaction(parsed.data, user.id);
        revalidatePath("/admin/dashboard");
        revalidatePath("/kasir/dashboard");
        revalidatePath("/admin/transactions");
        revalidatePath("/kasir/transactions");
        revalidatePath("/admin/products");
        revalidatePath("/admin/stock");
        revalidatePath("/kasir/pos");
        return { ok: true, message: "Transaksi berhasil.", data: { id } };
      } catch (e) {
        lastError = e;
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") continue;
        throw e;
      }
    }
    console.error(lastError);
    return fail("Transaksi gagal diproses");
  });
}
