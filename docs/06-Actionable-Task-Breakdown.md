# 06 — PETA JALAN EKSEKUSI & ACTIONABLE TASK BREAKDOWN
**Proyek:** MUBES SABA EXPLOIT — *Protocol: VALORANT*
**Dokumen:** `docs/06-Actionable-Task-Breakdown.md`
**Status:** Terkunci (Fase 2 SSOT)

---

## 1. PRINSIP EKSEKUSI SEKUENSIAL (PHASE 3 PROTOCOL)

1. Pembangunan aplikasi wajib dijalankan secara berurutan dari **Milestone 1 hingga Milestone 8**.
2. AI Agent dilarang melompati milestone atau menulis fitur baru sebelum milestone sebelumnya lolos verifikasi `npx tsc --noEmit` (0 error).
3. Setiap milestone harus mematuhi seluruh aturan di `AGENTS.md` dan dokumen `docs/01` hingga `docs/05`.

---

## 2. DAFTAR MILESTONE PEMBANGUNAN

### Milestone 1 — Fondasi Proyek, Dependensi & Token Visual VALORANT
- **Tujuan:** Menyiapkan struktur proyek Next.js App Router, memasang dependensi inti, serta mengunci sistem desain **Dark Tactical VALORANT**.
- **Target File & Tugas:**
  1. Pastikan dependensi terpasang: `prisma`, `@prisma/client`, `zod`, `jose`, `resend`, `qrcode`, `@types/qrcode`, `html5-qrcode`, `lucide-react`.
  2. Tulis `src/app/globals.css` dengan `@import "tailwindcss";`, `@custom-variant dark (&:where(.dark, .dark *));`, variabel warna taktis (`--surface: #0f1923`, `--brand: #ff4655`, `--ink: #ece8e1`), serta utilitas `.valo-chamfer` dan `.valo-tactical-grid` sesuai `docs/04-UI-UX-Design-Manifesto.md`.
  3. Konfigurasikan `src/app/layout.tsx` dengan `<html lang="id" className="dark">`, font `Rajdhani`, `Plus_Jakarta_Sans`, dan `JetBrains_Mono`, serta metadata OpenGraph WhatsApp sesuai `docs/05-API-Keamanan-dan-Kontrak.md`.
  4. Buat `src/lib/constants.ts` berisi daftar generasi (`Gen 21` serta alumni `Gen 18`–`Gen 14`), helper format kode tiket `SE-MUBES-XXX`, dan konstanta acara.
  5. Siapkan folder `public/images/` beserta placeholder atau aset `logo-saba-exploit.png` dan `valorant-agent.png`.
- **Kriteria Lolos:** `npx tsc --noEmit` lolos tanpa error dan kanvas gelap taktis tampil bersih di browser.

### Milestone 2 — Skema Database Neon PostgreSQL & Seed Data
- **Tujuan:** Membangun model data `Participant` dan `EventSettings` di Neon PostgreSQL beserta data awal jadwal 28 Desember 2026.
- **Target File & Tugas:**
  1. Tulis `prisma/schema.prisma` persis sesuai `docs/03-Skema-Data-dan-ACID.md`.
  2. Buat singleton koneksi database di `src/lib/prisma.ts`.
  3. Buat `prisma/seed.ts` yang bersifat idempoten (`upsert`) untuk mengisi `EventSettings` (*28 Desember 2026, 07.30 WIB – Selesai, Ruang Yudistira, SMA Negeri 1 Bantul*, dummy rundown, dan dummy narahubung Humas).
  4. Jalankan `npx prisma generate`, `npx prisma db push`, dan `npx prisma db seed`.
- **Kriteria Lolos:** `npx prisma validate` sukses dan baris `EventSettings` (`id: "default"`) tersimpan di Neon.

### Milestone 3 — Validasi Zero-Trust, Autentikasi Multi-Device & Integrasi Resend
- **Tujuan:** Menyiapkan lapisan keamanan, validasi Zod, sesi JWT panitia multi-device, dan utilitas pengiriman email otomatis.
- **Target File & Tugas:**
  1. Tulis seluruh skema Zod dan fungsi normalisasi WhatsApp (`628...`) di `src/lib/validations.ts`.
  2. Implementasikan `src/lib/auth.ts` (`signPanitiaToken`, `verifyPanitiaSession`, `requirePanitiaSession`) menggunakan `jose` dan `HTTP-only cookie`.
  3. Implementasikan `src/lib/email.ts` (`sendTicketEmail`) menggunakan SDK `resend` dengan desain email HTML taktis dan *graceful fallback* jika API key belum terpasang.
- **Kriteria Lolos:** Seluruh fungsi terkompilasi bersih (`npx tsc --noEmit` 0 error) tanpa kebocoran tipe `any`.

### Milestone 4 — Server Actions Publik & Halaman Undangan Utama (`/`)
- **Tujuan:** Membangun halaman undangan publik bertema VALORANT yang interaktif, formulir RSVP anti-duplikasi, dan *Wall of Messages*.
- **Target File & Tugas:**
  1. Implementasikan `src/actions/registration.actions.ts` (`registerParticipantAction` dengan transaksi atomik `$transaction` + retry loop `P2002`, serta pengecekan anti-duplikasi email).
  2. Bangun komponen publik di `src/components/public/`:
     - `HeroBriefing.tsx` (Logo Saba Exploit, ilustrasi Agent VALORANT, judul acara, jadwal & lokasi, `CountdownTimer.tsx`, dan CTA utama).
     - `EventBriefingSection.tsx` (Target generasi `Gen 21` & Alumni `Gen 18–14`, susunan acara *rundown*, dan kartu kontak WhatsApp Humas).
     - `RsvpForm.tsx` (Form pendaftaran dengan tombol pilihan generasi, validasi, dan checkbox *"Tampilkan sebagai Agent Rahasia (Anonim)"*).
     - `WallOfMessages.tsx` (Papan aspirasi lintas generasi dengan filter tab generasi berbasis `useMemo`).
  3. Rakit halaman utama `src/app/page.tsx` sebagai Server Component dinamis (`export const dynamic = "force-dynamic"`).
- **Kriteria Lolos:** Pendaftaran berhasil membuat kode `SE-MUBES-001` di Neon, mendaftar ulang dengan email yang sama mengembalikan tiket lama, dan pesan tampil di *Wall of Messages*.

### Milestone 5 — E-Ticket Digital (`/tiket/[code]`) & Generator PNG (`/api/ticket-image/[code]`)
- **Tujuan:** Menyediakan kartu E-Ticket digital berdesain VALORANT Agent Pass yang dapat dilihat langsung, diunduh sebagai file PNG resolusi tinggi, dan dikirim ulang ke email.
- **Target File & Tugas:**
  1. Bangun `src/app/api/ticket-image/[code]/route.tsx` menggunakan `ImageResponse` (`next/og`) berukuran `900 × 1500 px` dengan QR Code kontras tinggi di atas bidang putih bersih (`#FFFFFF`) dan dukungan `?download=1`.
  2. Bangun `src/app/tiket/[code]/page.tsx` dan `src/components/public/TicketActions.tsx` (tombol **Download E-Ticket (PNG)**, salin kode/tautan, dan **Kirim Ulang ke Email** dengan jeda 60 detik via `resendTicketEmailAction`).
- **Kriteria Lolos:** Gambar PNG E-Ticket terunduh utuh ke perangkat dan QR Code di dalamnya dapat terbaca jelas oleh kamera.

### Milestone 6 — Autentikasi Panitia (`/panitia/login`) & Dashboard KPI (`/panitia/dashboard`)
- **Tujuan:** Membangun gerbang masuk panitia multi-device dan ruang kerja internal berbasis tab.
- **Target File & Tugas:**
  1. Implementasikan `src/actions/auth.actions.ts` (`loginPanitiaAction`, `logoutPanitiaAction`) dan halaman `src/app/panitia/login/page.tsx`.
  2. Implementasikan seluruh mutasi terproteksi di `src/actions/panitia.actions.ts` (`scanQrCheckInAction`, `toggleParticipantStatusAction`, `createOnTheSpotAction`, `toggleMessageVisibilityAction`, `updateEventSettingsAction`).
  3. Bangun halaman server `src/app/panitia/dashboard/page.tsx` (dengan verifikasi sesi wajib) dan kerangka klien `src/components/panitia/PanitiaWorkspace.tsx` lengkap dengan **KPI Bar Real-Time** (`Total`, `Hadir`, `Konsumsi`, `Suvenir`, dan `Rekap per Generasi` menggunakan `useMemo`).
- **Kriteria Lolos:** Login panitia berhasil di beberapa browser/perangkat bersamaan dan statistik KPI terhitung otomatis.

### Milestone 7 — Tactical QR Scanner, Kontrol Konsumsi/Suvenir, OTS & Export CSV
- **Tujuan:** Menyelesaikan seluruh fitur operasional lapangan hari-H dan pelaporan pasca-acara.
- **Target File & Tugas:**
  1. Bangun `src/components/panitia/QrScannerPanel.tsx` menggunakan `html5-qrcode` (kamera belakang, *cooldown lock* 3 detik, bunyi *beep* Web Audio API, kolom pencarian manual 3 digit kode tiket/nama, dan **Kartu Kontrol Peserta** dengan 3 tombol sentuh besar `min-h-[44px]`: `HADIR`, `KONSUMSI`, `SUVENIR`).
  2. Bangun `src/components/panitia/ParticipantsTablePanel.tsx` dan modal `OnTheSpotModal.tsx` untuk pendaftaran cepat di tempat.
  3. Bangun `src/components/panitia/MessageModerationPanel.tsx` (tombol sembunyikan/tampilkan pesan) dan `src/components/panitia/EventSettingsPanel.tsx` (form edit jadwal, rundown, dan kontak Humas).
  4. Buat `src/app/api/export/route.ts` untuk mengunduh file CSV (`UTF-8 BOM`) terproteksi sesi panitia.
- **Kriteria Lolos:** Scan QR via HP langsung menandai hadir dan memunculkan toggle konsumsi/suvenir; input OTS berjalan lancar; unduhan CSV terbuka rapi di Excel.

### Milestone 8 — Audit Kualitas, Responsivitas Mobile (`375px`) & Deployment Vercel
- **Tujuan:** Memastikan aplikasi bebas *bug*, mematuhi aturan *Anti-AI Slop*, dan siap dipublikasikan ke domain `.my.id`.
- **Target File & Tugas:**
  1. Jalankan `npx tsc --noEmit` dan `npm run build` untuk memastikan proses build produksi Vercel 100% sukses.
  2. Lakukan audit tata letak pada ukuran layar **Mobile (`375px`)** dan **Desktop (`1440px`)**: pastikan tidak ada kotak ikon dekoratif, tidak ada teks metadata yang patah ke bawah, dan seluruh tombol minimal `44px`.
  3. Siapkan panduan konfigurasi Environment Variables di Vercel dan penyambungan DNS domain `.my.id`.
- **Kriteria Lolos:** `npm run build` selesai tanpa error dan seluruh alur *end-to-end* terverifikasi.