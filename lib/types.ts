export type SalesPoint = {
  label: string;
  transaksi: number;
  pendapatan: number;
};

export type TransactionRow = {
  id: number;
  invoiceNumber: string;
  createdAt: Date;
  total: number;
  status: "PENDING" | "PAID" | "CANCELLED";
  cashier?: string;
  member?: string | null;
};

export type LowStockItem = {
  id: number;
  code: string;
  name: string;
  brand: string;
  size: string;
  stock: number;
};

export type TopProduct = {
  id: number;
  name: string;
  brand: string;
  size: string;
  image: string | null;
  sold: number;
};

export type MemberDetail = {
  id: number;
  memberCode: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  status: "ACTIVE" | "INACTIVE";
  totalTransactions: number;
  totalSpent: number;
  recent: { id: number; invoiceNumber: string; total: number; createdAt: string }[];
};
