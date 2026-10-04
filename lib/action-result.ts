import { AppError } from "@/lib/errors";

export type ActionResult<T = undefined> =
  | { ok: true; message?: string; data?: T }
  | { ok: false; message: string; errors?: Record<string, string> };

export function fail(message: string, errors?: Record<string, string>): ActionResult<never> {
  return { ok: false, message, errors };
}

export function zodErrors(error: {
  issues: { path: (string | number)[]; message: string }[];
}): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

// Membungkus action agar error tidak membuat halaman crash.
export async function safe<T = undefined>(fn: () => Promise<ActionResult<T>>): Promise<ActionResult<T>> {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof AppError) return { ok: false, message: e.message };
    console.error(e);
    return { ok: false, message: "Terjadi kesalahan pada server." };
  }
}
