import Link from "next/link";
import { Search } from "lucide-react";

type Props = {
  basePath: string;
  q: string;
  categoryId?: number;
  stock: string;
  categories: { id: number; name: string }[];
};

export default function ProductFilterForm({ basePath, q, categoryId, stock, categories }: Props) {
  return (
    <form method="get" action={basePath} className="card mb-6 flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
      <div className="relative flex-1">
        <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-brown-300" />
        <input name="q" defaultValue={q} placeholder="Cari nama, brand, kode, atau barcode" className="input pl-10" />
      </div>
      <select name="category" defaultValue={categoryId ? String(categoryId) : ""} className="input lg:w-48">
        <option value="">Semua kategori</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      <select name="stock" defaultValue={stock} className="input lg:w-44">
        <option value="">Semua stok</option>
        <option value="ok">Stok Aman</option>
        <option value="low">Stok Menipis</option>
        <option value="out">Stok Habis</option>
      </select>
      <div className="flex gap-2">
        <button type="submit" className="btn-primary flex-1 lg:flex-none">Cari</button>
        <Link href={basePath} className="btn-outline flex-1 lg:flex-none">Reset</Link>
      </div>
    </form>
  );
}
