"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import FormField from "@/components/ui/FormField";
import { adjustStock } from "@/app/actions/products";
import { toastError, toastSuccess } from "@/lib/notify";

export type StockTarget = { id: number; name: string; brand: string; stock: number };

type Props = { product: StockTarget | null; onClose: () => void };

const types = [
  { value: "IN", label: "Stok Masuk (+)" },
  { value: "OUT", label: "Stok Keluar (-)" },
  { value: "ADJUSTMENT", label: "Koreksi (set jumlah akhir)" },
] as const;

export default function StockAdjustModal({ product, onClose }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [type, setType] = useState<"IN" | "OUT" | "ADJUSTMENT">("IN");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function close() {
    setQuantity("");
    setNote("");
    setErrors({});
    setType("IN");
    onClose();
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!product) return;
    start(async () => {
      const res = await adjustStock({
        productId: product.id,
        type,
        quantity: Number(quantity),
        description: note,
      });
      if (res.ok) {
        toastSuccess(res.message ?? "Stok diperbarui.");
        close();
        router.refresh();
      } else {
        setErrors(res.errors ?? {});
        toastError(res.message);
      }
    });
  }

  const preview =
    product && quantity !== "" && Number.isFinite(Number(quantity))
      ? type === "IN"
        ? product.stock + Number(quantity)
        : type === "OUT"
          ? product.stock - Number(quantity)
          : Number(quantity)
      : null;

  return (
    <Modal open={!!product} onClose={close} title="Ubah Stok" size="sm">
      {product && (
        <form onSubmit={submit} className="space-y-4">
          <div className="rounded-xl bg-cream-100 p-3 text-sm">
            <p className="font-medium text-brown-900">{product.name}</p>
            <p className="text-brown-500">{product.brand} · Stok saat ini: <b>{product.stock}</b></p>
          </div>
          <FormField label="Jenis perubahan" htmlFor="stype">
            <select id="stype" className="input" value={type} onChange={(e) => setType(e.target.value as typeof type)}>
              {types.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </FormField>
          <FormField label={type === "ADJUSTMENT" ? "Jumlah stok akhir" : "Jumlah"} htmlFor="sqty" error={errors.quantity}>
            <input id="sqty" type="number" min={0} className="input" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
          </FormField>
          {preview !== null && (
            <p className={`text-sm ${preview < 0 ? "text-red-600" : "text-brown-500"}`}>
              Stok setelah perubahan: <b>{preview}</b>
            </p>
          )}
          <FormField label="Keterangan (opsional)" htmlFor="snote" error={errors.description}>
            <input id="snote" className="input" value={note} onChange={(e) => setNote(e.target.value)} maxLength={255} />
          </FormField>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={close} className="btn-outline">Batal</button>
            <button type="submit" disabled={pending} className="btn-primary">
              {pending && <Loader2 size={16} className="animate-spin" />} Simpan
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
