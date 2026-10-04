import type { NextAuthConfig } from "next-auth";

export type AppRole = "ADMIN" | "KASIR";

export function homePathForRole(role?: string): string {
  if (role === "ADMIN") return "/admin/dashboard";
  if (role === "KASIR") return "/kasir/dashboard";
  return "/login";
}

// Konfigurasi ringan (aman dipakai di middleware, tanpa Prisma/bcrypt)
export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  trustHost: true,
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role;
      const path = nextUrl.pathname;

      if (path === "/login") {
        if (isLoggedIn) {
          return Response.redirect(new URL(homePathForRole(role), nextUrl));
        }
        return true;
      }

      if (!isLoggedIn) return false;

      if (path.startsWith("/admin") && role !== "ADMIN") {
        return Response.redirect(new URL("/akses-ditolak", nextUrl));
      }

      if (path.startsWith("/kasir") && role !== "ADMIN" && role !== "KASIR") {
        return Response.redirect(new URL("/akses-ditolak", nextUrl));
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.username = user.username;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.role = token.role as AppRole;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
