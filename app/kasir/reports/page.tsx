import { auth } from "@/lib/auth";
import ReportView from "@/components/report/ReportView";
import type { SearchParams } from "@/lib/product-query";

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const session = await auth();
  const scope = session?.user?.role === "ADMIN" ? undefined : Number(session?.user?.id);
  return <ReportView searchParams={await searchParams} area="kasir" scopeUserId={scope} />;
}
