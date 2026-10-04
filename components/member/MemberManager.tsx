"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import FormField from "@/components/ui/FormField";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { deleteMember, getMemberDetail, saveMember } from "@/app/actions/members";
import { confirmDialog, toastError, toastSuccess } from "@/lib/notify";
import { formatDate, formatRupiah } from "@/lib/utils";
import type { MemberDetail } from "@/lib/types";

export type MemberRow = {
  id: number;
  memberCode: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  status: "ACTIVE" | "INACTIVE";
  totalTransactions: number;
  totalSpent: number;
};

type Props = { members: MemberRow[]; isAdmin: boolean; area: "admin" | "kasir" };

export default function MemberManager({ members, isAdmin, area }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MemberRow | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [detail, setDetail] = useState<MemberDetail | null>(null);

  function openForm(m: MemberRow | null) {
    setEditing(m);
    setErrors({});
    setOpen(true);
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const res = await saveMember(editing?.id ?? null, {
        name: String(fd.get("name") ?? ""),
        phone: String(fd.get("phone") ?? ""),
        email: String(fd.get("email") ?? ""),
        address: String(fd.get("address") ?? ""),
        status: String(fd.get("status") ?? "ACTIVE"),
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

  async function remove(m: MemberRow) {
    if (!(await confirmDialog({ title: `Hapus member ${m.name}?`, confirmText: "Ya, hapus" }))) return;
    const res = await deleteMember(m.id);
    if (res.ok) {
      toastSuccess(res.message ?? "Dihapus.");
      router.refresh();
    } else toastError(res.message);
  }

  async function showDetail(id: number) {
    const res = await getMemberDetail(id);
    if (res.ok && res.data) setDetail(res.data);
    else if (!res.ok) toastError(res.message);
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <button type="button" className="btn-primary" onClick={() => openForm(null)}>
          <Plus size={16} /> Tambah Member
        </button>
      </div>

      <div className="card overflow-hidden">
        {members.length === 0 ? (
          <EmptyState title="Member tidak ditemukan." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead className="bg-cream-100 text-left text-xs uppercase tracking-wide text-brown-500">
                <tr>
                  <th className="px-4 py-3">Member</th>
                  <th className="hidden px-4 py-3 md:table-cell">Telepon</th>
                  <th className="px-4 py-3">Transaksi</th>
                  <th className="px-4 py-3">Total Belanja</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-beige-100">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-cream-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-brown-900">{m.name}</p>
                      <p className="text-xs text-brown-300">{m.memberCode}</p>
                      {m.status === "INACTIVE" && <Badge className="mt-1">Nonaktif</Badge>}
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">{m.phone}</td>
                    <td className="px-4 py-3">{m.totalTransactions}</td>
                    <td className="px-4 py-3 font-medium">{formatRupiah(m.totalSpent)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button type="button" title="Detail" className="rounded-lg p-2 text-brown-500 hover:bg-beige-100" onClick={() => showDetail(m.id)}>
                          <Eye size={16} />
                        </button>
                        {isAdmin && (
                          <>
                            <button type="button" title="Edit" className="rounded-lg p-2 text-brown-500 hover:bg-beige-100" onClick={() => openForm(m)}>
                              <Pencil size={16} />
                            </button>
                            <button type="button" title="Hapus" className="rounded-lg p-2 text-red-600 hover:bg-red-50" onClick={() => remove(m)}>
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit Member" : "Tambah Member"}>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2" key={editing?.id ?? "new"}>
          <FormField label="Nama" htmlFor="mname" error={errors.name} className="sm:col-span-2">
            <input id="mname" name="name" className="input" defaultValue={editing?.name} required />
          </FormField>
          <FormField label="No. telepon" htmlFor="mphone" error={errors.phone}>
            <input id="mphone" name="phone" inputMode="tel" className="input" defaultValue={editing?.phone} required />
          </FormField>
          <FormField label="Email (opsional)" htmlFor="memail" error={errors.email}>
            <input id="memail" name="email" type="email" className="input" defaultValue={editing?.email ?? ""} />
          </FormField>
          <FormField label="Alamat (opsional)" htmlFor="maddr" error={errors.address} className="sm:col-span-2">
            <input id="maddr" name="address" className="input" defaultValue={editing?.address ?? ""} />
          </FormField>
          {isAdmin && editing && (
            <FormField label="Status" htmlFor="mstatus">
              <select id="mstatus" name="status" className="input" defaultValue={editing.status}>
                <option value="ACTIVE">Aktif</option>
                <option value="INACTIVE">Nonaktif</option>
              </select>
            </FormField>
          )}
          <div className="flex justify-end gap-2 pt-2 sm:col-span-2">
            <button type="button" className="btn-outline" onClick={() => setOpen(false)}>Batal</button>
            <button type="submit" disabled={pending} className="btn-primary">
              {pending && <Loader2 size={16} className="animate-spin" />} Simpan
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={!!detail} onClose={() => setDetail(null)} title="Detail Member">
        {detail && (
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-serif text-xl text-brown-900">{detail.name}</p>
              <p className="text-brown-500">{detail.memberCode} · {detail.phone}</p>
              {detail.email && <p className="text-brown-500">{detail.email}</p>}
              {detail.address && <p className="text-brown-500">{detail.address}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-cream-100 p-3">
                <p className="text-xs text-brown-500">Total transaksi</p>
                <p className="text-lg font-semibold">{detail.totalTransactions}</p>
              </div>
              <div className="rounded-xl bg-cream-100 p-3">
                <p className="text-xs text-brown-500">Total belanja</p>
                <p className="text-lg font-semibold">{formatRupiah(detail.totalSpent)}</p>
              </div>
            </div>
            <div>
              <p className="mb-2 font-medium text-brown-900">Riwayat transaksi terakhir</p>
              {detail.recent.length === 0 ? (
                <p className="text-brown-500">Belum ada transaksi.</p>
              ) : (
                <ul className="divide-y divide-beige-100 rounded-xl border border-beige-100">
                  {detail.recent.map((t) => (
                    <li key={t.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
                      <div>
                        <Link href={`/${area}/transactions/${t.id}`} className="font-medium text-gold-600 hover:underline">
                          {t.invoiceNumber}
                        </Link>
                        <p className="text-xs text-brown-500">{formatDate(t.createdAt, true)}</p>
                      </div>
                      <span className="font-medium">{formatRupiah(t.total)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
