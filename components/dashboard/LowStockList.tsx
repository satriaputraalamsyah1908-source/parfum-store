import Link from "next/link";
import { PackageCheck } from "lucide-react";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { stockStatus } from "@/lib/stock";
import type { LowStockItem } from "@/lib/types";

type Props = {
  items: LowStockItem[];
  viewAllHref?: string;
};

export default function LowStockList({ items, viewAllHref }: Props) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4">
        <h3 className="font-medium text-brown-900">Stok Menipis</h3>
        {viewAllHref && (
          <Link href={viewAllHref} className="text-sm font-medium text-gold-600 hover:text-gold-500">
            Lihat barang
          </Link>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={PackageCheck}
          title="Semua stok aman"
          description="Tidak ada produk dengan stok menipis."
        />
      ) : (
        <ul className="divide-y divide-beige-100">
          {items.map((item) => {
            const status = stockStatus(item.stock);
            return (
              <li key={item.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-brown-900">{item.name}</p>
                  <p className="truncate text-xs text-brown-500">
                    {item.brand} · {item.size}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-sm font-semibold text-brown-900">{item.stock}</span>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
