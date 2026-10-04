"use client";

import { useState } from "react";
import { PackagePlus } from "lucide-react";
import Badge from "@/components/ui/Badge";
import ProductImage from "@/components/ui/ProductImage";
import StockAdjustModal, { type StockTarget } from "@/components/stock/StockAdjustModal";
import { stockStatus } from "@/lib/stock";

type Row = StockTarget & { code: string; image: string | null };

export default function StockManager({ products }: { products: Row[] }) {
  const [target, setTarget] = useState<StockTarget | null>(null);

  return (
    <>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead className="bg-cream-100 text-left text-xs uppercase tracking-wide text-brown-500">
              <tr>
                <th className="px-4 py-3">Barang</th>
                <th className="px-4 py-3">Stok</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-beige-100">
              {products.map((p) => {
                const st = stockStatus(p.stock);
                return (
                  <tr key={p.id} className="hover:bg-cream-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <ProductImage src={p.image} name={p.name} className="h-10 w-10 shrink-0" />
                        <div>
                          <p className="font-medium text-brown-900">{p.name}</p>
                          <p className="text-xs text-brown-500">{p.brand} · {p.code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold">{p.stock}</td>
                    <td className="px-4 py-3"><Badge variant={st.variant}>{st.label}</Badge></td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" className="btn-outline !px-3 !py-1.5" onClick={() => setTarget(p)}>
                        <PackagePlus size={15} /> Ubah
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <StockAdjustModal product={target} onClose={() => setTarget(null)} />
    </>
  );
}
