import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  page: number;
  totalPages: number;
  basePath: string;
  params: Record<string, string | undefined>;
};

export default function Pagination({ page, totalPages, basePath, params }: Props) {
  if (totalPages <= 1) return null;

  const href = (p: number) => {
    const sp = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value) sp.set(key, value);
    }
    sp.set("page", String(p));
    return `${basePath}?${sp.toString()}`;
  };

  const base =
    "inline-flex items-center gap-1 rounded-xl border border-beige-200 bg-white px-4 py-2 text-sm font-medium";

  return (
    <nav className="mt-6 flex items-center justify-between" aria-label="Pagination">
      {page > 1 ? (
        <Link href={href(page - 1)} className={`${base} text-brown-700 hover:bg-beige-100`}>
          <ChevronLeft size={16} /> Sebelumnya
        </Link>
      ) : (
        <span className={`${base} cursor-not-allowed text-brown-300`}>
          <ChevronLeft size={16} /> Sebelumnya
        </span>
      )}

      <span className="text-sm text-brown-500">
        Halaman {page} dari {totalPages}
      </span>

      {page < totalPages ? (
        <Link href={href(page + 1)} className={`${base} text-brown-700 hover:bg-beige-100`}>
          Berikutnya <ChevronRight size={16} />
        </Link>
      ) : (
        <span className={`${base} cursor-not-allowed text-brown-300`}>
          Berikutnya <ChevronRight size={16} />
        </span>
      )}
    </nav>
  );
}
