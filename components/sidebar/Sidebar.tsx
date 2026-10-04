"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogOut, X } from "lucide-react";
import Logo from "@/components/brand/Logo";
import { cn } from "@/lib/utils";
import { STORE } from "@/lib/constants";
import { navForArea, type Area } from "@/lib/navigation";

function isActive(pathname: string, href: string): boolean {
  if (href.endsWith("/dashboard")) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

type ContentProps = {
  area: Area;
  compact: boolean;
  onNavigate?: () => void;
};

function SidebarContent({ area, compact, onNavigate }: ContentProps) {
  const pathname = usePathname();
  const groups = navForArea(area);
  const labelClass = compact ? "hidden lg:block" : "";
  const itemJustify = compact ? "justify-center lg:justify-start" : "";

  return (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          "flex h-16 items-center gap-3 border-b border-white/10 px-5",
          compact && "justify-center lg:justify-start"
        )}
      >
        <Logo size={36} />
        <span className={cn("font-serif text-lg text-cream-50", labelClass)}>{STORE.name}</span>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-5">
        {groups.map((group, index) => (
          <div key={index}>
            {group.title && (
              <p
                className={cn(
                  "mb-2 px-3 text-[11px] font-medium uppercase tracking-wider text-beige-300/70",
                  labelClass
                )}
              >
                {group.title}
              </p>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const active = isActive(pathname, item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      title={item.label}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                        itemJustify,
                        active
                          ? "bg-gold-500 text-white shadow-soft"
                          : "text-beige-200 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      <Icon size={18} className="shrink-0" />
                      <span className={labelClass}>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <button
          type="button"
          title="Logout"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-beige-200 transition-colors hover:bg-white/10 hover:text-white",
            itemJustify
          )}
        >
          <LogOut size={18} className="shrink-0" />
          <span className={labelClass}>Logout</span>
        </button>
      </div>
    </div>
  );
}

type Props = {
  area: Area;
  open: boolean;
  onClose: () => void;
};

export default function Sidebar({ area, open, onClose }: Props) {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-20 bg-brown-900 md:block lg:w-64 print:hidden">
        <SidebarContent area={area} compact />
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 md:hidden print:hidden">
          <div
            className="absolute inset-0 bg-brown-900/50"
            onClick={onClose}
            aria-hidden="true"
          />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85%] animate-slide-in bg-brown-900">
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup menu"
              className="absolute right-3 top-4 rounded-lg p-1.5 text-beige-200 hover:bg-white/10"
            >
              <X size={18} />
            </button>
            <SidebarContent area={area} compact={false} onNavigate={onClose} />
          </aside>
        </div>
      )}
    </>
  );
}
