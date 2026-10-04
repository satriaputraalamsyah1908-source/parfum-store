import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AppShell from "@/components/layout/AppShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/akses-ditolak");

  return (
    <AppShell
      area="admin"
      userName={session.user.name ?? session.user.username}
      roleLabel="Admin"
    >
      {children}
    </AppShell>
  );
}
