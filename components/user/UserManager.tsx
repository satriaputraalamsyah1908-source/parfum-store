"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2, Pencil, Plus, Power, Trash2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import FormField from "@/components/ui/FormField";
import Badge from "@/components/ui/Badge";
import { deleteUser, resetUserPassword, saveUser, toggleUserStatus } from "@/app/actions/users";
import { confirmDialog, toastError, toastSuccess } from "@/lib/notify";

export type UserRow = {
  id: number;
  name: string;
  username: string;
  email: string;
  role: string;
  status: "ACTIVE" | "INACTIVE";
  isSelf: boolean;
};

export default function UserManager({ users }: { users: UserRow[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [resetTarget, setResetTarget] = useState<UserRow | null>(null);
  const [newPass, setNewPass] = useState("");

  function openForm(u: UserRow | null) {
    setEditing(u);
    setErrors({});
    setOpen(true);
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const res = await saveUser(editing?.id ?? null, {
        name: String(fd.get("name") ?? ""),
        username: String(fd.get("username") ?? ""),
        email: String(fd.get("email") ?? ""),
        password: String(fd.get("password") ?? ""),
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

  async function toggle(u: UserRow) {
    const next = u.status === "ACTIVE" ? "menonaktifkan" : "mengaktifkan";
    if (!(await confirmDialog({ title: `Yakin ${next} ${u.name}?` }))) return;
    const res = await toggleUserStatus(u.id);
    if (res.ok) {
      toastSuccess(res.message ?? "Berhasil.");
      router.refresh();
    } else toastError(res.message);
  }

  async function remove(u: UserRow) {
    if (!(await confirmDialog({ title: `Hapus ${u.name}?`, confirmText: "Ya, hapus" }))) return;
    const res = await deleteUser(u.id);
    if (res.ok) {
      toastSuccess(res.message ?? "Dihapus.");
      router.refresh();
    } else toastError(res.message);
  }

  function doReset(e: React.FormEvent) {
    e.preventDefault();
    if (!resetTarget) return;
    start(async () => {
      const res = await resetUserPassword(resetTarget.id, newPass);
      if (res.ok) {
        toastSuccess(res.message ?? "Password direset.");
        setResetTarget(null);
        setNewPass("");
      } else toastError(res.errors?.password ?? res.message);
    });
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <button type="button" className="btn-primary" onClick={() => openForm(null)}>
          <Plus size={16} /> Tambah Petugas
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-cream-100 text-left text-xs uppercase tracking-wide text-brown-500">
              <tr>
                <th className="px-4 py-3">Nama</th>
                <th className="hidden px-4 py-3 md:table-cell">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-beige-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-cream-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-brown-900">{u.name}{u.isSelf && " (Anda)"}</p>
                    <p className="text-xs text-brown-300">@{u.username}</p>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">{u.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant={u.role === "ADMIN" ? "gold" : "neutral"}>{u.role === "ADMIN" ? "Admin" : "Petugas / Kasir"}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={u.status === "ACTIVE" ? "success" : "danger"}>{u.status === "ACTIVE" ? "Aktif" : "Nonaktif"}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {!u.isSelf && (
                      <div className="flex justify-end gap-1">
                        <button type="button" title="Edit" className="rounded-lg p-2 text-brown-500 hover:bg-beige-100" onClick={() => openForm(u)}>
                          <Pencil size={16} />
                        </button>
                        <button type="button" title="Reset password" className="rounded-lg p-2 text-brown-500 hover:bg-beige-100" onClick={() => { setResetTarget(u); setNewPass(""); }}>
                          <KeyRound size={16} />
                        </button>
                        <button type="button" title="Aktif / nonaktif" className="rounded-lg p-2 text-brown-500 hover:bg-beige-100" onClick={() => toggle(u)}>
                          <Power size={16} />
                        </button>
                        {u.role !== "ADMIN" && (
                          <button type="button" title="Hapus" className="rounded-lg p-2 text-red-600 hover:bg-red-50" onClick={() => remove(u)}>
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit Petugas" : "Tambah Petugas"}>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2" key={editing?.id ?? "new"}>
          <FormField label="Nama lengkap" htmlFor="uname" error={errors.name} className="sm:col-span-2">
            <input id="uname" name="name" className="input" defaultValue={editing?.name} required />
          </FormField>
          <FormField label="Username" htmlFor="uuser" error={errors.username}>
            <input id="uuser" name="username" className="input" defaultValue={editing?.username} autoComplete="off" required />
          </FormField>
          <FormField label="Email" htmlFor="uemail" error={errors.email}>
            <input id="uemail" name="email" type="email" className="input" defaultValue={editing?.email} required />
          </FormField>
          {!editing && (
            <FormField label="Password" htmlFor="upass" error={errors.password} hint="Minimal 6 karakter">
              <input id="upass" name="password" type="password" className="input" autoComplete="new-password" required />
            </FormField>
          )}
          <FormField label="Status" htmlFor="ustatus">
            <select id="ustatus" name="status" className="input" defaultValue={editing?.status ?? "ACTIVE"}>
              <option value="ACTIVE">Aktif</option>
              <option value="INACTIVE">Nonaktif</option>
            </select>
          </FormField>
          <div className="flex justify-end gap-2 pt-2 sm:col-span-2">
            <button type="button" className="btn-outline" onClick={() => setOpen(false)}>Batal</button>
            <button type="submit" disabled={pending} className="btn-primary">
              {pending && <Loader2 size={16} className="animate-spin" />} Simpan
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={!!resetTarget} onClose={() => setResetTarget(null)} title="Reset Password" size="sm">
        <form onSubmit={doReset} className="space-y-4">
          <p className="text-sm text-brown-500">Password baru untuk <b>{resetTarget?.name}</b>.</p>
          <FormField label="Password baru" htmlFor="rpass" hint="Minimal 6 karakter">
            <input id="rpass" type="password" className="input" value={newPass} onChange={(e) => setNewPass(e.target.value)} autoComplete="new-password" required />
          </FormField>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-outline" onClick={() => setResetTarget(null)}>Batal</button>
            <button type="submit" disabled={pending} className="btn-primary">
              {pending && <Loader2 size={16} className="animate-spin" />} Reset
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
