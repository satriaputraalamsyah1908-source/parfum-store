"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Boxes, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import FormField from "@/components/ui/FormField";
import Badge from "@/components/ui/Badge";
import ProductImage from "@/components/ui/ProductImage";
import StockAdjustModal, { type StockTarget } from "@/components/stock/StockAdjustModal";
import { deleteProduct, saveProduct } from "@/app/actions/products";
import { confirmDialog, toastError, toastSuccess } from "@/lib/notify";
import { stockStatus } from "@/lib/stock";
import { formatRupiah } from "@/lib/utils";

export type ManagedProduct = {
  id: number;
  code: string;
  barcode: string;
  name: string;
  brand: string;
  categoryId: number;
  categoryName: string;
  size: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  unit: string;
  description: string | null;
  image: string | null;
  status: "ACTIVE" | "INACTIVE";
};

type Props = {
  products: ManagedProduct[];
  categories: { id: number; name: string }[];
};

export default function ProductManager({ products, categories }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ManagedProduct | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState<string | null>(null);
  const [stockTarget, setStockTarget] = useState<StockTarget | null>(null);

  function openForm(p: ManagedProduct | null) {
    setEditing(p);
    setErrors({});
    setPreview(null);
    setOpen(true);
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (editing) fd.set("id", String(editing.id));
    start(async () => {
      const res = await saveProduct(fd);
      if (res.ok) {
        toastSuccess(res.message ?? "Tersimpan.");
        setOpen(false);
        router.refresh();
      } else {
        setErrors(res.errors ?? {});
        toastError(res.message);
      }
    });
  }

  async function remove(p: ManagedProduct) {
    const yes = await confirmDialog({
      title: `Hapus ${p.name}?`,
      text: "Barang yang pernah dipakai transaksi tidak bisa dihapus.",
      confirmText: "Ya, hapus",
    });
    if (!yes) return;
    const res = await deleteProduct(p.id);
    if (res.ok) {
      toastSuccess(res.message ?? "Dihapus.");
      router.refresh();
    } else toastError(res.message);
  }

  const e = (k: string) => errors[k];

  return (
    <>
      <div className="mb-4 flex justify-end">
        <button type="button" className="btn-primary" onClick={() => openForm(null)}>
          <Plus size={16} /> Tambah Barang
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-cream-100 text-left text-xs uppercase tracking-wide text-brown-500">
              <tr>
                <th className="px-4 py-3">Barang</th>
                <th className="hidden px-4 py-3 md:table-cell">Kategori</th>
                <th className="px-4 py-3">Harga Jual</th>
                <th className="hidden px-4 py-3 lg:table-cell">Harga Beli</th>
                <th className="px-4 py-3">Stok</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-beige-100">
              {products.map((p) => {
                const st = stockStatus(p.stock);
                return (
                  <tr key={p.id} className="hover:bg-cream-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <ProductImage src={p.image} name={p.name} className="h-12 w-12 shrink-0" />
                        <div>
                          <p className="font-medium text-brown-900">{p.name}</p>
                          <p className="text-xs text-brown-500">{p.brand} · {p.size}</p>
                          <p className="font-mono text-[11px] text-brown-300">{p.code} · {p.barcode}</p>
                          {p.status === "INACTIVE" && <Badge variant="neutral" className="mt-1">Nonaktif</Badge>}
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">{p.categoryName}</td>
                    <td className="px-4 py-3 font-medium">{formatRupiah(p.sellingPrice)}</td>
                    <td className="hidden px-4 py-3 lg:table-cell">{formatRupiah(p.costPrice)}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{p.stock}</p>
                      <Badge variant={st.variant}>{st.label}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button type="button" title="Ubah stok" className="rounded-lg p-2 text-brown-500 hover:bg-beige-100" onClick={() => setStockTarget({ id: p.id, name: p.name, brand: p.brand, stock: p.stock })}>
                          <Boxes size={16} />
                        </button>
                        <button type="button" title="Edit" className="rounded-lg p-2 text-brown-500 hover:bg-beige-100" onClick={() => openForm(p)}>
                          <Pencil size={16} />
                        </button>
                        <button type="button" title="Hapus" className="rounded-lg p-2 text-red-600 hover:bg-red-50" onClick={() => remove(p)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit Barang" : "Tambah Barang"} size="lg">
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2" key={editing?.id ?? "new"}>
          <FormField label="Nama barang" htmlFor="pname" error={e("name")} className="sm:col-span-2">
            <input id="pname" name="name" className="input" defaultValue={editing?.name} required />
          </FormField>
          <FormField label="Brand" htmlFor="pbrand" error={e("brand")}>
            <input id="pbrand" name="brand" className="input" defaultValue={editing?.brand} required />
          </FormField>
          <FormField label="Kategori" htmlFor="pcat" error={e("categoryId")}>
            <select id="pcat" name="categoryId" className="input" defaultValue={editing?.categoryId ?? ""} required>
              <option value="">Pilih kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Kode barang" htmlFor="pcode" error={e("code")} hint="Kosongkan untuk dibuat otomatis">
            <input id="pcode" name="code" className="input" defaultValue={editing?.code} />
          </FormField>
          <FormField label="Barcode" htmlFor="pbar" error={e("barcode")} hint="Kosongkan untuk dibuat otomatis">
            <input id="pbar" name="barcode" className="input" defaultValue={editing?.barcode} inputMode="numeric" />
          </FormField>
          <FormField label="Ukuran" htmlFor="psize" error={e("size")}>
            <input id="psize" name="size" className="input" placeholder="100 ml" defaultValue={editing?.size} required />
          </FormField>
          <FormField label="Satuan" htmlFor="punit" error={e("unit")}>
            <input id="punit" name="unit" className="input" defaultValue={editing?.unit ?? "pcs"} />
          </FormField>
          <FormField label="Harga beli (Rp)" htmlFor="pcost" error={e("costPrice")}>
            <input id="pcost" name="costPrice" type="number" min={0} className="input" defaultValue={editing?.costPrice} required />
          </FormField>
          <FormField label="Harga jual (Rp)" htmlFor="psell" error={e("sellingPrice")}>
            <input id="psell" name="sellingPrice" type="number" min={0} className="input" defaultValue={editing?.sellingPrice} required />
          </FormField>
          {!editing && (
            <FormField label="Stok awal" htmlFor="pstock" error={e("stock")}>
              <input id="pstock" name="stock" type="number" min={0} className="input" defaultValue={0} />
            </FormField>
          )}
          <FormField label="Status" htmlFor="pstatus">
            <select id="pstatus" name="status" className="input" defaultValue={editing?.status ?? "ACTIVE"}>
              <option value="ACTIVE">Aktif</option>
              <option value="INACTIVE">Nonaktif</option>
            </select>
          </FormField>
          <FormField label="Deskripsi" htmlFor="pdesc" error={e("description")} className="sm:col-span-2">
            <textarea id="pdesc" name="description" rows={2} className="input" defaultValue={editing?.description ?? ""} />
          </FormField>
          <FormField label="Foto produk (JPG/PNG/WEBP, maks 2 MB)" htmlFor="pimg" error={e("image")} className="sm:col-span-2">
            <div className="flex items-center gap-4">
              <ProductImage src={preview ?? editing?.image} name="Pratinjau" className="h-20 w-20 shrink-0" />
              <input
                id="pimg"
                name="image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="text-sm"
                onChange={(ev) => {
                  const f = ev.target.files?.[0];
                  setPreview(f ? URL.createObjectURL(f) : null);
                }}
              />
            </div>
          </FormField>
          <div className="flex justify-end gap-2 pt-2 sm:col-span-2">
            <button type="button" className="btn-outline" onClick={() => setOpen(false)}>Batal</button>
            <button type="submit" disabled={pending} className="btn-primary">
              {pending && <Loader2 size={16} className="animate-spin" />} Simpan
            </button>
          </div>
        </form>
      </Modal>

      <StockAdjustModal product={stockTarget} onClose={() => setStockTarget(null)} />
    </>
  );
}
