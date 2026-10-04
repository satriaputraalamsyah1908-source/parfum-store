"use client";

import { useEffect, useMemo, useState } from "react";
import { Banknote, Building2, CreditCard, Loader2, QrCode, Wallet } from "lucide-react";
import Modal from "@/components/ui/Modal";
import FormField from "@/components/ui/FormField";
import { paymentMethodOptions, paymentProviders, providerRequired, type PaymentMethodKey } from "@/lib/payments";
import { cn, formatRupiah } from "@/lib/utils";

export type PaymentPayload = {
  paymentMethod: PaymentMethodKey;
  paymentProvider: string | null;
  paymentReference: string | null;
  paymentAmount: number;
};

type Props = {
  open: boolean;
  total: number;
  loading: boolean;
  onClose: () => void;
  onConfirm: (p: PaymentPayload) => void;
};

const icons: Record<PaymentMethodKey, typeof Banknote> = {
  CASH: Banknote,
  QRIS: QrCode,
  EWALLET: Wallet,
  TRANSFER: Building2,
  DEBIT: CreditCard,
};

export default function PaymentModal({ open, total, loading, onClose, onConfirm }: Props) {
  const [method, setMethod] = useState<PaymentMethodKey>("CASH");
  const [provider, setProvider] = useState("");
  const [reference, setReference] = useState("");
  const [cash, setCash] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setMethod("CASH");
      setProvider("");
      setReference("");
      setCash("");
      setError("");
    }
  }, [open]);

  const cashNumber = Number(cash) || 0;
  const change = cashNumber - total;
  const providers = paymentProviders[method];

  const quick = useMemo(() => {
    const round = (step: number) => Math.ceil(total / step) * step;
    return Array.from(new Set([round(10000), round(50000), round(100000), round(500000)])).filter((v) => v >= total);
  }, [total]);

  function submit() {
    setError("");
    if (providerRequired(method) && !provider) {
      setError(method === "EWALLET" ? "Pilih e-wallet terlebih dahulu." : "Pilih bank terlebih dahulu.");
      return;
    }
    if (method === "CASH" && cashNumber < total) {
      setError("Nominal pembayaran tidak mencukupi.");
      return;
    }
    onConfirm({
      paymentMethod: method,
      paymentProvider: provider || null,
      paymentReference: reference.trim() || null,
      paymentAmount: method === "CASH" ? cashNumber : total,
    });
  }

  const opt = paymentMethodOptions.find((o) => o.value === method);

  return (
    <Modal open={open} onClose={loading ? () => {} : onClose} title="Pembayaran" size="md">
      <div className="space-y-5">
        <div className="rounded-xl bg-brown-900 p-4 text-center text-cream-50">
          <p className="text-xs uppercase tracking-wider text-beige-300">Total bayar</p>
          <p className="font-serif text-3xl">{formatRupiah(total)}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {paymentMethodOptions.map((o) => {
            const Icon = icons[o.value];
            const active = method === o.value;
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => {
                  setMethod(o.value);
                  setProvider("");
                  setError("");
                }}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-sm transition",
                  active ? "border-gold-500 bg-gold-300/20 font-medium text-brown-900" : "border-beige-200 text-brown-700 hover:bg-beige-100"
                )}
              >
                <Icon size={20} />
                {o.label}
              </button>
            );
          })}
        </div>

        {providers.length > 0 && (
          <FormField label={opt?.providerLabel ?? "Provider"} htmlFor="provider">
            <select id="provider" className="input" value={provider} onChange={(e) => setProvider(e.target.value)}>
              <option value="">-- Pilih --</option>
              {providers.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </FormField>
        )}

        {method === "CASH" ? (
          <div className="space-y-3">
            <FormField label="Uang diterima (Rp)" htmlFor="cash">
              <input id="cash" type="number" min={0} inputMode="numeric" className="input text-lg" value={cash} onChange={(e) => setCash(e.target.value)} autoFocus />
            </FormField>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn-outline !px-3 !py-1.5" onClick={() => setCash(String(total))}>Uang pas</button>
              {quick.map((v) => (
                <button key={v} type="button" className="btn-outline !px-3 !py-1.5" onClick={() => setCash(String(v))}>
                  {formatRupiah(v)}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between rounded-xl bg-cream-100 px-4 py-3 text-sm">
              <span className="text-brown-500">Kembalian</span>
              <span className={cn("text-lg font-semibold", change < 0 ? "text-red-600" : "text-emerald-700")}>
                {change < 0 ? "Kurang " + formatRupiah(-change) : formatRupiah(change)}
              </span>
            </div>
          </div>
        ) : (
          <>
            {method === "QRIS" && (
              <p className="rounded-xl bg-cream-100 p-3 text-sm text-brown-500">
                Minta pelanggan scan QRIS toko, pastikan pembayaran masuk, lalu tekan Selesaikan. Sistem hanya mencatat metode pembayaran.
              </p>
            )}
            <FormField label="No. referensi / catatan (opsional)" htmlFor="ref">
              <input id="ref" className="input" value={reference} onChange={(e) => setReference(e.target.value)} maxLength={60} />
            </FormField>
          </>
        )}

        {error && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <div className="flex justify-end gap-2">
          <button type="button" className="btn-outline" onClick={onClose} disabled={loading}>Batal</button>
          <button type="button" className="btn-gold" onClick={submit} disabled={loading}>
            {loading && <Loader2 size={16} className="animate-spin" />} Selesaikan
          </button>
        </div>
      </div>
    </Modal>
  );
}
