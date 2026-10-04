"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  return (
    <button
      type="button"
      className="btn-primary"
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      <LogOut size={16} />
      Logout
    </button>
  );
}
