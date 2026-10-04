import { SearchX } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { parseProductSearch, type SearchParams } from "@/lib/product-query";
import ProductFilterForm from "@/components/product/ProductFilterForm";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import ProductCard from "@/components/product/ProductCard";

const PAGE_SIZE = 12;

type Props = {
  searchParams: Promise<SearchParams>;
  basePath: string;
};

export default async function ProductCatalog({ searchParams, basePath }: Props) {
  const sp = await searchParams;
  const { q, stock: stockFilter, categoryId, page, where } = parseProductSearch(sp);

  const [total, products, categories] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: { name: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { category: { select: { name: true } } },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <PageHeader
        title="Data Barang"
        description={`Katalog parfum · ${total} produk ditemukan`}
      />

      <ProductFilterForm basePath={basePath} q={q} categoryId={categoryId} stock={stockFilter} categories={categories} />

      {products.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={SearchX}
            title="Produk tidak ditemukan."
            description="Coba ubah kata kunci atau filter pencarian."
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={{
                id: p.id,
                code: p.code,
                barcode: p.barcode,
                name: p.name,
                brand: p.brand,
                size: p.size,
                sellingPrice: p.sellingPrice,
                stock: p.stock,
                image: p.image,
                categoryName: p.category.name,
              }}
            />
          ))}
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        basePath={basePath}
        params={{
          q: q || undefined,
          category: categoryId ? String(categoryId) : undefined,
          stock: stockFilter || undefined,
        }}
      />
    </>
  );
}
