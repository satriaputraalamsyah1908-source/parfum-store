import type { BadgeVariant } from "@/components/ui/Badge";

export const LOW_STOCK_THRESHOLD = 5;

export function stockStatus(stock: number): { label: string; variant: BadgeVariant } {
  if (stock <= 0) return { label: "Stok Habis", variant: "danger" };
  if (stock <= LOW_STOCK_THRESHOLD) return { label: "Stok Menipis", variant: "warning" };
  return { label: "Stok Aman", variant: "success" };
}
