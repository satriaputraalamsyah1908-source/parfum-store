import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import UserManager from "@/components/user/UserManager";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const session = await auth();
  const me = Number(session?.user?.id);
  const users = await prisma.user.findMany({ orderBy: [{ roleId: "asc" }, { name: "asc" }], include: { role: true } });

  return (
    <>
      <PageHeader title="Petugas" description="Kelola akun admin dan petugas / kasir" />
      <UserManager
        users={users.map((u) => ({
          id: u.id,
          name: u.name,
          username: u.username,
          email: u.email,
          role: u.role.name,
          status: u.status,
          isSelf: u.id === me,
        }))}
      />
    </>
  );
}
