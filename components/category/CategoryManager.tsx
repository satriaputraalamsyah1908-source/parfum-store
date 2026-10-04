"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import FormField from "@/components/ui/FormField";
import EmptyState from "@/components/ui/EmptyState";
import { deleteCategory, saveCategory } from "@/app/actions/categories";
import { confirmDialog, toastError, toastSuccess } from "@/lib/notify";

type Cat = { id: number; name: string; description: string | null; productCount: number };

export default function CategoryManager({ categories }: { categories: Cat[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Cat | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function openForm(c: Cat | null) {
    setEditing(c);
    setErrors({});
    setOpen(true);
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const res = await saveCategory(editing?.id ?? null, {
        name: String(fd.get("name") ?? ""),
        description: String(fd.get("description") ?? ""),
      });
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

  async function remove(c: Cat) {
    if (!(await confirmDialog({ title: `Hapus kategori ${c.name}?`, confirmText: "Ya, hapus" }))) return;
    const res = await deleteCategory(c.id);
    if (res.ok) {
      toastSuccess(res.message ?? "Dihapus.");
      router.refresh();
    } else toastError(res.message);
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <button type="button" className="btn-primary" onClick={() => openForm(null)}>
          <Plus size={16} /> Tambah Kategori
        </button>
      </div>
      <div className="card overflow-hidden">
        {categories.length === 0 ? (
          <EmptyState title="Belum ada kategori." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <thead className="bg-cream-100 text-left text-xs uppercase tracking-wide text-brown-500">
                <tr>
                  <th className="px-4 py-3">Nama</th>
                  <th className="hidden px-4 py-3 sm:table-cell">Deskripsi</th>
                  <th className="px-4 py-3">Jumlah Barang</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-beige-100">
                {categories.map((c) => (
                  <tr key={c.id} className="hover:bg-cream-50">
                    <td className="px-4 py-3 font-medium text-brown-900">{c.name}</td>
                    <td className="hidden px-4 py-3 text-brown-500 sm:table-cell">{c.description ?? "-"}</td>
                    <td className="px-4 py-3">{c.productCount}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button type="button" title="Edit" className="rounded-lg p-2 text-brown-500 hover:bg-beige-100" onClick={() => openForm(c)}>
                          <Pencil size={16} />
                        </button>
                        <button type="button" title="Hapus" className="rounded-lg p-2 text-red-600 hover:bg-red-50" onClick={() => remove(c)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit Kategori" : "Tambah Kategori"} size="sm">
        <form onSubmit={submit} className="space-y-4" key={editing?.id ?? "new"}>
          <FormField label="Nama kategori" htmlFor="cname" error={errors.name}>
            <input id="cname" name="name" className="input" defaultValue={editing?.name} required />
          </FormField>
          <FormField label="Deskripsi" htmlFor="cdesc" error={errors.description}>
            <input id="cdesc" name="description" className="input" defaultValue={editing?.description ?? ""} />
          </FormField>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-outline" onClick={() => setOpen(false)}>Batal</button>
            <button type="submit" disabled={pending} className="btn-primary">
              {pending && <Loader2 size={16} className="animate-spin" />} Simpan
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
