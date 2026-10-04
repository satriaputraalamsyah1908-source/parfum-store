"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/guards";
import { categorySchema } from "@/lib/validations";
import { fail, safe, zodErrors, type ActionResult } from "@/lib/action-result";

export async function saveCategory(
  id: number | null,
  input: { name: string; description?: string }
): Promise<ActionResult> {
  return safe<undefined>(async () => {
    await authorize(["ADMIN"]);
    const parsed = categorySchema.safeParse(input);
    if (!parsed.success) return fail("Periksa kembali isian Anda.", zodErrors(parsed.error));

    const dup = await prisma.category.findFirst({
      where: { name: parsed.data.name, ...(id ? { NOT: { id } } : {}) },
    });
    if (dup) return fail("Nama kategori sudah ada.", { name: "Nama kategori sudah ada." });

    if (id) {
      await prisma.category.update({ where: { id }, data: parsed.data });
    } else {
      await prisma.category.create({ data: parsed.data });
    }
    revalidatePath("/admin/categories");
    return { ok: true, message: id ? "Kategori diperbarui." : "Kategori ditambahkan." };
  });
}

export async function deleteCategory(id: number): Promise<ActionResult> {
  return safe<undefined>(async () => {
    await authorize(["ADMIN"]);
    const used = await prisma.product.count({ where: { categoryId: id } });
    if (used > 0) {
      return fail(`Kategori masih dipakai oleh ${used} barang, tidak bisa dihapus.`);
    }
    await prisma.category.delete({ where: { id } });
    revalidatePath("/admin/categories");
    return { ok: true, message: "Kategori dihapus." };
  });
}
