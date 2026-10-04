import type { LucideIcon } from "lucide-react";

type Props = {
  title: string;
  value: string;
  icon: LucideIcon;
  hint?: string;
};

export default function DashboardCard({ title, value, icon: Icon, hint }: Props) {
  return (
    <div className="card p-5 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-brown-500">{title}</p>
          <p className="mt-2 truncate text-2xl font-semibold text-brown-900">{value}</p>
          {hint && <p className="mt-1 text-xs text-brown-300">{hint}</p>}
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-beige-100 text-gold-600">
          <Icon size={20} />
        </span>
      </div>
    </div>
  );
}
