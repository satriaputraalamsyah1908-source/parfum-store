import { z } from "zod";
import { paymentProviders } from "@/lib/payments";

export const loginSchema = z.object({
  username: z.string().trim().min(1, "Username atau email wajib diisi"),
  password: z.string().min(1, "Password wajib diisi"),
});
export type LoginInput = z.infer<typeof loginSchema>;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Maksimal ${max} karakter`)
    .optional()
    .transform((v) => (v ? v : undefined));

const rupiah = (label: string) =>
  z.coerce
    .number({ invalid_type_error: `${label} harus berupa angka` })
    .int(`${label} harus bilangan bulat`)
    .min(0, `${label} tidak boleh negatif`)
    .max(2_000_000_000, `${label} terlalu besar`);

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Nama kategori wajib diisi").max(100),
  description: optionalText(255),
});

export const productSchema = z.object({
  code: optionalText(30),
  barcode: optionalText(50),
  name: z.string().trim().min(1, "Nama barang wajib diisi").max(150),
  brand: z.string().trim().min(1, "Brand wajib diisi").max(100),
  categoryId: z.coerce.number({ invalid_type_error: "Pilih kategori" }).int().min(1, "Pilih kategori"),
  size: z.string().trim().min(1, "Ukuran wajib diisi").max(30),
  costPrice: rupiah("Harga beli"),
  sellingPrice: rupiah("Harga jual"),
  stock: z.coerce.number().int().min(0, "Stok tidak boleh negatif").max(1_000_000).default(0),
  unit: z.string().trim().min(1).max(20).default("pcs"),
  description: optionalText(2000),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export const stockAdjustSchema = z.object({
  productId: z.coerce.number().int().min(1),
  type: z.enum(["IN", "OUT", "ADJUSTMENT"]),
  quantity: z.coerce
    .number({ invalid_type_error: "Jumlah harus berupa angka" })
    .int("Jumlah harus bilangan bulat")
    .min(0, "Jumlah tidak boleh negatif")
    .max(1_000_000),
  description: optionalText(255),
});

export const memberSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi").max(100),
  phone: z
    .string()
    .trim()
    .min(8, "Nomor telepon minimal 8 digit")
    .max(20)
    .regex(/^[0-9+\-\s]+$/, "Nomor telepon hanya boleh angka"),
  email: z
    .string()
    .trim()
    .max(100)
    .optional()
    .transform((v) => (v ? v : undefined))
    .refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Format email tidak valid"),
  address: optionalText(255),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

const usernameField = z
  .string()
  .trim()
  .min(3, "Username minimal 3 karakter")
  .max(50)
  .regex(/^[a-zA-Z0-9_.]+$/, "Username hanya huruf, angka, titik, dan underscore");

const emailField = z.string().trim().max(100).email("Format email tidak valid");

export const userCreateSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi").max(100),
  username: usernameField,
  email: emailField,
  password: z.string().min(6, "Password minimal 6 karakter").max(100),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export const userUpdateSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi").max(100),
  username: usernameField,
  email: emailField,
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password minimal 6 karakter").max(100),
});

const allProviders = Array.from(new Set(Object.values(paymentProviders).flat()));

export const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.number().int().min(1),
        quantity: z.number().int().min(1, "Jumlah minimal 1").max(10000),
      })
    )
    .min(1, "Keranjang masih kosong"),
  memberId: z.number().int().min(1).nullable().optional(),
  discount: z.number().int().min(0, "Diskon tidak boleh negatif").default(0),
  paymentMethod: z.enum(["CASH", "QRIS", "EWALLET", "TRANSFER", "DEBIT"]),
  paymentProvider: z
    .string()
    .refine((v) => allProviders.includes(v), "Provider tidak valid")
    .nullable()
    .optional(),
  paymentReference: z.string().trim().max(60).nullable().optional(),
  paymentAmount: z.number().int().min(0),
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;
