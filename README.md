# Sistem Kasir Toko Parfum

Next.js 15 + TypeScript + Tailwind + Prisma + MySQL (Laragon) + NextAuth v5.

## Menjalankan (pertama kali)
1. Laragon: **Start All** (MySQL harus jalan).
2. Buat database kosong `parfum_store` (HeidiSQL / Laragon).
3. Salin `.env.example` menjadi `.env` (jika belum ada), isi `AUTH_SECRET` bebas.
4. Di terminal VS Code (folder project):
```
npm install
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```
5. Buka http://localhost:3000

Akun contoh: `admin / admin123` dan `kasir / kasir123`.

## Reset database (WAJIB bila sebelumnya sudah pernah migrate)
Schema berubah (kolom provider pembayaran), jadi:
1. Hapus folder `prisma/migrations` (di zip ini sudah kosong, jangan ada sisa).
2. Di HeidiSQL: drop database `parfum_store`, buat lagi kosong.
3. Jalankan: `npx prisma generate`, `npx prisma migrate dev --name init`, `npx prisma db seed`.

## Dipakai dari HP (WiFi yang sama)
```
npm run dev:lan
```
Cek IP PC dengan `ipconfig` (IPv4), lalu buka `http://IP-PC:3000` di HP. Izinkan Node.js di Windows Firewall.
Kamera HP tidak bisa untuk scan barcode lewat HTTP biasa; pakai alat scanner barcode (USB/Bluetooth, bekerja seperti keyboard) atau ketik manual.

## Fitur
- Admin: dashboard, barang (tambah/edit/hapus + upload foto), kategori, stok + riwayat, member, petugas, transaksi, laporan.
- Kasir: dashboard, POS (scan barcode + cari), member, riwayat transaksi sendiri, laporan sendiri.
- Pembayaran: Cash, QRIS, E-Wallet (GoPay, OVO, DANA, ShopeePay, LinkAja), Transfer Bank, Kartu Debit.
  **Catatan:** sistem hanya MENCATAT metode pembayaran, tidak terhubung ke payment gateway asli.
- Struk 80 mm: Cetak, dan "Download PDF" lewat dialog cetak browser (pilih *Save as PDF*).
- Laporan: hari ini / minggu ini / bulan ini / rentang tanggal, cetak, export CSV (dibuka di Excel).
- Hak akses dicek di server (bukan hanya menu disembunyikan).
- Tanpa foreign key di database (`relationMode = "prisma"`).

## Foto produk
Foto contoh berupa ilustrasi SVG di `public/images/products/`. Foto asli: Admin > Data Barang > Edit > Foto produk (JPG/PNG/WEBP, maks 2 MB). Foto upload disimpan di folder `storage/products`.

## Cek TypeScript
`npm run typecheck`
