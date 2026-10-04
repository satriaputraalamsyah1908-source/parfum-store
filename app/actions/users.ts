"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/guards";
import { resetPasswordSchema, userCreateSchema, userUpdateSchema } from "@/lib/validations";
import { fail, safe, zodErrors, type ActionResult } from "@/lib/action-result";

function refresh() {
  revalidatePath("/admin/users");
}

type UserInput = {
  name: string;
  username: string;
  email: string;
  password?: string;
  status?: string;
};

export async function saveUser(id: number | null, input: UserInput): Promise<ActionResult> {
  return safe<undefined>(async () => {
    const me = await authorize(["ADMIN"]);

    if (id) {
      if (id === me.id) return fail("Gunakan halaman Profil untuk mengubah akun Anda sendiri.");
      const parsed = userUpdateSchema.safeParse({ ...input, status: input.status || "ACTIVE" });
      if (!parsed.success) return fail("Periksa kembali isian Anda.", zodErrors(parsed.error));
      const d = parsed.data;

      const target = await prisma.user.findUnique({ where: { id }, include: { role: true } });
      if (!target) return fail("Petugas tidak ditemukan.");

      const dup = await prisma.user.findFirst({
        where: { NOT: { id }, OR: [{ username: d.username }, { email: d.email }] },
      });
      if (dup) {
        const field = dup.username === d.username ? "username" : "email";
        const msg = field === "username" ? "Username sudah dipakai." : "Email sudah dipakai.";
        return fail(msg, { [field]: msg });
      }

      await prisma.user.update({ where: { id }, data: d });
    } else {
      const parsed = userCreateSchema.safeParse({ ...input, status: input.status || "ACTIVE" });
      if (!parsed.success) return fail("Periksa kembali isian Anda.", zodErrors(parsed.error));
      const d = parsed.data;

      const dup = await prisma.user.findFirst({
        where: { OR: [{ username: d.username }, { email: d.email }] },
      });
      if (dup) {
        const field = dup.username === d.username ? "username" : "email";
        const msg = field === "username" ? "Username sudah dipakai." : "Email sudah dipakai.";
        return fail(msg, { [field]: msg });
      }

      const role = await prisma.role.findUnique({ where: { name: "KASIR" } });
      if (!role) return fail("Role KASIR belum ada. Jalankan seed.");

      await prisma.user.create({
        data: {
          name: d.name,
          username: d.username,
          email: d.email,
          status: d.status,
          roleId: role.id,
          password: await bcrypt.hash(d.password, 10),
        },
      });
    }
    refresh();
    return { ok: true, message: id ? "Petugas diperbarui." : "Petugas ditambahkan." };
  });
}

export async function resetUserPassword(id: number, password: string): Promise<ActionResult> {
  return safe<undefined>(async () => {
    const me = await authorize(["ADMIN"]);
    if (id === me.id) return fail("Tidak bisa mengubah password akun sendiri di sini.");
    const parsed = resetPasswordSchema.safeParse({ password });
    if (!parsed.success) return fail("Password tidak valid.", zodErrors(parsed.error));

    await prisma.user.update({
      where: { id },
      data: { password: await bcrypt.hash(parsed.data.password, 10) },
    });
    return { ok: true, message: "Password berhasil direset." };
  });
}

export async function toggleUserStatus(id: number): Promise<ActionResult> {
  return safe<undefined>(async () => {
    const me = await authorize(["ADMIN"]);
    if (id === me.id) return fail("Anda tidak bisa menonaktifkan akun sendiri.");
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return fail("Petugas tidak ditemukan.");

    const status = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    await prisma.user.update({ where: { id }, data: { status } });
    refresh();
    return { ok: true, message: status === "ACTIVE" ? "Akun diaktifkan." : "Akun dinonaktifkan." };
  });
}

export async function deleteUser(id: number): Promise<ActionResult> {
  return safe<undefined>(async () => {
    const me = await authorize(["ADMIN"]);
    if (id === me.id) return fail("Anda tidak bisa menghapus akun sendiri.");

    const user = await prisma.user.findUnique({ where: { id }, include: { role: true } });
    if (!user) return fail("Petugas tidak ditemukan.");
    if (user.role.name === "ADMIN") return fail("Akun admin tidak bisa dihapus.");

    const used = await prisma.transaction.count({ where: { userId: id } });
    if (used > 0) return fail("Petugas sudah punya transaksi, tidak bisa dihapus. Nonaktifkan saja.");

    await prisma.stockHistory.updateMany({ where: { userId: id }, data: { userId: null } });
    await prisma.user.delete({ where: { id } });
    refresh();
    return { ok: true, message: "Petugas dihapus." };
  });
}
