import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function AksesDitolakPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="card w-full max-w-md p-10 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
          <ShieldAlert size={26} />
        </div>
        <h1 className="font-serif text-2xl text-brown-900">Akses Ditolak</h1>
        <p className="mt-2 text-sm text-brown-500">
          Anda tidak memiliki izin untuk membuka halaman ini.
        </p>
        <Link href="/" className="btn-primary mt-8">
          Kembali ke Dashboard
        </Link>
      </div>
    </main>
  );
}
