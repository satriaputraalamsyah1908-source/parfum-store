import { auth } from "@/lib/auth";
import TransactionHistory from "@/components/transaction/TransactionHistory";
import type { SearchParams } from "@/lib/product-query";

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const session = await auth();
  const scope = session?.user?.role === "ADMIN" ? undefined : Number(session?.user?.id);
  return <TransactionHistory searchParams={await searchParams} area="admin" scopeUserId={scope} />;
}
