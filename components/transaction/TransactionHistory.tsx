import Link from "next/link";
import { Printer, Receipt as ReceiptIcon } from "lucide-react";
import { getTransactionList } from "@/lib/transactions";
import type { SearchParams } from "@/lib/product-query";
import { formatDate, formatRupiah } from "@/lib/utils";
import { transactionStatusMeta } from "@/lib/labels";
import { paymentSummary, type PaymentMethodKey } from "@/lib/payments";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";

type Props = { searchParams: SearchParams; area: "admin" | "kasir"; scopeUserId?: number };

export default async function TransactionHistory({ searchParams, area, scopeUserId }: Props) {
  const { q, from, to, page, total, rows, totalPages } = await getTransactionList(searchParams, scopeUserId);
  const basePath = `/${area}/transactions`;

  return (
    <>
      <PageHeader
        title="Riwayat Transaksi"
        description={scopeUserId ? `${total} transaksi Anda` : `${total} transaksi`}
      />

      <form method="get" action={basePath} className="card mb-6 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[1fr_170px_170px_auto]">
        <input name="q" defaultValue={q} placeholder="Cari no. invoice atau member" className="input" />
        <input type="date" name="from" defaultValue={from} className="input" aria-label="Dari tanggal" />
        <input type="date" name="to" defaultValue={to} className="input" aria-label="Sampai tanggal" />
        <div className="flex gap-2">
          <button type="submit" className="btn-primary flex-1">Filter</button>
          <Link href={basePath} className="btn-outline flex-1">Reset</Link>
        </div>
      </form>

      <div className="card overflow-hidden">
        {rows.length === 0 ? (
          <EmptyState icon={ReceiptIcon} title="Belum ada transaksi." description="Transaksi yang sesuai filter akan tampil di sini." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-cream-100 text-left text-xs uppercase tracking-wide text-brown-500">
                <tr>
                  <th className="px-4 py-3">Invoice</th>
                  <th className="px-4 py-3">Waktu</th>
                  {!scopeUserId && <th className="hidden px-4 py-3 md:table-cell">Kasir</th>}
                  <th className="hidden px-4 py-3 md:table-cell">Member</th>
                  <th className="px-4 py-3">Pembayaran</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Struk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-beige-100">
                {rows.map((t) => {
                  const st = transactionStatusMeta(t.status);
                  return (
                    <tr key={t.id} className="hover:bg-cream-50">
                      <td className="px-4 py-3 font-medium">
                        <Link href={`${basePath}/${t.id}`} className="text-gold-600 hover:underline">{t.invoiceNumber}</Link>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-brown-500">{formatDate(t.createdAt, true)}</td>
                      {!scopeUserId && <td className="hidden px-4 py-3 md:table-cell">{t.user.name}</td>}
                      <td className="hidden px-4 py-3 md:table-cell">{t.member?.name ?? "-"}</td>
                      <td className="px-4 py-3">{paymentSummary(t.paymentMethod as PaymentMethodKey, t.paymentProvider)}</td>
                      <td className="px-4 py-3 font-medium">{formatRupiah(t.total)}</td>
                      <td className="px-4 py-3"><Badge variant={st.variant}>{st.label}</Badge></td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`${basePath}/${t.id}`} title="Lihat / cetak ulang struk" className="inline-flex rounded-lg p-2 text-brown-500 hover:bg-beige-100">
                          <Printer size={16} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} basePath={basePath} params={{ q: q || undefined, from: from || undefined, to: to || undefined }} />
    </>
  );
}
