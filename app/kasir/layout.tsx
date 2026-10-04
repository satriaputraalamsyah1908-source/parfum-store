import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AppShell from "@/components/layout/AppShell";

export default async function KasirLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) redirect("/login");

  const role = session.user.role;
  if (role !== "ADMIN" && role !== "KASIR") redirect("/akses-ditolak");

  return (
    <AppShell
      area="kasir"
      userName={session.user.name ?? session.user.username}
      roleLabel={role === "ADMIN" ? "Admin" : "Petugas / Kasir"}
    >
      {children}
    </AppShell>
  );
}
