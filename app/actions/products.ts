"use server";

import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { AppError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/guards";
import { productSchema, stockAdjustSchema } from "@/lib/validations";
import { fail, safe, zodErrors, type ActionResult } from "@/lib/action-result";
import { ean13FromSeq } from "@/lib/barcode";
import { MAX_IMAGE_BYTES, UPLOAD_DIR, detectImageExt } from "@/lib/files";

function refresh() {
  revalidatePath("/admin/products");
  revalidatePath("/admin/products/catalog");
  revalidatePath("/admin/stock");
  revalidatePath("/admin/dashboard");
  revalidatePath("/kasir/products");
  revalidatePath("/kasir/pos");
}

async function saveImage(file: File): Promise<string> {
  if (file.size > MAX_IMAGE_BYTES) throw new Error("IMG_SIZE");
  const buf = Buffer.from(await file.arrayBuffer());
  const ext = detectImageExt(buf);
  if (!ext) throw new Error("IMG_TYPE");
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const name = `${Date.now()}-${randomBytes(4).toString("hex")}.${ext}`;
  await fs.writeFile(path.join(UPLOAD_DIR, name), buf);
  return `/api/files/${name}`;
}

async function removeOldImage(url: string | null | undefined) {
  if (!url || !url.startsWith("/api/files/")) return;
  const name = url.replace("/api/files/", "");
  if (!/^[a-zA-Z0-9_-]+\.(jpg|png|webp)$/.test(name)) return;
  await fs.unlink(path.join(UPLOAD_DIR, name)).catch(() => {});
}

async function nextCode(): Promise<string> {
  const last = await prisma.product.findMany({
    where: { code: { startsWith: "PRF" } },
    select: { code: true },
    orderBy: { code: "desc" },
    take: 1,
  });
  const n = last[0] ? Number(last[0].code.replace(/\D/g, "")) || 0 : 0;
  return `PRF${String(n + 1).padStart(3, "0")}`;
}

async function nextBarcode(): Promise<string> {
  const count = await prisma.product.count();
  let seq = count + 1;
  for (let i = 0; i < 200; i++, seq++) {
    const code = ean13FromSeq(seq);
    const exists = await prisma.product.findUnique({ where: { barcode: code } });
    if (!exists) return code;
  }
  throw new Error("Gagal membuat barcode otomatis.");
}

export async function saveProduct(formData: FormData): Promise<ActionResult> {
  return safe<undefined>(async () => {
    const user = await authorize(["ADMIN"]);

    const raw: Record<string, unknown> = {};
    formData.forEach((value, key) => {
      if (typeof value === "string") raw[key] = value;
    });

    const idValue = Number(raw.id) || null;
    const parsed = productSchema.safeParse(raw);
    if (!parsed.success) return fail("Periksa kembali isian Anda.", zodErrors(parsed.error));
    const data = parsed.data;

    const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
    if (!category) return fail("Kategori tidak ditemukan.", { categoryId: "Kategori tidak ditemukan." });

    const existing = idValue ? await prisma.product.findUnique({ where: { id: idValue } }) : null;
    if (idValue && !existing) return fail("Barang tidak ditemukan.");

    const code = data.code ?? existing?.code ?? (await nextCode());
    const barcode = data.barcode ?? existing?.barcode ?? (await nextBarcode());

    const dupCode = await prisma.product.findFirst({
      where: { code, ...(idValue ? { NOT: { id: idValue } } : {}) },
    });
    if (dupCode) return fail("Kode barang sudah dipakai.", { code: "Kode barang sudah dipakai." });
    const dupBarcode = await prisma.product.findFirst({
      where: { barcode, ...(idValue ? { NOT: { id: idValue } } : {}) },
    });
    if (dupBarcode) return fail("Barcode sudah dipakai.", { barcode: "Barcode sudah dipakai." });

    let imageUrl: string | undefined;
    const file = formData.get("image");
    if (file instanceof File && file.size > 0) {
      try {
        imageUrl = await saveImage(file);
      } catch (e) {
        const msg = (e as Error).message;
        if (msg === "IMG_SIZE") return fail("Ukuran foto maksimal 2 MB.", { image: "Ukuran foto maksimal 2 MB." });
        if (msg === "IMG_TYPE") return fail("Foto harus berformat JPG, PNG, atau WEBP.", { image: "Foto harus JPG, PNG, atau WEBP." });
        throw e;
      }
    }

    const base = {
      code,
      barcode,
      name: data.name,
      brand: data.brand,
      categoryId: data.categoryId,
      size: data.size,
      costPrice: data.costPrice,
      sellingPrice: data.sellingPrice,
      unit: data.unit,
      description: data.description ?? null,
      status: data.status,
      ...(imageUrl ? { image: imageUrl } : {}),
    };

    if (existing) {
      await prisma.product.update({ where: { id: existing.id }, data: base });
      if (imageUrl) await removeOldImage(existing.image);
    } else {
      const created = await prisma.product.create({ data: { ...base, stock: data.stock } });
      if (data.stock > 0) {
        await prisma.stockHistory.create({
          data: {
            productId: created.id,
            type: "IN",
            quantity: data.stock,
            beforeStock: 0,
            afterStock: data.stock,
            description: "Stok awal",
            userId: user.id,
          },
        });
      }
    }

    refresh();
    return { ok: true, message: existing ? "Barang diperbarui." : "Barang ditambahkan." };
  });
}

export async function deleteProduct(id: number): Promise<ActionResult> {
  return safe<undefined>(async () => {
    await authorize(["ADMIN"]);
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return fail("Barang tidak ditemukan.");

    const used = await prisma.transactionDetail.count({ where: { productId: id } });
    if (used > 0) {
      return fail("Barang pernah dipakai di transaksi, tidak bisa dihapus. Nonaktifkan saja barangnya.");
    }

    await prisma.stockHistory.deleteMany({ where: { productId: id } });
    await prisma.product.delete({ where: { id } });
    await removeOldImage(product.image);
    refresh();
    return { ok: true, message: "Barang dihapus." };
  });
}

export async function adjustStock(input: {
  productId: number;
  type: "IN" | "OUT" | "ADJUSTMENT";
  quantity: number;
  description?: string;
}): Promise<ActionResult> {
  return safe<undefined>(async () => {
    const user = await authorize(["ADMIN"]);
    const parsed = stockAdjustSchema.safeParse(input);
    if (!parsed.success) return fail("Periksa kembali isian Anda.", zodErrors(parsed.error));
    const { productId, type, quantity, description } = parsed.data;

    if (type !== "ADJUSTMENT" && quantity < 1) {
      return fail("Jumlah minimal 1.", { quantity: "Jumlah minimal 1." });
    }

    await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) throw new AppError("Barang tidak ditemukan.");

      const before = product.stock;
      const after = type === "IN" ? before + quantity : type === "OUT" ? before - quantity : quantity;
      if (after < 0) throw new AppError("Stok tidak boleh kurang dari 0.");

      // Update bersyarat agar aman dari perubahan stok bersamaan
      const res = await tx.product.updateMany({
        where: { id: productId, stock: before },
        data: { stock: after },
      });
      if (res.count === 0) throw new AppError("Stok baru saja berubah, coba lagi.");

      await tx.stockHistory.create({
        data: {
          productId,
          type,
          quantity: type === "ADJUSTMENT" ? Math.abs(after - before) : quantity,
          beforeStock: before,
          afterStock: after,
          description: description ?? null,
          userId: user.id,
        },
      });
    });

    refresh();
    return { ok: true, message: "Stok berhasil diperbarui." };
  });
}
