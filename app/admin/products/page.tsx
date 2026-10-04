import Link from "next/link";
import { LayoutGrid, SearchX } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { parseProductSearch, type SearchParams } from "@/lib/product-query";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import ProductFilterForm from "@/components/product/ProductFilterForm";
import ProductManager from "@/components/product/ProductManager";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 10;

export default async function ProductsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { q, stock, categoryId, page, where } = parseProductSearch(await searchParams);

  const [total, rows, categories] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: { name: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { category: { select: { name: true } } },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  const products = rows.map((p) => ({
    id: p.id,
    code: p.code,
    barcode: p.barcode,
    name: p.name,
    brand: p.brand,
    categoryId: p.categoryId,
    categoryName: p.category.name,
    size: p.size,
    costPrice: p.costPrice,
    sellingPrice: p.sellingPrice,
    stock: p.stock,
    unit: p.unit,
    description: p.description,
    image: p.image,
    status: p.status,
  }));

  return (
    <>
      <PageHeader
        title="Data Barang"
        description={`${total} barang`}
        action={
          <Link href="/admin/products/catalog" className="btn-outline">
            <LayoutGrid size={16} /> Lihat Katalog
          </Link>
        }
      />
      <ProductFilterForm basePath="/admin/products" q={q} categoryId={categoryId} stock={stock} categories={categories} />
      <ProductManager products={products} categories={categories} />
      {products.length === 0 && (
        <div className="card mt-4">
          <EmptyState icon={SearchX} title="Barang tidak ditemukan." description="Ubah filter atau tambah barang baru." />
        </div>
      )}
      <Pagination
        page={page}
        totalPages={Math.max(1, Math.ceil(total / PAGE_SIZE))}
        basePath="/admin/products"
        params={{ q: q || undefined, category: categoryId ? String(categoryId) : undefined, stock: stock || undefined }}
      />
    </>
  );
}
