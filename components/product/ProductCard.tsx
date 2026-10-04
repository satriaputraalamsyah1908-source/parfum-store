import Badge from "@/components/ui/Badge";
import ProductImage from "@/components/ui/ProductImage";
import { stockStatus } from "@/lib/stock";
import { formatRupiah } from "@/lib/utils";

export type CatalogProduct = {
  id: number;
  code: string;
  barcode: string;
  name: string;
  brand: string;
  size: string;
  sellingPrice: number;
  stock: number;
  image: string | null;
  categoryName: string;
};

export default function ProductCard({ product }: { product: CatalogProduct }) {
  const status = stockStatus(product.stock);

  return (
    <article className="card flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md">
      <ProductImage
        src={product.image}
        name={product.name}
        className="aspect-square w-full rounded-none"
      />
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs uppercase tracking-wide text-brown-300">{product.brand}</p>
        <h3 className="mt-0.5 font-medium leading-snug text-brown-900">{product.name}</h3>
        <p className="mt-0.5 text-xs text-brown-500">
          {product.size} · {product.categoryName}
        </p>

        <div className="mt-auto pt-4">
          <p className="text-lg font-semibold text-brown-900">{formatRupiah(product.sellingPrice)}</p>
          <div className="mt-2 flex items-center justify-between gap-2">
            <Badge variant={status.variant}>{status.label}</Badge>
            <span className="text-xs text-brown-500">Stok: {product.stock}</span>
          </div>
          <p className="mt-2 font-mono text-[11px] text-brown-300">{product.barcode}</p>
        </div>
      </div>
    </article>
  );
}
