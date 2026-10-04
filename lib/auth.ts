import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig, type AppRole } from "@/lib/auth.config";
import { loginSchema } from "@/lib/validations";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username atau Email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;

        const { username, password } = parsed.data;

        const user = await prisma.user.findFirst({
          where: { OR: [{ username }, { email: username }] },
          include: { role: true },
        });

        if (!user || user.status !== "ACTIVE") return null;

        const passwordOk = await bcrypt.compare(password, user.password);
        if (!passwordOk) return null;

        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          username: user.username,
          role: user.role.name as AppRole,
        };
      },
    }),
  ],
});
