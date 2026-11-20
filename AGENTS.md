# AGENTS.md — KONSTITUSI PROYEK & TECHNICAL GUIDELINES (SSOT)
**Proyek:** MUBES SABA EXPLOIT — *Protocol: VALORANT* (Event Portal, E-Ticket Generator, & Tactical Check-In System)
**Organisasi:** Saba ExploIT (`@sabaexploit`) — SMA Negeri 1 Bantul
**Jalur Arsitektur:** TRACK C — Hybrid Platform (Public Event Landing Page + Authenticated Panitia Workspace)

---

## 1. VISI PRODUK & KONTEKS OPERASIONAL

Aplikasi web ini dibangun di atas fondasi **Universal Next.js Starter** untuk mendukung pelaksanaan **Musyawarah Besar (Mubes) Saba ExploIT** yang diselenggarakan oleh panitia **Gen 20 (Kelas 11)** dan **Gen 19 (Kelas 12)** pada:
- **Tanggal & Waktu:** Senin, 28 Desember 2026, pukul 07.30 WIB – Selesai
- **Lokasi:** Ruang Yudistira, SMA Negeri 1 Bantul
- **Target Peserta:** Anggota aktif Kelas 10 (**Gen 21**) serta 5 generasi alumni (**Gen 18, Gen 17, Gen 16, Gen 15, dan Gen 14**) dari seluruh divisi (**Programming, Design, Photography, Cinematography, Technopreneurship**).

Sistem ini menggabungkan dua pengalaman utama dalam satu ekosistem terpadu:
1. **Public Event Landing Page & RSVP Portal (`(web)` Route Group):** Halaman undangan digital bertema **VALORANT** (*Single Dark Tactical Theme*: Merah `#FF4655`, Dark Navy `#0F1923`, Off-White `#ECE8E1`) yang memuat informasi acara, rundown, narahubung Humas, *Wall of Messages* lintas generasi, formulir konfirmasi kehadiran anti-duplikasi berbasis nomor WhatsApp, serta pembuatan **E-Ticket QR (PNG)** instan yang langsung tampil di layar sekaligus terkirim otomatis ke **WhatsApp** pendaftar melalui Cloud WhatsApp Gateway API.
2. **Authenticated Panitia Workspace & Tactical Scanner (`(app)` Route Group):** Ruang kerja internal dengan **1 akun panitia multi-device** untuk memindai QR Code via kamera HP, mencatat kehadiran + pengambilan konsumsi + pengambilan suvenir dalam satu layar, melakukan pendaftaran *On-The-Spot* (OTS), memoderasi *Wall of Messages*, memperbarui detail acara, dan mengunduh laporan CSV (UTF-8 BOM) untuk LPJ.

---

## 2. PETA DOKUMEN SINGLE SOURCE OF TRUTH (WAJIB BACA)

Sebelum menulis, memodifikasi, atau melakukan *refactoring* pada baris kode apa pun, AI Agent **WAJIB** membaca dokumen spesifikasi terkait di dalam folder `/docs/`:

1. `docs/01-PRD-dan-Logika-Bisnis.md` — Spesifikasi fitur lengkap, alur pengguna publik & panitia, matriks hak akses, dan aturan penanganan *edge cases* (duplikasi WhatsApp, OTS, un-toggle status).
2. `docs/02-Arsitektur-dan-SDD.md` — Arsitektur Next.js App Router, pemisahan *Server Components* vs *Client Components*, hukum *derived state*, dan strategi caching tanpa Service Worker.
3. `docs/03-Skema-Data-dan-ACID.md` — Cetak biru lengkap `prisma/schema.prisma` untuk **Neon PostgreSQL**, aturan penomoran kode tiket `SE-MUBES-XXX`, dan hukum transaksi atomik `$transaction`.
4. `docs/04-UI-UX-Design-Manifesto.md` — Undang-undang desain visual **Dark Tactical VALORANT**, token warna semantik `globals.css`, slot karakter Agent Valorant, tipografi, dan aturan keras **Anti-AI Slop**.
5. `docs/05-API-Keamanan-dan-Kontrak.md` — Kontrak Server Actions & API Routes, standar `ActionResponse<T>`, validasi **Zod** *Zero-Trust*, autentikasi multi-device, integrasi WhatsApp Gateway API, dan SEO OpenGraph.
6. `docs/06-Actionable-Task-Breakdown.md` — Peta jalan eksekusi berurutan (*Milestone 1* hingga *Milestone 8*) yang wajib dijalankan secara bertahap.

---

## 3. CORE STACK & DEPENDENCIES

- **Framework & Runtime:** Next.js 16 (App Router) + React 19 + React DOM 19 + TypeScript
- **Styling & Motion:** Tailwind CSS v4 (`@tailwindcss/postcss`), Framer Motion, Lucide React, `clsx`, `tailwind-merge` (via `cn()` di `src/lib/utils.ts`)
- **Database & ORM:** Neon Serverless PostgreSQL + Prisma ORM (`prisma`, `@prisma/client`)
- **Keamanan & Validasi:** `zod` (Zero-Trust server validation) & `jose` (Stateless JWT session cookie)
- **Domain Utilities:** Cloud WhatsApp REST Gateway (`fetch` server-to-server), `qrcode` & `@types/qrcode` (QR Generator), `html5-qrcode` (Browser camera scanner)

---

## 4. ARSITEKTUR & KONVENSI DIREKTORI TERPADU

```text
mubes-saba-exploit/
├── AGENTS.md                                  # Konstitusi utama & panduan teknis (dokumen ini)
├── docs/
│   ├── 01-PRD-dan-Logika-Bisnis.md            # Spesifikasi fitur, alur bisnis & edge cases
│   ├── 02-Arsitektur-dan-SDD.md               # Arsitektur Next.js, komponen & state
│   ├── 03-Skema-Data-dan-ACID.md              # Schema Prisma Neon & hukum transaksi ACID
│   ├── 04-UI-UX-Design-Manifesto.md           # Token desain Valorant, tipografi & Anti-AI Slop
│   ├── 05-API-Keamanan-dan-Kontrak.md         # Server Actions, Zod schemas, WA Gateway & SEO
│   └── 06-Actionable-Task-Breakdown.md        # Tahapan implementasi berurutan
├── prisma/
│   ├── schema.prisma                          # Model database Neon PostgreSQL
│   └── seed.ts                                # Data awal EventSettings (jadwal, rundown, kontak)
├── public/
│   └── images/
│       ├── logo-saba-exploit.png              # Logo resmi Saba ExploIT (merah-hitam-putih)
│       └── valorant-agent.png                 # Slot render karakter Agent Valorant (Hero & Tiket)
└── src/
    ├── app/
    │   ├── globals.css                        # Tailwind v4, @custom-variant dark, & token Valorant
    │   ├── layout.tsx                         # Root layout (Font, Dark lock, ToastContainer, SEO)
    │   ├── (web)/                             # Route group publik (URL tanpa prefix /web)
    │   │   ├── layout.tsx                     # Layout publik (Tactical Top Bar + Footer)
    │   │   ├── page.tsx                       # Halaman Undangan Utama (/)
    │   │   └── tiket/[code]/
    │   │       └── page.tsx                   # Halaman Pratinjau & Unduh PNG E-Ticket (/tiket/[code])
    │   ├── (app)/                             # Route group internal panitia (URL tanpa prefix /app)
    │   │   └── panitia/
    │   │       ├── login/
    │   │       │   └── page.tsx               # Halaman Login 1 Akun Multi-Device (/panitia/login)
    │   │       └── dashboard/
    │   │           └── page.tsx               # Workspace Panitia & Scanner (/panitia/dashboard)
    │   └── api/
    │       ├── ticket-image/[code]/
    │       │   └── route.tsx                  # Generator gambar E-Ticket PNG dinamis (ImageResponse)
    │       └── export/
    │           └── route.ts                   # Endpoint unduh CSV (UTF-8 BOM) terproteksi sesi
    ├── components/
    │   ├── layout/                            # Komponen layout starter (sesuaikan untuk Tactical UI)
    │   ├── theme/                             # ThemeProvider (dikunci pada mode dark)
    │   ├── ui/                                # Komponen headless starter (Modal, CustomSelect, Toast)
    │   ├── public/                            # Komponen undangan, form RSVP, kartu tiket, wall
    │   └── panitia/                           # Komponen QR scanner kamera, tabel peserta, modal OTS
    ├── hooks/
    │   └── useBodyScrollLock.ts               # Hook bawaan starter untuk penguncian scroll modal
    ├── lib/
    │   ├── utils.ts                           # Helper cn() bawaan starter
    │   ├── prisma.ts                          # Singleton Prisma Client untuk Neon PostgreSQL
    │   ├── auth.ts                            # Utilitas sign/verify JWT cookie sesi panitia
    │   ├── whatsapp.ts                        # Integrasi Cloud WhatsApp Gateway API (E-Ticket PNG)
    │   ├── validations.ts                     # Skema validasi Zod terpusat (publik & panitia)
    │   └── constants.ts                       # Daftar divisi, generasi (Gen 21, 18..14) & konstanta
    └── actions/
        ├── registration.actions.ts            # Server Actions pendaftaran publik & kirim ulang WA
        ├── auth.actions.ts                    # Server Actions login & logout panitia
        └── panitia.actions.ts                 # Server Actions check-in QR, konsumsi/suvenir, OTS, setting
```

---

## 5. DIRECTIVES, INVARIANTS & HARD GUARDRAILS

1. **Dual Route Separation (`(web)` vs `(app)`):** Halaman publik (`/`, `/tiket/[code]`) wajib berada di `src/app/(web)/`, dan halaman internal panitia (`/panitia/login`, `/panitia/dashboard`) wajib berada di `src/app/(app)/`.
2. **Pemanfaatan Komponen UI Starter:** Gunakan `Modal` (ter-portal ke `document.body`) untuk modal OTS dan `Toast` (`toast.success()`, `toast.error()`, `toast.info()`) untuk notifikasi. Jangan menerapkan `transform` permanen pada wrapper halaman utama.
3. **Database & Transaksi ACID (Neon PostgreSQL + Prisma):** Dilarang menjalankan `--force-reset` atau `migrate reset`. Pembuatan `ticketSequence` (`SE-MUBES-001`) wajib dibungkus dalam `prisma.$transaction` dengan *retry* jika terjadi benturan `P2002`.
4. **Anti-Duplikasi WhatsApp:** Satu nomor WhatsApp (`628...`) hanya boleh memiliki satu tiket aktif. Pendaftaran ulang dengan nomor WhatsApp yang sama mengembalikan tiket lama agar peserta dapat mengunduh ulang PNG atau mengirim ulang pesan WhatsApp.
5. **Validasi Zero-Trust & Multi-Device Auth:** Semua input form publik dan panitia divalidasi dengan **Zod** di server. Sesi panitia menggunakan *stateless signed JWT* di cookie (`HTTP-only`) agar banyak perangkat bisa login bersamaan.
6. **Single Dark Tactical Theme & Anti-AI Slop:** Kunci tema ke `dark` tanpa `ThemeToggle`. Wajib menggunakan `@custom-variant dark (&:where(.dark, .dark *));` di `globals.css`, **Naked Icons Only** (dilarang membungkus ikon dengan kotak/lingkaran warna), baris metadata horizontal wajib memakai `min-w-0 flex-1` + `whitespace-nowrap truncate`, dan seluruh target sentuh minimal `44x44px` (`min-h-[44px]`).
7. **Tanpa Service Worker & Tanpa Stale Derived State:** Dilarang memasang `public/sw.js` dan dilarang menyalin data filter/KPI ke `useState` terpisah (gunakan `useMemo`).
8. **Git Policy:** Dilarang menjalankan `git commit` atau `git push` kecuali diperintahkan secara eksplisit oleh pengguna.