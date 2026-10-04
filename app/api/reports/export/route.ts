import { authorize } from "@/lib/guards";
import { getReport, resolveRange } from "@/lib/reports";
import { paymentSummary, type PaymentMethodKey } from "@/lib/payments";

export const dynamic = "force-dynamic";

function esc(v: string | number): string {
  let s = String(v);
  // cegah formula injection di Excel
  if (/^[=+\-@]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export async function GET(req: Request) {
  let user;
  try {
    user = await authorize();
  } catch {
    return new Response("Unauthorized", { status: 401 });
  }

  const sp: Record<string, string> = {};
  new URL(req.url).searchParams.forEach((v, k) => (sp[k] = v));
  const range = resolveRange(sp);
  const { transactions, summary } = await getReport(range, user.role === "ADMIN" ? undefined : user.id);

  const lines: string[] = ["sep=,"];
  lines.push(["Invoice", "Tanggal", "Jam", "Kasir", "Member", "Pembayaran", "Barang", "Subtotal", "Diskon", "Total"].map(esc).join(","));
  for (const t of transactions) {
    const d = t.createdAt;
    lines.push(
      [
        t.invoiceNumber,
        `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
        `${pad(d.getHours())}:${pad(d.getMinutes())}`,
        t.user.name,
        t.member?.name ?? "Non-member",
        paymentSummary(t.paymentMethod as PaymentMethodKey, t.paymentProvider),
        t.details.map((x) => `${x.product.name} x${x.quantity}`).join("; "),
        t.subtotal,
        t.discount,
        t.total,
      ]
        .map(esc)
        .join(",")
    );
  }
  lines.push("");
  lines.push(["", "", "", "", "", "", "TOTAL", "", summary.discount, summary.revenue].map(esc).join(","));

  const body = "﻿" + lines.join("\r\n");
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="laporan-${range.fromStr}_${range.toStr}.csv"`,
    },
  });
}
