"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn, formatRupiah } from "@/lib/utils";
import type { SalesPoint } from "@/lib/types";

type Props = {
  data: SalesPoint[];
};

function compactRupiah(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(".0", "")} jt`;
  if (value >= 1_000) return `${Math.round(value / 1_000)} rb`;
  return String(value);
}

export default function SalesCharts({ data }: Props) {
  const [days, setDays] = useState<7 | 30>(7);
  const visible = data.slice(-days);
  const hasData = visible.some((point) => point.transaksi > 0);

  return (
    <div className="card p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-medium text-brown-900">Penjualan</h3>
          <p className="text-xs text-brown-500">Transaksi lunas per tanggal</p>
        </div>
        <div className="inline-flex rounded-xl bg-beige-100 p-1">
          {([7, 30] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setDays(value)}
              className={cn(
                "rounded-lg px-3 py-1 text-xs font-medium transition",
                days === value ? "bg-white text-brown-900 shadow-sm" : "text-brown-500 hover:text-brown-900"
              )}
            >
              {value} hari
            </button>
          ))}
        </div>
      </div>

      {!hasData ? (
        <p className="py-16 text-center text-sm text-brown-500">
          Belum ada transaksi pada periode ini.
        </p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-sm text-brown-500">Jumlah transaksi</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={visible} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#efe6d6" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#7a5c43" }} tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#7a5c43" }} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: "#fbf7ef" }} />
                  <Bar dataKey="transaksi" name="Transaksi" fill="#4f3a2a" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm text-brown-500">Pendapatan</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={visible} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#efe6d6" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#7a5c43" }} tickLine={false} axisLine={false} />
                  <YAxis
                    tickFormatter={(value) => compactRupiah(Number(value))}
                    tick={{ fontSize: 11, fill: "#7a5c43" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip formatter={(value) => formatRupiah(Number(value))} />
                  <Line
                    type="monotone"
                    dataKey="pendapatan"
                    name="Pendapatan"
                    stroke="#b8942a"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: "#b8942a" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
