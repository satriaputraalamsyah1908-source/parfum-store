import { TrendingUp } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import ProductImage from "@/components/ui/ProductImage";
import { formatNumber } from "@/lib/utils";
import type { TopProduct } from "@/lib/types";

type Props = {
  items: TopProduct[];
};

export default function TopProducts({ items }: Props) {
  return (
    <div className="card p-5">
      <h3 className="mb-4 font-medium text-brown-900">Produk Terlaris</h3>

      {items.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="Belum ada penjualan"
          description="Produk terlaris muncul setelah ada transaksi lunas."
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {items.map((item, index) => (
            <li key={item.id} className="rounded-xl border border-beige-100 p-3">
              <div className="relative">
                <ProductImage src={item.image} name={item.name} className="aspect-square w-full" />
                <span className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-brown-700 text-xs font-semibold text-cream-50">
                  {index + 1}
                </span>
              </div>
              <p className="mt-3 text-xs uppercase tracking-wide text-brown-300">{item.brand}</p>
              <p className="truncate text-sm font-medium text-brown-900">{item.name}</p>
              <p className="mt-1 text-xs text-brown-500">
                Terjual {formatNumber(item.sold)} pcs
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
