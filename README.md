# Universal Next.js Starter Template

Starter template Next.js App Router yang bersih, optimal, dan bebas konten dummy. Didesain untuk memulai proyek **Website** maupun **Aplikasi Web** dalam hitungan detik.

## 🚀 Fitur Unggulan

- **Modern Tech Stack**: Next.js 16, React 19, TypeScript, Tailwind CSS v4.
- **Dual Layout Shells**:
  - `(web)`: Header atas + konten + footer untuk landing page & website publik.
  - `(app)`: Desktop sidebar + mobile floating glass BottomNav untuk aplikasi web / SaaS.
- **Design System High-Contrast**:
  - Mode Terang: Apple Soft Neutral (`#F5F5F7`), kartu putih bersih dengan garis tepi tegas (`border-zinc-200/90`).
  - Mode Gelap: Warm Charcoal (`#0F0F11` dan `#18181B`) anti-silau.
  - Tipografi humanis (`Plus Jakarta Sans`), utilitas `tabular-nums`, dan safe-area clearance mobile (`pb-safe`).
- **Komponen UI Siap Pakai**:
  - `Modal`: Bottom sheet adaptif di mobile & dialog terpusat di desktop via `createPortal`.
  - `CustomSelect`: Border tegas dengan fitur pencarian otomatis ketika opsi > 5.
  - `Toast`: Notifikasi event-driven (`toast.success()`, `toast.error()`, `toast.info()`).
  - `ThemeToggle`: Pengubah mode terang & gelap terintegrasi.
- **Anti-Slop Standard**: Bebas dekorasi neon tidak fungsional, target sentuh mobile minimal 44px.

## 📦 Menjalankan Template

```bash
# Instalasi dependensi
npm install

# Menjalankan server pengembangan
npm run dev

# Memeriksa tipe data TypeScript
npx tsc --noEmit

# Membangun untuk produksi
npm run build
```
# mubes-2026
