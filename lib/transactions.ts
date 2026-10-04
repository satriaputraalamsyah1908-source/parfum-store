import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { readParam, type SearchParams } from "@/lib/product-query";

export const TX_PAGE_SIZE = 15;

function parseDay(v: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
  const [y, m, d] = v.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export async function getTransactionList(sp: SearchParams, scopeUserId?: number) {
  const q = readParam(sp, "q");
  const from = readParam(sp, "from");
  const to = readParam(sp, "to");
  const page = Math.max(1, Math.floor(Number(readParam(sp, "page"))) || 1);

  const where: Prisma.TransactionWhereInput = {};
  if (scopeUserId) where.userId = scopeUserId;
  if (q) {
    where.OR = [
      { invoiceNumber: { contains: q } },
      { member: { name: { contains: q } } },
    ];
  }
  const f = parseDay(from);
  const t = parseDay(to);
  if (f || t) {
    where.createdAt = {
      ...(f ? { gte: f } : {}),
      ...(t ? { lt: new Date(t.getFullYear(), t.getMonth(), t.getDate() + 1) } : {}),
    };
  }

  const [total, rows] = await Promise.all([
    prisma.transaction.count({ where }),
    prisma.transaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * TX_PAGE_SIZE,
      take: TX_PAGE_SIZE,
      include: { user: { select: { name: true } }, member: { select: { name: true } } },
    }),
  ]);

  return { q, from, to, page, total, rows, totalPages: Math.max(1, Math.ceil(total / TX_PAGE_SIZE)) };
}

export async function getTransactionDetail(id: number) {
  return prisma.transaction.findUnique({
    where: { id },
    include: {
      user: { select: { name: true } },
      member: { select: { name: true, memberCode: true } },
      payment: true,
      details: { include: { product: { select: { name: true, brand: true, size: true } } } },
    },
  });
}
