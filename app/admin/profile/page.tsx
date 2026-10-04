import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/lib/profile";
import PageHeader from "@/components/ui/PageHeader";
import ProfileCard from "@/components/dashboard/ProfileCard";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getCurrentUserProfile();
  if (!user) redirect("/login");

  return (
    <>
      <PageHeader title="Profil" description="Informasi akun Anda" />
      <ProfileCard user={user} />
    </>
  );
}
