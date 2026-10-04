"use client";

import { Menu } from "lucide-react";

type Props = {
  title: string;
  userName: string;
  roleLabel: string;
  onMenuClick: () => void;
};

export default function Navbar({ title, userName, roleLabel, onMenuClick }: Props) {
  const initials =
    userName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join("") || "U";

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-beige-100 bg-white/90 px-4 backdrop-blur sm:px-6 print:hidden">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Buka menu"
        className="rounded-xl p-2 text-brown-700 transition hover:bg-beige-100 md:hidden"
      >
        <Menu size={20} />
      </button>

      <h2 className="font-serif text-xl text-brown-900">{title}</h2>

      <div className="ml-auto flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium leading-tight text-brown-900">{userName}</p>
          <p className="text-xs text-brown-500">{roleLabel}</p>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-beige-100 text-sm font-semibold text-brown-700">
          {initials}
        </span>
      </div>
    </header>
  );
}
