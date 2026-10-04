import Link from "next/link";
import { Receipt } from "lucide-react";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { transactionStatusMeta } from "@/lib/labels";
import { formatDate, formatRupiah } from "@/lib/utils";
import type { TransactionRow } from "@/lib/types";

type Props = {
  title: string;
  rows: TransactionRow[];
  showCashier?: boolean;
  viewAllHref?: string;
};

export default function RecentTransactionsTable({
  title,
  rows,
  showCashier = false,
  viewAllHref,
}: Props) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4">
        <h3 className="font-medium text-brown-900">{title}</h3>
        {viewAllHref && (
          <Link href={viewAllHref} className="text-sm font-medium text-gold-600 hover:text-gold-500">
            Lihat semua
          </Link>
        )}
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Belum ada transaksi"
          description="Transaksi yang dibuat akan tampil di sini."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-cream-100 text-xs uppercase tracking-wide text-brown-500">
              <tr>
                <th className="px-5 py-3 font-medium">No. Transaksi</th>
                <th className="px-5 py-3 font-medium">Tanggal</th>
                {showCashier && <th className="px-5 py-3 font-medium">Kasir</th>}
                <th className="px-5 py-3 font-medium">Member</th>
                <th className="px-5 py-3 text-right font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-beige-100">
              {rows.map((row) => {
                const status = transactionStatusMeta(row.status);
                return (
                  <tr key={row.id} className="transition hover:bg-cream-50">
                    <td className="whitespace-nowrap px-5 py-3 font-medium text-brown-900">
                      {row.invoiceNumber}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-brown-500">
                      {formatDate(row.createdAt, true)}
                    </td>
                    {showCashier && <td className="px-5 py-3 text-brown-700">{row.cashier ?? "-"}</td>}
                    <td className="px-5 py-3 text-brown-700">{row.member ?? "Non-Member"}</td>
                    <td className="whitespace-nowrap px-5 py-3 text-right font-medium text-brown-900">
                      {formatRupiah(row.total)}
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
