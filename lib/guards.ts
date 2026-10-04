import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { AppRole } from "@/lib/auth.config";
import { AppError } from "@/lib/errors";

export type CurrentUser = { id: number; name: string; role: AppRole };

// Cek di server: login, akun masih aktif di database, dan role sesuai.
export async function authorize(
  roles: AppRole[] = ["ADMIN", "KASIR"]
): Promise<CurrentUser> {
  const session = await auth();
  if (!session?.user) throw new AppError("Sesi berakhir, silakan login ulang.");

  const user = await prisma.user.findUnique({
    where: { id: Number(session.user.id) },
    select: { id: true, name: true, status: true, role: { select: { name: true } } },
  });

  if (!user || user.status !== "ACTIVE") {
    throw new AppError("Akun tidak aktif atau tidak ditemukan.");
  }

  const role = user.role.name as AppRole;
  if (!roles.includes(role)) {
    throw new AppError("Anda tidak memiliki akses untuk tindakan ini.");
  }

  return { id: user.id, name: user.name, role };
}
