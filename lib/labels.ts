import type { BadgeVariant } from "@/components/ui/Badge";

export function transactionStatusMeta(
  status: "PENDING" | "PAID" | "CANCELLED"
): { label: string; variant: BadgeVariant } {
  switch (status) {
    case "PAID":
      return { label: "Lunas", variant: "success" };
    case "PENDING":
      return { label: "Pending", variant: "warning" };
    default:
      return { label: "Dibatalkan", variant: "danger" };
  }
}

export const paymentMethodLabels = {
  CASH: "Cash",
  QRIS: "QRIS",
  TRANSFER: "Transfer",
  EWALLET: "E-Wallet",
  DEBIT: "Debit",
} as const;
