import { prisma } from "@/lib/prisma";
import { parseProductSearch, type SearchParams } from "@/lib/product-query";
import { formatDate } from "@/lib/utils";
import PageHeader from "@/components/ui/PageHeader";
import Badge, { type BadgeVariant } from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import ProductFilterForm from "@/components/product/ProductFilterForm";
import StockManager from "@/components/stock/StockManager";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 10;

const typeMeta: Record<string, { label: string; variant: BadgeVariant }> = {
  IN: { label: "Masuk", variant: "success" },
  OUT: { label: "Keluar", variant: "warning" },
  ADJUSTMENT: { label: "Koreksi", variant: "gold" },
  SALE: { label: "Penjualan", variant: "neutral" },
};

export default async function StockPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { q, stock, categoryId, page, where } = parseProductSearch(await searchParams);

  const [total, products, categories, histories] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({ where, orderBy: [{ stock: "asc" }, { name: "asc" }], skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.stockHistory.findMany({
      orderBy: { createdAt: "desc" },
      take: 25,
      include: { product: { select: { name: true } }, user: { select: { name: true } } },
    }),
  ]);

  return (
    <>
      <PageHeader title="Stok" description="Pantau dan ubah stok barang" />
      <ProductFilterForm basePath="/admin/stock" q={q} categoryId={categoryId} stock={stock} categories={categories} />
      <StockManager
        products={products.map((p) => ({ id: p.id, name: p.name, brand: p.brand, code: p.code, stock: p.stock, image: p.image }))}
      />
      <Pagination
        page={page}
        totalPages={Math.max(1, Math.ceil(total / PAGE_SIZE))}
        basePath="/admin/stock"
        params={{ q: q || undefined, category: categoryId ? String(categoryId) : undefined, stock: stock || undefined }}
      />

      <h2 className="mb-3 mt-10 font-serif text-xl text-brown-900">Riwayat Stok Terbaru</h2>
      <div className="card overflow-hidden">
        {histories.length === 0 ? (
          <EmptyState title="Belum ada riwayat stok." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-cream-100 text-left text-xs uppercase tracking-wide text-brown-500">
                <tr>
                  <th className="px-4 py-3">Waktu</th>
                  <th className="px-4 py-3">Barang</th>
                  <th className="px-4 py-3">Jenis</th>
                  <th className="px-4 py-3">Jumlah</th>
                  <th className="px-4 py-3">Stok</th>
                  <th className="hidden px-4 py-3 md:table-cell">Keterangan</th>
                  <th className="hidden px-4 py-3 md:table-cell">Oleh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-beige-100">
                {histories.map((h) => {
                  const m = typeMeta[h.type];
                  return (
                    <tr key={h.id}>
                      <td className="whitespace-nowrap px-4 py-3 text-brown-500">{formatDate(h.createdAt, true)}</td>
                      <td className="px-4 py-3 font-medium text-brown-900">{h.product.name}</td>
                      <td className="px-4 py-3"><Badge variant={m.variant}>{m.label}</Badge></td>
                      <td className="px-4 py-3">{h.quantity}</td>
                      <td className="whitespace-nowrap px-4 py-3">{h.beforeStock} → {h.afterStock}</td>
                      <td className="hidden px-4 py-3 text-brown-500 md:table-cell">{h.description ?? "-"}</td>
                      <td className="hidden px-4 py-3 text-brown-500 md:table-cell">{h.user?.name ?? "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
