import { prisma } from "@/lib/prisma";
import { addDays, dateKey, startOfDay, startOfMonth } from "@/lib/date";
import { LOW_STOCK_THRESHOLD } from "@/lib/stock";
import type {
  LowStockItem,
  SalesPoint,
  TopProduct,
  TransactionRow,
} from "@/lib/types";

function buildDailySeries(
  rows: { createdAt: Date; total: number }[],
  days: number
): SalesPoint[] {
  const today = startOfDay(new Date());
  const buckets = new Map<string, { transaksi: number; pendapatan: number }>();

  for (let i = days - 1; i >= 0; i--) {
    buckets.set(dateKey(addDays(today, -i)), { transaksi: 0, pendapatan: 0 });
  }

  for (const row of rows) {
    const bucket = buckets.get(dateKey(row.createdAt));
    if (bucket) {
      bucket.transaksi += 1;
      bucket.pendapatan += row.total;
    }
  }

  return Array.from(buckets.entries()).map(([key, value]) => ({
    label: `${key.slice(8, 10)}/${key.slice(5, 7)}`,
    transaksi: value.transaksi,
    pendapatan: value.pendapatan,
  }));
}

export async function getAdminDashboardData() {
  const todayStart = startOfDay(new Date());
  const monthStart = startOfMonth(new Date());
  const since = addDays(todayStart, -29);

  const [
    productCount,
    stockAgg,
    memberCount,
    kasirCount,
    todayAgg,
    monthAgg,
    totalAgg,
    recentSales,
    lowStockRows,
    topGroups,
    recentRows,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.aggregate({ _sum: { stock: true } }),
    prisma.member.count(),
    prisma.user.count({ where: { role: { name: "KASIR" } } }),
    prisma.transaction.aggregate({
      where: { status: "PAID", createdAt: { gte: todayStart } },
      _count: { _all: true },
      _sum: { total: true },
    }),
    prisma.transaction.aggregate({
      where: { status: "PAID", createdAt: { gte: monthStart } },
      _sum: { total: true },
    }),
    prisma.transaction.aggregate({
      where: { status: "PAID" },
      _count: { _all: true },
      _sum: { total: true },
    }),
    prisma.transaction.findMany({
      where: { status: "PAID", createdAt: { gte: since } },
      select: { createdAt: true, total: true },
    }),
    prisma.product.findMany({
      where: { status: "ACTIVE", stock: { lte: LOW_STOCK_THRESHOLD } },
      orderBy: { stock: "asc" },
      take: 6,
      select: { id: true, code: true, name: true, brand: true, size: true, stock: true },
    }),
    prisma.transactionDetail.groupBy({
      by: ["productId"],
      where: { transaction: { status: "PAID" } },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
    prisma.transaction.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        user: { select: { name: true } },
        member: { select: { name: true } },
      },
    }),
  ]);

  const topIds = topGroups.map((g) => g.productId);
  const topProductRows =
    topIds.length > 0
      ? await prisma.product.findMany({
          where: { id: { in: topIds } },
          select: { id: true, name: true, brand: true, size: true, image: true },
        })
      : [];

  const topProducts: TopProduct[] = [];
  for (const group of topGroups) {
    const product = topProductRows.find((p) => p.id === group.productId);
    if (product) {
      topProducts.push({ ...product, sold: group._sum?.quantity ?? 0 });
    }
  }

  const lowStock: LowStockItem[] = lowStockRows;

  const recentTransactions: TransactionRow[] = recentRows.map((t) => ({
    id: t.id,
    invoiceNumber: t.invoiceNumber,
    createdAt: t.createdAt,
    total: t.total,
    status: t.status,
    cashier: t.user.name,
    member: t.member?.name ?? null,
  }));

  return {
    productCount,
    totalStock: stockAgg._sum?.stock ?? 0,
    memberCount,
    kasirCount,
    todayCount: todayAgg._count?._all ?? 0,
    todayRevenue: todayAgg._sum?.total ?? 0,
    monthRevenue: monthAgg._sum?.total ?? 0,
    totalRevenue: totalAgg._sum?.total ?? 0,
    totalTransactions: totalAgg._count?._all ?? 0,
    series: buildDailySeries(recentSales, 30),
    lowStock,
    topProducts,
    recentTransactions,
  };
}

export async function getKasirDashboardData(userId: number) {
  const todayStart = startOfDay(new Date());

  const [todayAgg, soldAgg, totalCount, recentRows] = await Promise.all([
    prisma.transaction.aggregate({
      where: { userId, status: "PAID", createdAt: { gte: todayStart } },
      _count: { _all: true },
      _sum: { total: true },
    }),
    prisma.transactionDetail.aggregate({
      where: {
        transaction: { userId, status: "PAID", createdAt: { gte: todayStart } },
      },
      _sum: { quantity: true },
    }),
    prisma.transaction.count({ where: { userId } }),
    prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { member: { select: { name: true } } },
    }),
  ]);

  const recentTransactions: TransactionRow[] = recentRows.map((t) => ({
    id: t.id,
    invoiceNumber: t.invoiceNumber,
    createdAt: t.createdAt,
    total: t.total,
    status: t.status,
    member: t.member?.name ?? null,
  }));

  return {
    todayCount: todayAgg._count?._all ?? 0,
    todayRevenue: todayAgg._sum?.total ?? 0,
    todayItemsSold: soldAgg._sum?.quantity ?? 0,
    totalCount,
    recentTransactions,
  };
}
