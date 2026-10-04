import { cn } from "@/lib/utils";

type Props = { size?: number; className?: string };

// Logo: botol parfum bergaya art-deco di dalam lingkaran emas
export default function Logo({ size = 40, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label="Logo Toko Parfum"
      className={cn("shrink-0", className)}
    >
      <defs>
        <linearGradient id="lg-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f0d98a" />
          <stop offset="0.5" stopColor="#d4af37" />
          <stop offset="1" stopColor="#977822" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="#2e2118" stroke="url(#lg-gold)" strokeWidth="2" />
      <circle cx="32" cy="32" r="25.5" fill="none" stroke="url(#lg-gold)" strokeWidth="0.6" opacity="0.6" />
      <rect x="27" y="11" width="10" height="6" rx="1.5" fill="url(#lg-gold)" />
      <rect x="29.5" y="17" width="5" height="4" fill="url(#lg-gold)" />
      <path
        d="M20 30c0-4 3-7 7-7h10c4 0 7 3 7 7v13c0 4-3 7-7 7H27c-4 0-7-3-7-7V30z"
        fill="none"
        stroke="url(#lg-gold)"
        strokeWidth="2"
      />
      <path d="M32 29l2.6 5.4L40 36l-5.4 2.6L32 44l-2.6-5.4L24 36l5.4-1.6L32 29z" fill="url(#lg-gold)" />
      <circle cx="46" cy="14" r="1.4" fill="#f0d98a" />
      <circle cx="51" cy="19" r="0.9" fill="#f0d98a" />
    </svg>
  );
}
