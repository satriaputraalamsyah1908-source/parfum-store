import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const categories = [
  { name: "Fresh", description: "Aroma segar dan ringan" },
  { name: "Floral", description: "Aroma bunga yang lembut" },
  { name: "Woody", description: "Aroma kayu yang hangat" },
  { name: "Oriental", description: "Aroma rempah dan manis yang pekat" },
  { name: "Sweet", description: "Aroma manis seperti vanila dan karamel" },
];

// Barcode contoh (EAN-13 dengan prefix internal toko). Ganti dengan barcode asli jika perlu.
function ean13(seq: number): string {
  const base = `20000${String(seq).padStart(7, "0")}`;
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += Number(base[i]) * (i % 2 === 0 ? 1 : 3);
  }
  return base + String((10 - (sum % 10)) % 10);
}

// Foto produk: ilustrasi SVG di public/images/products/<KODE>.svg
// Ganti dengan foto asli lewat menu Data Barang > Edit > Foto produk.
const products = [
  { code: "PRF001", name: "No. 5 Eau de Parfum", brand: "Chanel", category: "Floral", size: "100 ml", costPrice: 2400000, sellingPrice: 2950000, stock: 8, description: "Parfum floral aldehyde klasik." },
  { code: "PRF002", name: "Sauvage Eau de Toilette", brand: "Dior", category: "Fresh", size: "100 ml", costPrice: 1550000, sellingPrice: 1950000, stock: 14, description: "Aroma segar dengan sentuhan bergamot." },
  { code: "PRF003", name: "Libre Eau de Parfum", brand: "Yves Saint Laurent", category: "Floral", size: "90 ml", costPrice: 1700000, sellingPrice: 2150000, stock: 10, description: "Lavender dan bunga jeruk yang hangat." },
  { code: "PRF004", name: "Aventus", brand: "Creed", category: "Woody", size: "100 ml", costPrice: 4400000, sellingPrice: 5400000, stock: 3, description: "Fruity woody yang maskulin dan mewah." },
  { code: "PRF005", name: "Bleu de Chanel Eau de Parfum", brand: "Chanel", category: "Woody", size: "100 ml", costPrice: 2150000, sellingPrice: 2650000, stock: 9, description: "Woody aromatik yang elegan." },
  { code: "PRF006", name: "Wood Sage & Sea Salt Cologne", brand: "Jo Malone London", category: "Fresh", size: "100 ml", costPrice: 1900000, sellingPrice: 2350000, stock: 6, description: "Aroma pantai berangin dengan sage." },
  { code: "PRF007", name: "Black Orchid Eau de Parfum", brand: "Tom Ford", category: "Oriental", size: "100 ml", costPrice: 2400000, sellingPrice: 2950000, stock: 0, description: "Oriental gelap dengan truffle dan patchouli." },
  { code: "PRF008", name: "La Vie Est Belle Eau de Parfum", brand: "Lancome", category: "Sweet", size: "100 ml", costPrice: 1700000, sellingPrice: 2100000, stock: 12, description: "Iris dan praline yang manis." },
  { code: "PRF009", name: "Acqua di Gio Eau de Toilette", brand: "Giorgio Armani", category: "Fresh", size: "100 ml", costPrice: 1400000, sellingPrice: 1750000, stock: 15, description: "Aroma laut yang segar dan bersih." },
  { code: "PRF010", name: "1 Million Eau de Toilette", brand: "Paco Rabanne", category: "Sweet", size: "100 ml", costPrice: 1200000, sellingPrice: 1500000, stock: 11, description: "Manis rempah dengan kulit dan kayu manis." },
];

const members = [
  { memberCode: "MBR001", name: "Siti Rahma", phone: "081234567801", email: "siti@example.com", address: "Jl. Melati No. 1, Depok" },
  { memberCode: "MBR002", name: "Budi Santoso", phone: "081234567802", email: "budi@example.com", address: "Jl. Kenanga No. 5, Depok" },
  { memberCode: "MBR003", name: "Dewi Lestari", phone: "081234567803", email: "dewi@example.com", address: "Jl. Mawar No. 8, Jakarta" },
  { memberCode: "MBR004", name: "Andi Pratama", phone: "081234567804", email: null, address: "Jl. Anggrek No. 12, Bogor" },
  { memberCode: "MBR005", name: "Rina Kusuma", phone: "081234567805", email: "rina@example.com", address: null },
];

const paymentMethods = ["CASH", "QRIS", "TRANSFER", "EWALLET", "DEBIT"] as const;
const providerFor: Record<string, string[]> = {
  CASH: [],
  QRIS: [],
  TRANSFER: ["BCA", "Mandiri", "BNI", "BRI"],
  EWALLET: ["GoPay", "OVO", "DANA", "ShopeePay"],
  DEBIT: ["BCA", "Mandiri"],
};

function pad(n: number, size: number): string {
  return String(n).padStart(size, "0");
}

async function seedDemoTransactions(
  userIds: number[],
  productRows: { id: number; sellingPrice: number }[],
  memberIds: number[]
) {
  const existing = await prisma.transaction.count();
  if (existing > 0) return;

  // Pseudo-random deterministik agar hasil seed selalu sama
  let state = 7;
  const rand = () => {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };

  const now = new Date();

  for (let daysAgo = 13; daysAgo >= 0; daysAgo--) {
    const perDay = 1 + Math.floor(rand() * 3);

    for (let seq = 1; seq <= perDay; seq++) {
      const hour = daysAgo === 0 ? 8 : 9 + Math.floor(rand() * 11);
      const minute = Math.floor(rand() * 60);
      const createdAt = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - daysAgo,
        hour,
        minute
      );

      const itemCount = 1 + Math.floor(rand() * 3);
      const chosen = new Set<number>();
      while (chosen.size < itemCount) {
        chosen.add(Math.floor(rand() * productRows.length));
      }

      const lines = Array.from(chosen).map((index) => {
        const product = productRows[index];
        const quantity = 1 + Math.floor(rand() * 2);
        return {
          productId: product.id,
          quantity,
          price: product.sellingPrice,
          subtotal: product.sellingPrice * quantity,
        };
      });

      const subtotal = lines.reduce((sum, line) => sum + line.subtotal, 0);
      const method = paymentMethods[Math.floor(rand() * paymentMethods.length)];
      const paid = method === "CASH" ? Math.ceil(subtotal / 500000) * 500000 : subtotal;
      const options = providerFor[method];
      const provider = options.length ? options[Math.floor(rand() * options.length)] : null;
      const userId = userIds[Math.floor(rand() * userIds.length)];
      const memberId = rand() < 0.4 ? memberIds[Math.floor(rand() * memberIds.length)] : null;

      const invoiceNumber = `TRX-${createdAt.getFullYear()}${pad(createdAt.getMonth() + 1, 2)}${pad(createdAt.getDate(), 2)}-${pad(seq, 4)}`;

      await prisma.transaction.create({
        data: {
          invoiceNumber,
          userId,
          memberId,
          subtotal,
          discount: 0,
          total: subtotal,
          paymentMethod: method,
          paymentProvider: provider,
          paymentAmount: paid,
          changeAmount: paid - subtotal,
          status: "PAID",
          createdAt,
          details: { create: lines },
          payment: {
            create: { method, provider, amount: paid, status: "PAID", paidAt: createdAt },
          },
        },
      });
    }
  }
}

async function main() {
  console.log("Mulai seeding...");

  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: { name: "ADMIN" },
  });
  const kasirRole = await prisma.role.upsert({
    where: { name: "KASIR" },
    update: {},
    create: { name: "KASIR" },
  });

  const adminPassword = await bcrypt.hash("admin123", 10);
  const kasirPassword = await bcrypt.hash("kasir123", 10);

  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      name: "Administrator",
      username: "admin",
      email: "admin@parfumstore.local",
      password: adminPassword,
      roleId: adminRole.id,
    },
  });
  const kasir = await prisma.user.upsert({
    where: { username: "kasir" },
    update: {},
    create: {
      name: "Kasir Toko",
      username: "kasir",
      email: "kasir@parfumstore.local",
      password: kasirPassword,
      roleId: kasirRole.id,
    },
  });

  const categoryIds: Record<string, number> = {};
  for (const c of categories) {
    const row = await prisma.category.upsert({
      where: { name: c.name },
      update: {},
      create: c,
    });
    categoryIds[c.name] = row.id;
  }

  for (let i = 0; i < products.length; i++) {
    const { category, ...data } = products[i];
    const existing = await prisma.product.findUnique({ where: { code: data.code } });
    if (existing) continue;

    const created = await prisma.product.create({
      data: {
        ...data,
        barcode: ean13(i + 1),
        categoryId: categoryIds[category],
        unit: "pcs",
        image: `/images/products/${data.code}.svg`,
      },
    });

    if (created.stock > 0) {
      await prisma.stockHistory.create({
        data: {
          productId: created.id,
          type: "IN",
          quantity: created.stock,
          beforeStock: 0,
          afterStock: created.stock,
          description: "Stok awal (seed)",
          userId: admin.id,
        },
      });
    }
  }

  const memberIds: number[] = [];
  for (const m of members) {
    const row = await prisma.member.upsert({
      where: { memberCode: m.memberCode },
      update: {},
      create: m,
    });
    memberIds.push(row.id);
  }

  const productRows = await prisma.product.findMany({
    select: { id: true, sellingPrice: true },
    orderBy: { id: "asc" },
  });

  await seedDemoTransactions([admin.id, kasir.id], productRows, memberIds);

  console.log("Seeding selesai.");
}

main()
  .catch((e) => {
    console.error("Seeding gagal:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
