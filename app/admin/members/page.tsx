import { getMemberList } from "@/lib/members";
import type { SearchParams } from "@/lib/product-query";
import PageHeader from "@/components/ui/PageHeader";
import SearchBar from "@/components/ui/SearchBar";
import Pagination from "@/components/ui/Pagination";
import MemberManager from "@/components/member/MemberManager";

export const dynamic = "force-dynamic";

export default async function MembersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { q, page, total, members, totalPages } = await getMemberList(await searchParams);
  return (
    <>
      <PageHeader title="Member" description={`${total} member terdaftar`} />
      <SearchBar basePath="/admin/members" q={q} placeholder="Cari nama, telepon, atau kode member" />
      <MemberManager members={members} isAdmin area="admin" />
      <Pagination page={page} totalPages={totalPages} basePath="/admin/members" params={{ q: q || undefined }} />
    </>
  );
}
