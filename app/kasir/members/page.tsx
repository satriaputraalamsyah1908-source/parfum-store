import { auth } from "@/lib/auth";
import { getMemberList } from "@/lib/members";
import type { SearchParams } from "@/lib/product-query";
import PageHeader from "@/components/ui/PageHeader";
import SearchBar from "@/components/ui/SearchBar";
import Pagination from "@/components/ui/Pagination";
import MemberManager from "@/components/member/MemberManager";

export const dynamic = "force-dynamic";

export default async function KasirMembersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";
  const scope = isAdmin ? undefined : Number(session?.user?.id);
  const { q, page, total, members, totalPages } = await getMemberList(await searchParams, scope);
  return (
    <>
      <PageHeader title="Member" description={`${total} member terdaftar`} />
      <SearchBar basePath="/kasir/members" q={q} placeholder="Cari nama, telepon, atau kode member" />
      <MemberManager members={members} isAdmin={isAdmin} area="kasir" />
      <Pagination page={page} totalPages={totalPages} basePath="/kasir/members" params={{ q: q || undefined }} />
    </>
  );
}
