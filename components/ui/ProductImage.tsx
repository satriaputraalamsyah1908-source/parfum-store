"use client";

import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  src?: string | null;
  name: string;
  className?: string;
};

export default function ProductImage({ src, name, className }: Props) {
  const [failed, setFailed] = useState(false);

  // Menangani gambar yang gagal dimuat sebelum React selesai hydration
  const imgRef = useCallback((node: HTMLImageElement | null) => {
    if (node && node.complete && node.naturalWidth === 0) {
      setFailed(true);
    }
  }, []);

  const showImage = !!src && !failed;

  return (
    <div
      className={cn(
        "flex items-center justify-center overflow-hidden rounded-xl bg-cream-200",
        className
      )}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          src={src ?? ""}
          alt={name}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-contain p-3"
        />
      ) : (
        <svg
          viewBox="0 0 64 64"
          role="img"
          aria-label={name}
          className="h-1/2 w-1/2 text-gold-500"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="22" y="5" width="20" height="9" rx="2" />
          <path d="M28 14v6h8v-6" />
          <rect x="14" y="20" width="36" height="38" rx="9" />
          <path d="M24 34h16" />
          <path d="M24 42h10" />
        </svg>
      )}
    </div>
  );
}
