import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import CategoryManager from "@/components/category/CategoryManager";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const [cats, counts] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.groupBy({ by: ["categoryId"], _count: { _all: true } }),
  ]);
  const map = new Map(counts.map((c) => [c.categoryId, c._count._all]));

  return (
    <>
      <PageHeader title="Kategori" description="Kelompokkan barang berdasarkan jenis aroma" />
      <CategoryManager
        categories={cats.map((c) => ({
          id: c.id,
          name: c.name,
          description: c.description,
          productCount: map.get(c.id) ?? 0,
        }))}
      />
    </>
  );
}
