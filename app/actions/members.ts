"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/guards";
import { memberSchema } from "@/lib/validations";
import { fail, safe, zodErrors, type ActionResult } from "@/lib/action-result";
import type { MemberDetail } from "@/lib/types";

function refresh() {
  revalidatePath("/admin/members");
  revalidatePath("/kasir/members");
  revalidatePath("/kasir/pos");
}

async function nextMemberCode(): Promise<string> {
  const last = await prisma.member.findMany({
    where: { memberCode: { startsWith: "MBR" } },
    select: { memberCode: true },
    orderBy: { memberCode: "desc" },
    take: 1,
  });
  const n = last[0] ? Number(last[0].memberCode.replace(/\D/g, "")) || 0 : 0;
  return `MBR${String(n + 1).padStart(3, "0")}`;
}

type MemberInput = {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  status?: string;
};

export async function saveMember(id: number | null, input: MemberInput): Promise<ActionResult> {
  return safe<undefined>(async () => {
    // Kasir hanya boleh menambah; edit hanya admin
    const user = await authorize(id ? ["ADMIN"] : ["ADMIN", "KASIR"]);
    const parsed = memberSchema.safeParse({
      ...input,
      status: user.role === "ADMIN" ? input.status || "ACTIVE" : "ACTIVE",
    });
    if (!parsed.success) return fail("Periksa kembali isian Anda.", zodErrors(parsed.error));
    const d = parsed.data;

    const dupPhone = await prisma.member.findFirst({
      where: { phone: d.phone, ...(id ? { NOT: { id } } : {}) },
    });
    if (dupPhone) return fail("Nomor telepon sudah terdaftar.", { phone: "Nomor telepon sudah terdaftar." });

    if (id) {
      await prisma.member.update({
        where: { id },
        data: { name: d.name, phone: d.phone, email: d.email ?? null, address: d.address ?? null, status: d.status },
      });
    } else {
      await prisma.member.create({
        data: {
          memberCode: await nextMemberCode(),
          name: d.name,
          phone: d.phone,
          email: d.email ?? null,
          address: d.address ?? null,
          status: d.status,
        },
      });
    }
    refresh();
    return { ok: true, message: id ? "Member diperbarui." : "Member ditambahkan." };
  });
}

export async function deleteMember(id: number): Promise<ActionResult> {
  return safe<undefined>(async () => {
    await authorize(["ADMIN"]);
    const used = await prisma.transaction.count({ where: { memberId: id } });
    if (used > 0) {
      return fail("Member sudah punya transaksi, tidak bisa dihapus. Nonaktifkan saja.");
    }
    await prisma.member.delete({ where: { id } });
    refresh();
    return { ok: true, message: "Member dihapus." };
  });
}

export async function getMemberDetail(id: number): Promise<ActionResult<MemberDetail>> {
  return safe<MemberDetail>(async () => {
    const user = await authorize();
    const member = await prisma.member.findUnique({ where: { id } });
    if (!member) return fail("Member tidak ditemukan.");

    const where = { memberId: id, status: "PAID" as const, ...(user.role === "KASIR" ? { userId: user.id } : {}) };
    const [agg, recent] = await Promise.all([
      prisma.transaction.aggregate({ where, _count: { _all: true }, _sum: { total: true } }),
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { id: true, invoiceNumber: true, total: true, createdAt: true },
      }),
    ]);

    return {
      ok: true,
      data: {
        id: member.id,
        memberCode: member.memberCode,
        name: member.name,
        phone: member.phone,
        email: member.email,
        address: member.address,
        status: member.status,
        totalTransactions: agg._count._all,
        totalSpent: agg._sum.total ?? 0,
        recent: recent.map((t) => ({ ...t, createdAt: t.createdAt.toISOString() })),
      },
    };
  });
}
