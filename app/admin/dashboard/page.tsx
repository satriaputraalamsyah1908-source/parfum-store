import {
  Banknote,
  Boxes,
  Package,
  Receipt,
  TrendingUp,
  UserCog,
  Users,
  Wallet,
} from "lucide-react";
import { getAdminDashboardData } from "@/lib/dashboard";
import { formatNumber, formatRupiah } from "@/lib/utils";
import PageHeader from "@/components/ui/PageHeader";
import DashboardCard from "@/components/dashboard/DashboardCard";
import SalesCharts from "@/components/dashboard/SalesCharts";
import RecentTransactionsTable from "@/components/dashboard/RecentTransactionsTable";
import LowStockList from "@/components/dashboard/LowStockList";
import TopProducts from "@/components/dashboard/TopProducts";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const data = await getAdminDashboardData();

  return (
    <>
      <PageHeader title="Dashboard" description="Ringkasan aktivitas toko hari ini" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard title="Total Produk" value={formatNumber(data.productCount)} icon={Package} />
        <DashboardCard title="Total Stok" value={formatNumber(data.totalStock)} icon={Boxes} hint="Jumlah semua unit" />
        <DashboardCard title="Total Member" value={formatNumber(data.memberCount)} icon={Users} />
        <DashboardCard title="Total Kasir" value={formatNumber(data.kasirCount)} icon={UserCog} />
        <DashboardCard title="Transaksi Hari Ini" value={formatNumber(data.todayCount)} icon={Receipt} />
        <DashboardCard title="Pendapatan Hari Ini" value={formatRupiah(data.todayRevenue)} icon={Wallet} />
        <DashboardCard title="Pendapatan Bulan Ini" value={formatRupiah(data.monthRevenue)} icon={TrendingUp} />
        <DashboardCard
          title="Total Pendapatan"
          value={formatRupiah(data.totalRevenue)}
          icon={Banknote}
          hint={`${formatNumber(data.totalTransactions)} transaksi lunas`}
        />
      </div>

      <div className="mt-6">
        <SalesCharts data={data.series} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentTransactionsTable
            title="Transaksi Terbaru"
            rows={data.recentTransactions}
            showCashier
            viewAllHref="/admin/transactions"
          />
        </div>
        <LowStockList items={data.lowStock} viewAllHref="/admin/products?stock=low" />
      </div>

      <div className="mt-6">
        <TopProducts items={data.topProducts} />
      </div>
    </>
  );
}
