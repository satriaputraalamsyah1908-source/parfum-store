import Link from "next/link";
import { Search } from "lucide-react";

type Props = {
  basePath: string;
  q?: string;
  placeholder?: string;
  hidden?: Record<string, string | undefined>;
};

// Form pencarian sederhana (GET) untuk halaman server
export default function SearchBar({ basePath, q, placeholder = "Cari...", hidden }: Props) {
  return (
    <form method="get" action={basePath} className="card mb-6 flex flex-col gap-3 p-4 sm:flex-row">
      <div className="relative flex-1">
        <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-brown-300" />
        <input name="q" defaultValue={q} placeholder={placeholder} className="input pl-10" />
      </div>
      {Object.entries(hidden ?? {}).map(([k, v]) =>
        v ? <input key={k} type="hidden" name={k} value={v} /> : null
      )}
      <div className="flex gap-2">
        <button type="submit" className="btn-primary flex-1 sm:flex-none">Cari</button>
        <Link href={basePath} className="btn-outline flex-1 sm:flex-none">Reset</Link>
      </div>
    </form>
  );
}
