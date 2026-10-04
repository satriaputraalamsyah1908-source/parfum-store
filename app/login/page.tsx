import Logo from "@/components/brand/Logo";
import LoginForm from "@/components/auth/LoginForm";
import { STORE } from "@/lib/constants";

export const metadata = { title: `Login - ${STORE.name}` };

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-cream-100 via-cream-50 to-beige-100 p-4">
      <div className="card w-full max-w-md p-8 sm:p-10">
        <div className="mb-8 text-center">
          <Logo size={72} className="mx-auto mb-4" />
          <h1 className="font-serif text-3xl text-brown-900">{STORE.name}</h1>
          <p className="mt-1 text-sm text-brown-500">{STORE.tagline}</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
