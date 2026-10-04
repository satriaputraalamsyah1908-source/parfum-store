import { STORE } from "@/lib/constants";
import { formatDate, formatRupiah } from "@/lib/utils";
import { paymentSummary, type PaymentMethodKey } from "@/lib/payments";

export type ReceiptData = {
  invoiceNumber: string;
  createdAt: Date;
  cashier: string;
  member: string | null;
  items: { name: string; size: string; quantity: number; price: number; subtotal: number }[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethodKey;
  paymentProvider: string | null;
  reference: string | null;
  paymentAmount: number;
  changeAmount: number;
};

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between gap-2 ${bold ? "font-bold" : ""}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

export default function Receipt({ data }: { data: ReceiptData }) {
  const dash = <div className="my-2 border-t border-dashed border-brown-900/60" />;
  return (
    <div className="mx-auto w-full max-w-[320px] bg-white p-4 font-mono text-[12px] leading-relaxed text-black shadow-soft print:max-w-none print:w-[80mm] print:p-3 print:shadow-none">
      <div className="text-center">
        <p className="text-base font-bold uppercase">{STORE.name}</p>
        <p>{STORE.address}</p>
        <p>Telp. {STORE.phone}</p>
      </div>
      {dash}
      <Row label="No" value={data.invoiceNumber} />
      <Row label="Tanggal" value={formatDate(data.createdAt, true)} />
      <Row label="Kasir" value={data.cashier} />
      <Row label="Member" value={data.member ?? "Non-member"} />
      {dash}
      {data.items.map((it, i) => (
        <div key={i} className="mb-1.5">
          <p>{it.name} ({it.size})</p>
          <div className="flex justify-between">
            <span>{it.quantity} x {formatRupiah(it.price)}</span>
            <span>{formatRupiah(it.subtotal)}</span>
          </div>
        </div>
      ))}
      {dash}
      <Row label="Subtotal" value={formatRupiah(data.subtotal)} />
      {data.discount > 0 && <Row label="Diskon" value={`- ${formatRupiah(data.discount)}`} />}
      <Row label="TOTAL" value={formatRupiah(data.total)} bold />
      {dash}
      <Row label="Pembayaran" value={paymentSummary(data.paymentMethod, data.paymentProvider)} />
      {data.reference && <Row label="Ref" value={data.reference} />}
      <Row label="Bayar" value={formatRupiah(data.paymentAmount)} />
      <Row label="Kembali" value={formatRupiah(data.changeAmount)} />
      {dash}
      <p className="text-center">Terima kasih atas kunjungan Anda</p>
      <p className="text-center">Barang yang sudah dibeli tidak dapat ditukar</p>
    </div>
  );
}
