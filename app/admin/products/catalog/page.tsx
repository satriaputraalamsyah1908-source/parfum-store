import ProductCatalog from "@/components/product/ProductCatalog";
import type { SearchParams } from "@/lib/product-query";

export const dynamic = "force-dynamic";

export default function CatalogPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return <ProductCatalog searchParams={searchParams} basePath="/admin/products/catalog" />;
}
