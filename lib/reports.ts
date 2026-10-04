import { prisma } from "@/lib/prisma";
import { addDays, dateKey, startOfDay } from "@/lib/date";
import { readParam, type SearchParams } from "@/lib/product-query";

export type RangeKey = "today" | "week" | "month" | "custom";

export type Range = {
  key: RangeKey;
  from: Date;
  to: Date; // eksklusif
  fromStr: string;
  toStr: string;
  label: string;
};

function parseDay(v: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
  const [y, m, d] = v.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function resolveRange(sp: SearchParams): Range {
  const raw = readParam(sp, "range");
  const key: RangeKey = raw === "week" || raw === "month" || raw === "custom" ? raw : "today";
  const today = startOfDay(new Date());
  let from = today;
  let to = addDays(today, 1);
  let label = "Hari ini";

  if (key === "week") {
    const dow = (today.getDay() + 6) % 7; // Senin = 0
    from = addDays(today, -dow);
    label = "Minggu ini";
  } else if (key === "month") {
    from = new Date(today.getFullYear(), today.getMonth(), 1);
    to = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    label = "Bulan ini";
  } else if (key === "custom") {
    let a = parseDay(readParam(sp, "from")) ?? today;
    let b = parseDay(readParam(sp, "to")) ?? a;
    if (a > b) [a, b] = [b, a];
    from = a;
    to = addDays(b, 1);
    label = "Rentang tanggal";
  }

  return { key, from, to, fromStr: dateKey(from), toStr: dateKey(addDays(to, -1)), label };
}

export async function getReport(range: Range, scopeUserId?: number) {
  const where = {
    status: "PAID" as const,
    createdAt: { gte: range.from, lt: range.to },
    ...(scopeUserId ? { userId: scopeUserId } : {}),
  };

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true } },
      member: { select: { name: true } },
      details: { include: { product: { select: { name: true, brand: true } } } },
    },
  });

  let revenue = 0;
  let discount = 0;
  let items = 0;
  const top = new Map<string, { name: string; brand: string; qty: number; amount: number }>();
  const methods = new Map<string, { count: number; amount: number }>();

  for (const t of transactions) {
    revenue += t.total;
    discount += t.discount;
    const mKey = t.paymentProvider ? `${t.paymentMethod}|${t.paymentProvider}` : t.paymentMethod;
    const m = methods.get(mKey) ?? { count: 0, amount: 0 };
    m.count += 1;
    m.amount += t.total;
    methods.set(mKey, m);
    for (const d of t.details) {
      items += d.quantity;
      const key = String(d.productId);
      const row = top.get(key) ?? { name: d.product.name, brand: d.product.brand, qty: 0, amount: 0 };
      row.qty += d.quantity;
      row.amount += d.subtotal;
      top.set(key, row);
    }
  }

  return {
    transactions,
    summary: { count: transactions.length, revenue, discount, items },
    topProducts: Array.from(top.values()).sort((a, b) => b.qty - a.qty).slice(0, 5),
    methods: Array.from(methods.entries()).map(([k, v]) => ({ key: k, ...v })),
  };
}
