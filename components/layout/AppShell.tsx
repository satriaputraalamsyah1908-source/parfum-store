"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/sidebar/Sidebar";
import Navbar from "@/components/navbar/Navbar";
import { pageTitleFor, type Area } from "@/lib/navigation";

type Props = {
  area: Area;
  userName: string;
  roleLabel: string;
  children: React.ReactNode;
};

export default function AppShell({ area, userName, roleLabel, children }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const title = pageTitleFor(area, pathname);

  return (
    <div className="min-h-screen">
      <Sidebar area={area} open={open} onClose={() => setOpen(false)} />
      <div className="md:pl-20 lg:pl-64 print:pl-0">
        <Navbar
          title={title}
          userName={userName}
          roleLabel={roleLabel}
          onMenuClick={() => setOpen(true)}
        />
        <main key={pathname} className="animate-fade-in p-4 sm:p-6 print:p-0">
          {children}
        </main>
      </div>
    </div>
  );
}
