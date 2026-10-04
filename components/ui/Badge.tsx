import { cn } from "@/lib/utils";

export type BadgeVariant = "success" | "warning" | "danger" | "neutral" | "gold";

const styles: Record<BadgeVariant, string> = {
  success: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  warning: "bg-amber-50 text-amber-700 ring-amber-200",
  danger: "bg-red-50 text-red-700 ring-red-200",
  neutral: "bg-beige-100 text-brown-700 ring-beige-200",
  gold: "bg-gold-300/25 text-gold-600 ring-gold-300/60",
};

type Props = {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
};

export default function Badge({ variant = "neutral", children, className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        styles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
