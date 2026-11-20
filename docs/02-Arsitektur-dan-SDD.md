# 02 — SYSTEM DESIGN DOCUMENT (SDD) & ARSITEKTUR TEKNIS
**Proyek:** MUBES SABA EXPLOIT — *Protocol: VALORANT*
**Dokumen:** `docs/02-Arsitektur-dan-SDD.md`
**Status:** Terkunci (Fase 2 SSOT)

---

## 1. ARSITEKTUR TINGKAT TINGGI (HIGH-LEVEL SYSTEM ARCHITECTURE)

Aplikasi ini mengimplementasikan arsitektur **Hybrid Monolith Full-Stack** berbasis **Next.js App Router** yang di-deploy secara *serverless* di **Vercel**, terhubung ke database **Neon PostgreSQL**, serta terintegrasi dengan **Resend API** untuk pengiriman email otomatis.

```text
+-----------------------------------+       +-----------------------------------+
|      PESERTA PUBLIK (Mobile/PC)   |       |    PANITIA HARI-H (Multi-Device)  |
|  - Buka Undangan & Wall Messages  |       |  - Login 1 Akun Bersama (JWT)     |
|  - Isi Form RSVP (Anti-Duplikat)  |       |  - Scan QR Kamera / Cari 3 Digit  |
|  - Preview & Unduh PNG E-Ticket   |       |  - Toggle Hadir/Konsumsi/Suvenir  |
+-----------------+-----------------+       +-----------------+-----------------+
                  |                                           |
                  | HTTPS (SSR + Server Actions)              | HTTPS (Protected Cookie + Actions)
                  v                                           v
+-------------------------------------------------------------------------------+
|                       NEXT.JS APP ROUTER (VERCEL SERVERLESS)                  |
|                                                                               |
|  +---------------------------+   +-----------------------------------------+  |
|  |   SERVER COMPONENTS       |   |       SERVER ACTIONS & ROUTE HANDLERS   |  |
|  |  - / (Landing + Wall)     |   |  - registerParticipantAction (Zod)      |  |
|  |  - /tiket/[code]          |   |  - checkInAndToggleAction (Atomic)      |  |
|  |  - /panitia/dashboard     |   |  - createOnTheSpotAction                |  |
|  +---------------------------+   |  - GET /api/ticket-image/[code] (PNG)   |  |
|                                  |  - GET /api/export (CSV UTF-8 BOM)      |  |
|                                  +--------------------+--------------------+  |
+-------------------------------------------------------|-----------------------+
                                                        |
                        +-------------------------------+-------------------------------+
                        |                                                               |
                        v                                                               v
        +-------------------------------+                               +-------------------------------+
        |       NEON POSTGRESQL         |                               |          RESEND API           |
        |  - Connection Pooling (HTTPS) |                               |  - Kirim E-Ticket HTML + Link |
        |  - Prisma ORM ($transaction)  |                               |  - Graceful Fallback jika fail|
        +-------------------------------+                               +-------------------------------+
```

---

## 2. PEMISAHAN SERVER COMPONENTS VS. CLIENT COMPONENTS

Untuk menjamin kecepatan muat awal (*First Contentful Paint*) di jaringan seluler peserta maupun meja registrasi hari-H, pemisahan komponen diatur sebagai berikut:

| Rute / Modul | Jenis Komponen | Tanggung Jawab Arsitektural |
| :--- | :--- | :--- |
| `src/app/page.tsx` | **Server Component** | Mengambil data konfigurasi acara (`EventSettings`) dan daftar pesan publik (`isMessageHidden: false`) langsung dari Neon PostgreSQL pada saat permintaan (*dynamic SSR*), lalu menyuntikkannya sebagai *props* ke komponen klien. |
| `src/components/public/CountdownTimer.tsx` | **Client Component** | Menghitung mundur waktu menuju **28 Desember 2026, 07:30 WIB** di sisi browser tanpa membebani server. |
| `src/components/public/RsvpForm.tsx` | **Client Component** | Mengelola state formulir pendaftaran, validasi awal, pemanggilan `registerParticipantAction`, serta pengalihan otomatis ke `/tiket/[code]`. |
| `src/components/public/WallOfMessages.tsx` | **Client Component** | Menerima seluruh pesan dari Server Component dan melakukan penyaringan kategori generasi (`Semua`, `Gen 21`, `Gen 18..14`) secara instan di memori menggunakan `useMemo`. |
| `src/app/tiket/[code]/page.tsx` | **Server Component** | Memvalidasi kode tiket (`SE-MUBES-XXX` atau token QR), mengambil data peserta + pengaturan acara dari Neon, dan merender kartu tiket. |
| `src/components/public/TicketActions.tsx` | **Client Component** | Menangani tombol unduh gambar PNG (`/api/ticket-image/[code]?download=1`), tombol salin tautan tiket, dan tombol *Kirim Ulang Email* dengan *cooldown* 60 detik. |
| `src/app/panitia/dashboard/page.tsx` | **Server Component** | Memverifikasi cookie sesi JWT panitia di server (redirect ke `/panitia/login` jika tidak valid), lalu memuat seluruh data peserta dan pengaturan acara. |
| `src/components/panitia/PanitiaWorkspace.tsx` | **Client Component** | Mengelola navigasi 4 tab internal (`Scanner`, `Peserta & OTS`, `Moderasi Pesan`, `Pengaturan`), kalkulasi KPI secara real-time, dan sinkronisasi data lewat `router.refresh()`. |
| `src/components/panitia/QrScannerPanel.tsx` | **Client Component** | Mengakses kamera belakang perangkat (`facingMode: "environment"`), membaca QR Code secara berkelanjutan dengan pengunci jeda (*scan lock*), dan menampilkan **Kartu Kontrol Peserta** (`Hadir`, `Konsumsi`, `Suvenir`). |

---

## 3. ARSITEKTUR E-TICKET DIGITAL & RENDERER PNG

Sistem menghasilkan kartu E-Ticket berdesain **VALORANT Agent Pass** tanpa ketergantungan pada *headless browser* (seperti Puppeteer) yang berat dan lambat di Vercel:

1. **Generator QR Code (`qrcode`):**
   - Payload di dalam QR Code adalah kode tiket unik peserta (contoh: `SE-MUBES-001`), bukan URL panjang, sehingga kepadatan titik QR tetap rendah, kotak QR lebih besar, dan kamera HP murah sekalipun mampu memindainya dalam waktu kurang dari `0.5 detik` meskipun dalam pencahayaan ruangan redup.
   - Server menghasilkan QR Code dalam format **SVG string / Data URL** beresolusi tinggi dengan tingkat koreksi kesalahan `M` (*Medium*).
2. **Dynamic Image Endpoint (`src/app/api/ticket-image/[code]/route.tsx`):**
   - Menggunakan **`ImageResponse` dari `next/og`** (Satori engine bawaan Next.js) untuk merender kartu E-Ticket vertikal beresolusi **`900 × 1500 px`** dalam format `image/png`.
   - Susunan visual di dalam PNG meliputi: latar gelap taktis `#0F1923`, aksen diagonal merah `#FF4655`, logo **Saba Exploit**, ilustrasi **Agent VALORANT**, nama lengkap peserta, badge generasi, jadwal & lokasi (**28 Des 2026 • Ruang Yudistira, SMAN 1 Bantul**), QR Code kontras tinggi di atas bidang putih bersih (`#FFFFFF` dengan *quiet zone* 16px agar 100% terbaca kamera), serta kode tiket `SE-MUBES-XXX`.
   - Jika parameter query `?download=1` disertakan, server menambahkan header `Content-Disposition: attachment; filename="E-Ticket-SE-MUBES-001.png"` agar browser langsung mengunduhnya ke galeri perangkat.

---

## 4. ARSITEKTUR PEMINDAI QR HARI-H (MOBILE-FIRST SCANNER)

Untuk mendukung meja registrasi hari-H menggunakan beberapa HP panitia secara bersamaan:

1. **Mesin Pemindai Kamera (`html5-qrcode`):**
   - Menginisialisasi kamera belakang (`facingMode: "environment"`) dengan rasio kotak bidik persegi (`qrbox: { width: 240, height: 240 }`).
   - **Mekanisme Anti-Double-Scan (*Cooldown Lock*):** Begitu kamera mendeteksi string QR yang valid (misalnya `SE-MUBES-012`), pemindai mengunci pembacaan kode yang sama selama **3 detik** agar tidak mengirim puluhan *request* beruntun saat tangan panitia masih memegang HP.
   - **Umpan Balik Sensorik:** Saat pemindaian berhasil, browser memutar bunyi *beep* sintetis ringan via Web Audio API (tanpa perlu file MP3 eksternal) dan memicu getaran halus (`navigator.vibrate(100)`) pada perangkat Android.
2. **Jalur Pencarian Manual Paralel:**
   - Di bagian atas layar scanner selalu tersedia input pencarian instan. Mengetik `012` atau `Raka` langsung menyaring daftar peserta di memori klien dan memunculkan **Kartu Kontrol Peserta** yang identik dengan hasil scan kamera.
3. **Kartu Kontrol Terpadu (1-Screen Multi-Action):**
   - Menampilkan identitas peserta, generasi, badge `OTS` (jika daftar di tempat), dan 3 tombol besar (`min-h-[48px]`):
     - **`HADIR`** (otomatis aktif saat QR pertama kali di-scan)
     - **`KONSUMSI`** (toggle instan untuk penyerahan konsumsi)
     - **`SUVENIR`** (toggle instan untuk penyerahan suvenir)
   - Setiap klik memanggil Server Action atomik `toggleParticipantStatusAction` dan melakukan pembaruan optimistik (*optimistic UI*) agar meja registrasi bebas antrean.

---

## 5. MANAJEMEN STATE, CACHE & KONEKSI NEON POSTGRESQL

### 5.1 Hukum Derived State (Anti-Stale UI)
- Di dalam `PanitiaWorkspace.tsx`, daftar seluruh peserta disimpan dalam satu sumber kebenaran (*single state array* yang disinkronkan dari Server Component melalui `router.refresh()`).
- Angka statistik KPI (**Total Terdaftar**, **Hadir**, **Konsumsi**, **Suvenir**, dan **Rekap per Generasi**) serta hasil pencarian/filter **wajib dihitung langsung menggunakan `useMemo`**, tidak pernah disimpan dalam `useState` terpisah.

### 5.2 Strategi Kesegaran Data (Tanpa Service Worker)
- Proyek ini **tidak menggunakan Service Worker (`public/sw.js`)** agar browser tidak pernah menyajikan halaman atau status tiket yang basi (*stale*).
- Halaman publik (`/`) dan dashboard panitia (`/panitia/dashboard`) menggunakan rendering dinamis (`export const dynamic = "force-dynamic"`).
- Setiap mutasi data melalui Server Actions wajib memanggil `revalidatePath("/")`, `revalidatePath("/tiket/[code]")`, dan `revalidatePath("/panitia/dashboard")`.

### 5.3 Pola Singleton Neon PostgreSQL + Prisma (`src/lib/prisma.ts`)
- Menggunakan URL koneksi ter-pool (*pooled connection string*) dari Neon (`DATABASE_URL`) dengan pola *global singleton* agar tidak terjadi kebocoran koneksi (*connection exhaustion*) saat pengembangan lokal maupun fungsi *serverless* Vercel.