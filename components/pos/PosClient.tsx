"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ScanBarcode, Search, ShoppingCart, Trash2, X } from "lucide-react";
import ProductImage from "@/components/ui/ProductImage";
import PaymentModal, { type PaymentPayload } from "@/components/pos/PaymentModal";
import { checkout } from "@/app/actions/pos";
import { confirmDialog, toastError, toastSuccess } from "@/lib/notify";
import { cn, formatRupiah } from "@/lib/utils";

export type PosProduct = {
  id: number;
  code: string;
  barcode: string;
  name: string;
  brand: string;
  size: string;
  sellingPrice: number;
  stock: number;
  image: string | null;
  categoryId: number;
};

type Props = {
  products: PosProduct[];
  categories: { id: number; name: string }[];
  members: { id: number; name: string; phone: string; memberCode: string }[];
};

type CartLine = { productId: number; quantity: number };

export default function PosClient({ products, categories, members }: Props) {
  const router = useRouter();
  const scanRef = useRef<HTMLInputElement>(null);
  const [scan, setScan] = useState("");
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState(0);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [memberId, setMemberId] = useState(0);
  const [discount, setDiscount] = useState("");
  const [payOpen, setPayOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (cat && p.categoryId !== cat) return false;
      if (!q) return true;
      return [p.name, p.brand, p.code, p.barcode].some((v) => v.toLowerCase().includes(q));
    });
  }, [products, search, cat]);

  const lines = cart
    .map((l) => ({ ...l, product: byId.get(l.productId) }))
    .filter((l): l is CartLine & { product: PosProduct } => !!l.product);

  const subtotal = lines.reduce((s, l) => s + l.product.sellingPrice * l.quantity, 0);
  const discountNumber = Math.min(Math.max(Number(discount) || 0, 0), subtotal);
  const total = subtotal - discountNumber;
  const itemCount = lines.reduce((s, l) => s + l.quantity, 0);

  function add(p: PosProduct) {
    if (p.stock <= 0) {
      toastError("Stok produk habis");
      return;
    }
    setCart((prev) => {
      const existing = prev.find((l) => l.productId === p.id);
      if (existing) {
        if (existing.quantity >= p.stock) {
          toastError(`Stok tidak mencukupi (sisa ${p.stock})`);
          return prev;
        }
        return prev.map((l) => (l.productId === p.id ? { ...l, quantity: l.quantity + 1 } : l));
      }
      return [...prev, { productId: p.id, quantity: 1 }];
    });
  }

  function setQty(productId: number, qty: number) {
    const p = byId.get(productId);
    if (!p) return;
    if (qty <= 0) {
      setCart((prev) => prev.filter((l) => l.productId !== productId));
      return;
    }
    if (qty > p.stock) {
      toastError(`Stok tidak mencukupi (sisa ${p.stock})`);
      qty = p.stock;
    }
    setCart((prev) => prev.map((l) => (l.productId === productId ? { ...l, quantity: qty } : l)));
  }

  function onScan(e: React.FormEvent) {
    e.preventDefault();
    const code = scan.trim();
    if (!code) return;
    const p = products.find((x) => x.barcode === code || x.code.toLowerCase() === code.toLowerCase());
    if (!p) toastError("Barang tidak ditemukan.");
    else add(p);
    setScan("");
    scanRef.current?.focus();
  }

  async function reset() {
    if (cart.length === 0 && !discount && !memberId) return;
    if (!(await confirmDialog({ title: "Kosongkan keranjang?", confirmText: "Ya, reset" }))) return;
    setCart([]);
    setDiscount("");
    setMemberId(0);
  }

  async function pay(p: PaymentPayload) {
    setLoading(true);
    const res = await checkout({
      items: cart.map((l) => ({ productId: l.productId, quantity: l.quantity })),
      memberId: memberId || null,
      discount: discountNumber,
      ...p,
    });
    setLoading(false);
    if (res.ok && res.data) {
      toastSuccess("Transaksi berhasil.");
      router.push(`/kasir/transactions/${res.data.id}`);
    } else if (!res.ok) {
      toastError(res.message);
      setPayOpen(false);
      router.refresh();
    }
  }

  const cartPanel = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-beige-100 px-4 py-3">
        <h2 className="flex items-center gap-2 font-serif text-lg text-brown-900">
          <ShoppingCart size={18} /> Keranjang
          <span className="rounded-full bg-gold-300/30 px-2 text-xs text-gold-600">{itemCount}</span>
        </h2>
        <div className="flex items-center gap-1">
          <button type="button" onClick={reset} className="rounded-lg px-2 py-1 text-xs text-red-600 hover:bg-red-50">Reset</button>
          <button type="button" onClick={() => setCartOpen(false)} className="rounded-lg p-1.5 text-brown-500 hover:bg-beige-100 lg:hidden" aria-label="Tutup keranjang">
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {lines.length === 0 ? (
          <p className="py-10 text-center text-sm text-brown-300">Keranjang kosong. Scan barcode atau pilih barang.</p>
        ) : (
          lines.map((l) => (
            <div key={l.productId} className="flex gap-3 rounded-xl border border-beige-100 p-2.5">
              <ProductImage src={l.product.image} name={l.product.name} className="h-14 w-14 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-brown-900">{l.product.name}</p>
                <p className="text-xs text-brown-500">{formatRupiah(l.product.sellingPrice)}</p>
                <div className="mt-1.5 flex items-center justify-between">
                  <div className="flex items-center rounded-lg border border-beige-200">
                    <button type="button" className="p-1.5 hover:bg-beige-100" onClick={() => setQty(l.productId, l.quantity - 1)} aria-label="Kurangi"><Minus size={14} /></button>
                    <input
                      type="number"
                      min={1}
                      value={l.quantity}
                      onChange={(e) => setQty(l.productId, Number(e.target.value) || 0)}
                      className="w-10 bg-transparent text-center text-sm outline-none"
                    />
                    <button type="button" className="p-1.5 hover:bg-beige-100" onClick={() => setQty(l.productId, l.quantity + 1)} aria-label="Tambah"><Plus size={14} /></button>
                  </div>
                  <span className="text-sm font-semibold">{formatRupiah(l.product.sellingPrice * l.quantity)}</span>
                </div>
              </div>
              <button type="button" onClick={() => setQty(l.productId, 0)} className="self-start rounded-lg p-1.5 text-red-500 hover:bg-red-50" aria-label="Hapus">
                <Trash2 size={15} />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="space-y-3 border-t border-beige-100 p-4">
        <select className="input" value={memberId} onChange={(e) => setMemberId(Number(e.target.value))}>
          <option value={0}>Non-member</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>{m.name} ({m.phone})</option>
          ))}
        </select>
        <div className="flex items-center gap-3">
          <label htmlFor="disc" className="shrink-0 text-sm text-brown-500">Diskon (Rp)</label>
          <input id="disc" type="number" min={0} inputMode="numeric" className="input !py-2 text-right" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="0" />
        </div>
        <dl className="space-y-1 text-sm">
          <div className="flex justify-between"><dt className="text-brown-500">Subtotal</dt><dd>{formatRupiah(subtotal)}</dd></div>
          <div className="flex justify-between"><dt className="text-brown-500">Diskon</dt><dd>- {formatRupiah(discountNumber)}</dd></div>
          <div className="flex justify-between border-t border-beige-100 pt-2 text-lg font-semibold text-brown-900"><dt>Total</dt><dd>{formatRupiah(total)}</dd></div>
        </dl>
        <button type="button" className="btn-gold w-full !py-3" disabled={lines.length === 0} onClick={() => setPayOpen(true)}>
          Bayar
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="grid gap-6 pb-20 lg:grid-cols-[1fr_380px] lg:pb-0">
        <div className="min-w-0">
          <form onSubmit={onScan} className="card mb-4 flex gap-2 p-3">
            <div className="relative flex-1">
              <ScanBarcode size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gold-500" />
              <input
                ref={scanRef}
                value={scan}
                onChange={(e) => setScan(e.target.value)}
                placeholder="Scan / ketik barcode lalu Enter"
                inputMode="numeric"
                autoFocus
                className="input pl-11"
              />
            </div>
            <button type="submit" className="btn-primary">Tambah</button>
          </form>

          <div className="relative mb-3">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-brown-300" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama atau brand" className="input pl-10" />
          </div>

          <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
            {[{ id: 0, name: "Semua" }, ...categories].map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCat(c.id)}
                className={cn(
                  "whitespace-nowrap rounded-full border px-4 py-1.5 text-sm transition",
                  cat === c.id ? "border-brown-700 bg-brown-700 text-cream-50" : "border-beige-200 bg-white text-brown-700 hover:bg-beige-100"
                )}
              >
                {c.name}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <p className="card p-10 text-center text-sm text-brown-500">Barang tidak ditemukan.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {filtered.map((p) => {
                const out = p.stock <= 0;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => add(p)}
                    disabled={out}
                    className={cn("card flex flex-col overflow-hidden text-left transition", out ? "opacity-50" : "hover:-translate-y-0.5 hover:shadow-md")}
                  >
                    <ProductImage src={p.image} name={p.name} className="aspect-square w-full rounded-none" />
                    <div className="p-3">
                      <p className="text-[11px] uppercase tracking-wide text-brown-300">{p.brand}</p>
                      <p className="line-clamp-2 text-sm font-medium leading-snug text-brown-900">{p.name}</p>
                      <p className="mt-1 text-sm font-semibold">{formatRupiah(p.sellingPrice)}</p>
                      <p className={cn("text-xs", out ? "text-red-600" : p.stock <= 5 ? "text-amber-700" : "text-brown-500")}>
                        {out ? "Stok Habis" : `Stok: ${p.stock}`}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <aside className="hidden lg:block">
          <div className="card sticky top-20 h-[calc(100vh-7rem)] overflow-hidden">{cartPanel}</div>
        </aside>
      </div>

      {/* Bar total di HP */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 border-t border-beige-200 bg-white px-4 py-3 shadow-lg lg:hidden">
        <div>
          <p className="text-xs text-brown-500">{itemCount} item</p>
          <p className="text-lg font-semibold text-brown-900">{formatRupiah(total)}</p>
        </div>
        <button type="button" className="btn-gold" onClick={() => setCartOpen(true)}>
          <ShoppingCart size={16} /> Lihat Keranjang
        </button>
      </div>

      {cartOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-brown-900/50" onClick={() => setCartOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 top-12 animate-fade-in overflow-hidden rounded-t-2xl bg-white">{cartPanel}</div>
        </div>
      )}

      <PaymentModal open={payOpen} total={total} loading={loading} onClose={() => setPayOpen(false)} onConfirm={pay} />
    </>
  );
}
