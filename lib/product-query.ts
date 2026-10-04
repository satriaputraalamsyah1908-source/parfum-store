import { Prisma } from "@prisma/client";
import { LOW_STOCK_THRESHOLD } from "@/lib/stock";

export type SearchParams = Record<string, string | string[] | undefined>;

export function readParam(sp: SearchParams, key: string): string {
  const value = sp[key];
  return ((Array.isArray(value) ? value[0] : value) ?? "").trim();
}

export function parseProductSearch(sp: SearchParams) {
  const q = readParam(sp, "q");
  const stock = readParam(sp, "stock");
  const categoryId = Number(readParam(sp, "category")) || undefined;
  const page = Math.max(1, Math.floor(Number(readParam(sp, "page"))) || 1);

  const where: Prisma.ProductWhereInput = {};
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { brand: { contains: q } },
      { code: { contains: q } },
      { barcode: { contains: q } },
    ];
  }
  if (categoryId) where.categoryId = categoryId;
  if (stock === "out") where.stock = 0;
  if (stock === "low") where.stock = { gt: 0, lte: LOW_STOCK_THRESHOLD };
  if (stock === "ok") where.stock = { gt: LOW_STOCK_THRESHOLD };

  return { q, stock, categoryId, page, where };
}
