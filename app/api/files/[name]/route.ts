import { promises as fs } from "fs";
import path from "path";
import { auth } from "@/lib/auth";
import { UPLOAD_DIR } from "@/lib/files";

export const dynamic = "force-dynamic";

const types: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const { name } = await params;
  if (!/^[a-zA-Z0-9_-]+\.(jpg|png|webp)$/.test(name)) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const file = await fs.readFile(path.join(UPLOAD_DIR, name));
    const ext = name.split(".").pop() as string;
    return new Response(new Uint8Array(file), {
      headers: {
        "Content-Type": types[ext],
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
