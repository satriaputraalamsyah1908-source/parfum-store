import Link from "next/link";
import { redirect } from "next/navigation";
import { Package, Receipt, ShoppingCart, Wallet } from "lucide-react";
import { auth } from "@/lib/auth";
import { getKasirDashboardData } from "@/lib/dashboard";
import { formatNumber, formatRupiah } from "@/lib/utils";
import PageHeader from "@/components/ui/PageHeader";
import DashboardCard from "@/components/dashboard/DashboardCard";
import RecentTransactionsTable from "@/components/dashboard/RecentTransactionsTable";

export const dynamic = "force-dynamic";

export default async function KasirDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = Number(session.user.id);
  const data = await getKasirDashboardData(userId);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={`Halo, ${session.user.name ?? session.user.username}. Berikut ringkasan penjualan Anda hari ini.`}
        action={
          <Link href="/kasir/pos" className="btn-gold">
            <ShoppingCart size={16} />
            Mulai Transaksi
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard title="Transaksi Hari Ini" value={formatNumber(data.todayCount)} icon={Receipt} />
        <DashboardCard title="Total Penjualan Hari Ini" value={formatRupiah(data.todayRevenue)} icon={Wallet} />
        <DashboardCard title="Produk Terjual Hari Ini" value={formatNumber(data.todayItemsSold)} icon={Package} />
        <DashboardCard title="Total Transaksi Saya" value={formatNumber(data.totalCount)} icon={Receipt} hint="Sejak akun dibuat" />
      </div>

      <div className="mt-6">
        <RecentTransactionsTable
          title="Transaksi Terakhir"
          rows={data.recentTransactions}
          viewAllHref="/kasir/transactions"
        />
      </div>
    </>
  );
}
