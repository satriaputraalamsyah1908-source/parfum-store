import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import PosClient from "@/components/pos/PosClient";

export const dynamic = "force-dynamic";

export default async function PosPage() {
  const [products, categories, members] = await Promise.all([
    prisma.product.findMany({ where: { status: "ACTIVE" }, orderBy: { name: "asc" }, take: 1000 }),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.member.findMany({
      where: { status: "ACTIVE" },
      orderBy: { name: "asc" },
      select: { id: true, name: true, phone: true, memberCode: true },
    }),
  ]);

  return (
    <>
      <PageHeader title="Kasir" description="Scan barcode atau pilih barang, lalu bayar" />
      <PosClient
        products={products.map((p) => ({
          id: p.id,
          code: p.code,
          barcode: p.barcode,
          name: p.name,
          brand: p.brand,
          size: p.size,
          sellingPrice: p.sellingPrice,
          stock: p.stock,
          image: p.image,
          categoryId: p.categoryId,
        }))}
        categories={categories}
        members={members}
      />
    </>
  );
}
