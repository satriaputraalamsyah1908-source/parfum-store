import ProductCatalog from "@/components/product/ProductCatalog";

export const dynamic = "force-dynamic";

export default function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <ProductCatalog searchParams={searchParams} basePath="/kasir/products" />;
}
