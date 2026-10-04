import Link from "next/link";
import { Download, FileBarChart } from "lucide-react";
import { getReport, resolveRange } from "@/lib/reports";
import type { SearchParams } from "@/lib/product-query";
import { formatDate, formatNumber, formatRupiah } from "@/lib/utils";
import { paymentSummary, type PaymentMethodKey } from "@/lib/payments";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import PrintButton from "@/components/report/PrintButton";
import { cn } from "@/lib/utils";

type Props = { searchParams: SearchParams; area: "admin" | "kasir"; scopeUserId?: number };

const tabs = [
  { key: "today", label: "Hari ini" },
  { key: "week", label: "Minggu ini" },
  { key: "month", label: "Bulan ini" },
] as const;

function methodLabel(key: string): string {
  const [m, p] = key.split("|");
  return paymentSummary(m as PaymentMethodKey, p ?? null);
}

export default async function ReportView({ searchParams, area, scopeUserId }: Props) {
  const range = resolveRange(searchParams);
  const { transactions, summary, topProducts, methods } = await getReport(range, scopeUserId);
  const basePath = `/${area}/reports`;
  const exportHref = `/api/reports/export?range=${range.key}&from=${range.fromStr}&to=${range.toStr}`;
  const periode = range.fromStr === range.toStr ? formatDate(range.from) : `${formatDate(range.from)} - ${formatDate(new Date(range.to.getTime() - 1))}`;
  const SHOW = 200;

  return (
    <>
      <div className="print:hidden">
        <PageHeader
          title="Laporan Penjualan"
          description={scopeUserId ? "Transaksi Anda sendiri" : "Semua transaksi lunas"}
          action={
            <div className="flex gap-2">
              <PrintButton />
              <a href={exportHref} className="btn-outline"><Download size={16} /> Export Excel (CSV)</a>
            </div>
          }
        />

        <div className="card mb-6 flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
          <div className="flex flex-wrap gap-2">
            {tabs.map((t) => (
              <Link
                key={t.key}
                href={`${basePath}?range=${t.key}`}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm transition",
                  range.key === t.key ? "border-brown-700 bg-brown-700 text-cream-50" : "border-beige-200 bg-white text-brown-700 hover:bg-beige-100"
                )}
              >
                {t.label}
              </Link>
            ))}
          </div>
          <form method="get" action={basePath} className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center lg:justify-end">
            <input type="hidden" name="range" value="custom" />
            <input type="date" name="from" defaultValue={range.fromStr} className="input sm:w-44" aria-label="Dari tanggal" />
            <span className="hidden text-brown-300 sm:inline">s/d</span>
            <input type="date" name="to" defaultValue={range.toStr} className="input sm:w-44" aria-label="Sampai tanggal" />
            <button type="submit" className={cn("btn-primary", range.key === "custom" && "ring-2 ring-gold-400")}>Terapkan</button>
          </form>
        </div>
      </div>

      <div className="hidden print:block">
        <h1 className="font-serif text-2xl">Laporan Penjualan</h1>
        <p className="text-sm">Periode: {periode}</p>
      </div>
      <p className="mb-4 text-sm text-brown-500 print:hidden">Periode: <b className="text-brown-900">{periode}</b></p>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total transaksi", value: formatNumber(summary.count) },
          { label: "Barang terjual", value: formatNumber(summary.items) },
          { label: "Total diskon", value: formatRupiah(summary.discount) },
          { label: "Pendapatan", value: formatRupiah(summary.revenue) },
        ].map((c) => (
          <div key={c.label} className="card p-5">
            <p className="text-sm text-brown-500">{c.label}</p>
            <p className="mt-1 font-serif text-2xl text-brown-900">{c.value}</p>
          </div>
        ))}
      </div>

      {transactions.length === 0 ? (
        <div className="card">
          <EmptyState icon={FileBarChart} title="Tidak ada transaksi pada periode ini." description="Coba pilih periode lain." />
        </div>
      ) : (
        <>
          <div className="mb-6 grid gap-4 lg:grid-cols-2">
            <div className="card p-5">
              <h2 className="mb-3 font-serif text-lg text-brown-900">Produk Terlaris</h2>
              <ul className="divide-y divide-beige-100 text-sm">
                {topProducts.map((p, i) => (
                  <li key={i} className="flex items-center justify-between gap-3 py-2">
                    <span><b>{i + 1}.</b> {p.name} <span className="text-brown-300">· {p.brand}</span></span>
                    <span className="whitespace-nowrap font-medium">{p.qty} pcs</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card p-5">
              <h2 className="mb-3 font-serif text-lg text-brown-900">Metode Pembayaran</h2>
              <ul className="divide-y divide-beige-100 text-sm">
                {methods.map((m) => (
                  <li key={m.key} className="flex items-center justify-between gap-3 py-2">
                    <span>{methodLabel(m.key)} <span className="text-brown-300">· {m.count}x</span></span>
                    <span className="font-medium">{formatRupiah(m.amount)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="bg-cream-100 text-left text-xs uppercase tracking-wide text-brown-500">
                  <tr>
                    <th className="px-4 py-3">Invoice</th>
                    <th className="px-4 py-3">Waktu</th>
                    {!scopeUserId && <th className="px-4 py-3">Kasir</th>}
                    <th className="px-4 py-3">Pembayaran</th>
                    <th className="px-4 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-beige-100">
                  {transactions.slice(0, SHOW).map((t) => (
                    <tr key={t.id}>
                      <td className="px-4 py-2.5 font-medium">{t.invoiceNumber}</td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-brown-500">{formatDate(t.createdAt, true)}</td>
                      {!scopeUserId && <td className="px-4 py-2.5">{t.user.name}</td>}
                      <td className="px-4 py-2.5">{paymentSummary(t.paymentMethod as PaymentMethodKey, t.paymentProvider)}</td>
                      <td className="px-4 py-2.5 text-right font-medium">{formatRupiah(t.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {transactions.length > SHOW && (
              <p className="border-t border-beige-100 px-4 py-3 text-xs text-brown-500">
                Menampilkan {SHOW} dari {transactions.length} transaksi. Gunakan Export untuk data lengkap.
              </p>
            )}
          </div>
        </>
      )}
    </>
  );
}
