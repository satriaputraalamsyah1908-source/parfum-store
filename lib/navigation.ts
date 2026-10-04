import {
  Boxes,
  ClipboardList,
  History,
  LayoutDashboard,
  Package,
  Receipt,
  ShoppingCart,
  Tag,
  UserCircle,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";

export type Area = "admin" | "kasir";

export type NavItem = { label: string; href: string; icon: LucideIcon };
export type NavGroup = { title?: string; items: NavItem[] };

export const adminNav: NavGroup[] = [
  { items: [{ label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard }] },
  {
    title: "Master Data",
    items: [
      { label: "Data Barang", href: "/admin/products", icon: Package },
      { label: "Kategori", href: "/admin/categories", icon: Tag },
      { label: "Stok", href: "/admin/stock", icon: Boxes },
      { label: "Member", href: "/admin/members", icon: Users },
      { label: "Petugas", href: "/admin/users", icon: UserCog },
    ],
  },
  {
    title: "Transaksi",
    items: [
      { label: "Kasir (POS)", href: "/kasir/pos", icon: ShoppingCart },
      { label: "Transaksi", href: "/admin/transactions", icon: Receipt },
    ],
  },
  {
    title: "Laporan",
    items: [{ label: "Laporan", href: "/admin/reports", icon: ClipboardList }],
  },
  {
    title: "Akun",
    items: [{ label: "Profil", href: "/admin/profile", icon: UserCircle }],
  },
];

export const kasirNav: NavGroup[] = [
  { items: [{ label: "Dashboard", href: "/kasir/dashboard", icon: LayoutDashboard }] },
  {
    title: "Transaksi",
    items: [
      { label: "Kasir", href: "/kasir/pos", icon: ShoppingCart },
      { label: "Riwayat Transaksi", href: "/kasir/transactions", icon: History },
    ],
  },
  {
    title: "Data",
    items: [
      { label: "Data Barang", href: "/kasir/products", icon: Package },
      { label: "Member", href: "/kasir/members", icon: Users },
    ],
  },
  {
    title: "Laporan",
    items: [{ label: "Laporan", href: "/kasir/reports", icon: ClipboardList }],
  },
  {
    title: "Akun",
    items: [{ label: "Profil", href: "/kasir/profile", icon: UserCircle }],
  },
];

export function navForArea(area: Area): NavGroup[] {
  return area === "admin" ? adminNav : kasirNav;
}

export function pageTitleFor(area: Area, pathname: string): string {
  const items = navForArea(area).flatMap((g) => g.items);
  const matches = items
    .filter((i) => pathname === i.href || pathname.startsWith(`${i.href}/`))
    .sort((a, b) => b.href.length - a.href.length);
  return matches[0]?.label ?? "Dashboard";
}
