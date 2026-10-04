"use client";

import Link from "next/link";
import { FileDown, Printer, ShoppingCart } from "lucide-react";
import { toastSuccess } from "@/lib/notify";

export default function ReceiptActions({ backHref }: { backHref: string }) {
  return (
    <div className="mb-6 flex flex-wrap gap-2 print:hidden">
      <button type="button" className="btn-primary" onClick={() => window.print()}>
        <Printer size={16} /> Cetak Struk
      </button>
      <button
        type="button"
        className="btn-outline"
        onClick={() => {
          toastSuccess("Pilih tujuan \"Save as PDF\" pada dialog cetak.");
          setTimeout(() => window.print(), 600);
        }}
      >
        <FileDown size={16} /> Download PDF
      </button>
      <Link href="/kasir/pos" className="btn-gold">
        <ShoppingCart size={16} /> Transaksi Baru
      </Link>
      <Link href={backHref} className="btn-outline">Riwayat</Link>
    </div>
  );
}
