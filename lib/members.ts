import { prisma } from "@/lib/prisma";
import type { SearchParams } from "@/lib/product-query";
import { readParam } from "@/lib/product-query";
import type { MemberRow } from "@/components/member/MemberManager";

export const MEMBER_PAGE_SIZE = 10;

export async function getMemberList(sp: SearchParams, scopeUserId?: number) {
  const q = readParam(sp, "q");
  const page = Math.max(1, Math.floor(Number(readParam(sp, "page"))) || 1);
  const where = q
    ? { OR: [{ name: { contains: q } }, { phone: { contains: q } }, { memberCode: { contains: q } }] }
    : {};

  const [total, rows] = await Promise.all([
    prisma.member.count({ where }),
    prisma.member.findMany({ where, orderBy: { name: "asc" }, skip: (page - 1) * MEMBER_PAGE_SIZE, take: MEMBER_PAGE_SIZE }),
  ]);

  const stats = await prisma.transaction.groupBy({
    by: ["memberId"],
    where: { memberId: { in: rows.map((r) => r.id) }, status: "PAID", ...(scopeUserId ? { userId: scopeUserId } : {}) },
    _count: { _all: true },
    _sum: { total: true },
  });
  const map = new Map(stats.map((s) => [s.memberId, s]));

  const members: MemberRow[] = rows.map((m) => ({
    id: m.id,
    memberCode: m.memberCode,
    name: m.name,
    phone: m.phone,
    email: m.email,
    address: m.address,
    status: m.status,
    totalTransactions: map.get(m.id)?._count._all ?? 0,
    totalSpent: map.get(m.id)?._sum.total ?? 0,
  }));

  return { q, page, total, members, totalPages: Math.max(1, Math.ceil(total / MEMBER_PAGE_SIZE)) };
}
