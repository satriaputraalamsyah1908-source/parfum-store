import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getCurrentUserProfile() {
  const session = await auth();
  if (!session?.user) return null;

  const id = Number(session.user.id);
  if (!Number.isInteger(id)) return null;

  return prisma.user.findUnique({
    where: { id },
    include: { role: true },
  });
}
