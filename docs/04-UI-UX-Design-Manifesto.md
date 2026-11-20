# 04 — UI/UX DESIGN MANIFESTO & ATURAN ANTI-AI SLOP
**Proyek:** MUBES SABA EXPLOIT — *Protocol: VALORANT*
**Dokumen:** `docs/04-UI-UX-Design-Manifesto.md`
**Status:** Terkunci (Fase 2 SSOT)

---

## 1. IDENTITAS VISUAL & FILOSOFI DESAIN

Desain aplikasi ini memadukan tiga warna kebesaran organisasi **Saba Exploit** (**Merah, Hitam, dan Putih**) dengan bahasa visual taktis **VALORANT** (*Tactical Agent Briefing UI*).

### 1.1 Prinsip Estetika Utama
1. **Single Dark Tactical Theme:** Seluruh aplikasi (halaman undangan publik, halaman E-Ticket, halaman login, dan dashboard scanner panitia) dikunci dalam satu tema gelap taktis (`<html class="dark">`) tanpa pengalih mode terang.
2. **Tactical HUD, Bukan Template Polosan:** Menghindari tampilan kotak hitam-merah polos dengan menghadirkan elemen khas antarmuka *Agent Select* VALORANT: potongan sudut diagonal (*chamfered edges*), garis koordinat halus (`1px solid`), penanda bidik (*crosshair* `+`), indeks seksi bernomor (`// 01 — BRIEFING`), dan slot khusus ilustrasi karakter **Agent VALORANT**.
3. **Kontras Tinggi & Keterbacaan Lapangan:** Teks utama menggunakan *Off-White* hangat (`#ECE8E1`) di atas kanvas biru-hitam gelap (`#0F1923`) sehingga nyaman dibaca di layar HP dalam ruangan maupun di meja registrasi hari-H.

---

## 2. TOKEN WARNA & KONFIGURASI `src/app/globals.css` (TAILWIND V4)

AI Agent wajib menuliskan konfigurasi berikut di `src/app/globals.css`. Baris `@custom-variant dark` wajib berada tepat di bawah `@import "tailwindcss";` agar utilitas kelas gelap Tailwind v4 bekerja presisi:

```css
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));

:root,
.dark {
  /* Kanvas & Permukaan Taktis (VALORANT Palette) */
  --surface: #0f1923;        /* Latar utama kanvas gelap taktis */
  --surface-alt: #14202c;    /* Latar seksi sekunder */
  --card: #182533;           /* Permukaan kartu informasi & form */
  --card-elevated: #1f2f40;  /* Permukaan hover & kartu aktif */

  /* Garis & Pembatas HUD */
  --edge: #2a3b4c;           /* Border struktural 1px */
  --edge-strong: #3e546b;    /* Border penekanan & input focus */

  /* Tipografi & Kontras */
  --ink: #ece8e1;            /* Teks utama (Valorant Off-White) */
  --ink-muted: #8b97a4;      /* Teks sekunder & metadata */
  --ink-subtle: #5c6977;     /* Label koordinat HUD */

  /* Aksen Utama Saba Exploit x VALORANT */
  --brand: #ff4655;          /* Merah utama Saba Exploit / Valorant */
  --brand-hover: #e03543;    /* State hover tombol utama */
  --brand-ink: #ffffff;      /* Teks di atas tombol merah */

  /* Status Operasional Hari-H */
  --status-ok: #10b981;      /* Hijau status Hadir / Tervalidasi */
  --status-warn: #f59e0b;    /* Kuning status OTS / Peringatan */
}

@layer base {
  html {
    background-color: var(--surface);
    color: var(--ink);
    scroll-behavior: smooth;
  }

  body {
    background-color: var(--surface);
    color: var(--ink);
    font-feature-settings: "cv02", "cv03", "cv04", "cv11";
    overflow-x: hidden;
  }
}

/* Geometri Sudut Terpotong Khas VALORANT (Chamfered Corners) */
.valo-chamfer {
  clip-path: polygon(
    0 0,
    calc(100% - 14px) 0,
    100% 14px,
    100% 100%,
    14px 100%,
    0 calc(100% - 14px)
  );
}

.valo-chamfer-sm {
  clip-path: polygon(
    0 0,
    calc(100% - 8px) 0,
    100% 8px,
    100% 100%,
    8px 100%,
    0 calc(100% - 8px)
  );
}

/* Pola Grid Taktis Halus untuk Latar Hero */
.valo-tactical-grid {
  background-image:
    linear-gradient(to right, rgba(236, 232, 225, 0.04) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(236, 232, 225, 0.04) 1px, transparent 1px);
  background-size: 40px 40px;
}
```

---

## 3. SISTEM TIPOGRAFI & HIERARKI SKALA

Gunakan `next/font/google` di `src/app/layout.tsx` untuk memuat tiga keluarga font berikut:

| Peran Tipografi | Font Family | Karakteristik & Penggunaan |
| :--- | :--- | :--- |
| **Display & Judul Seksi** | `Rajdhani` *(weight 600, 700)* | Tegas, bersudut tajam ala esports/tactical shooter. Digunakan pada Hero Title, judul seksi (`// 01 — BRIEFING`), nama peserta di E-Ticket, dan angka KPI dashboard. Gunakan `uppercase` dan `tracking-wider`. |
| **Teks Bacaan & Form** | `Plus Jakarta Sans` *(weight 400, 500, 600, 700)* | Bersih, modern, dan sangat nyaman dibaca untuk deskripsi acara, rundown, input formulir, serta kartu *Wall of Messages*. |
| **Kode Tiket & Data Teknis** | `JetBrains Mono` *(weight 500, 700)* | Monospace presisi untuk kode tiket (`SE-MUBES-001`), angka hitung mundur (*countdown*), jam rundown, dan koordinat HUD. |

---

## 4. ELEMEN AUTENTIK VALORANT & SLOT ASET VISUAL

Agar nuansa VALORANT terasa kuat dan tidak seperti website polosan:

### 4.1 Slot Karakter Agent VALORANT (`public/images/valorant-agent.png`)
- **Penempatan Hero:** Di bagian kanan Hero Section (desktop) dan bagian atas-tengah (mobile), tampilkan render karakter Agent VALORANT (`/images/valorant-agent.png`) di depan blok aksen diagonal merah `#FF4655` dengan tipografi watermark raksasa beropasitas rendah (`SABA // EXPLOIT`) di belakang karakter.
- **Fallback Otomatis:** Komponen pembungkus gambar wajib memiliki penanganan `onError` sehingga jika file `valorant-agent.png` belum diganti atau sedang kosong, sistem menampilkan siluet lambang taktis Saba Exploit tanpa ikon gambar rusak (*broken image*).
- **Logo Organisasi (`public/images/logo-saba-exploit.png`):** Ditempatkan pada *Navbar* atas (tinggi `36px`), bagian *Footer*, dan bagian kepala kartu **E-Ticket**.

### 4.2 Struktur Tata Letak Halaman Undangan (`/`)
1. **Top Tactical Bar:** Logo Saba Exploit di kiri, badge status acara (`PROTOCOL: MUBES 2026`) dan tautan kecil `Panitia` di kanan.
2. **Hero Briefing:**
   - Kiri: Tag koordinat `// SMAN 1 BANTUL — RUANG YUDISTIRA`, judul besar **MUSYAWARAH BESAR SABA EXPLOIT**, subjudul tema **VALORANT EDITION**, kotak tanggal & waktu (**28 Desember 2026 • 07.30 WIB – Selesai**), *Live Countdown*, dan tombol utama `KONFIRMASI KEHADIRAN` (menggunakan `.valo-chamfer` dengan warna `--brand`).
   - Kanan: Bingkai taktis karakter Agent VALORANT.
3. **Seksi `// 01 — TARGET GENERASI`:** Deretan badge generasi yang diundang (`Gen 21` Kelas 10 + `Gen 18`, `Gen 17`, `Gen 16`, `Gen 15`, `Gen 14` Alumni) beserta keterangan panitia penyelenggara (`Gen 20` & `Gen 19`).
4. **Seksi `// 02 — SUSUNAN ACARA & NARAHUBUNG`:** Daftar *rundown* vertikal dengan garis penanda waktu `JetBrains Mono` dan kartu kontak WhatsApp Humas.
5. **Seksi `// 03 — REGISTRASI AGENT (RSVP FORM)`:** Kartu formulir pendaftaran dengan fokus border merah `#FF4655` saat input aktif, pilihan generasi berbentuk grid tombol yang mudah di-tap di HP, serta opsi centang *"Tampilkan sebagai Agent Rahasia (Anonim)"*.
6. **Seksi `// 04 — WALL OF MESSAGES`:** Filter tab generasi di bagian atas dan susunan grid kartu aspirasi alumni & anggota aktif.

---

## 5. SPESIFIKASI KARTU E-TICKET DIGITAL (VALORANT AGENT PASS)

Baik pada pratinjau halaman `/tiket/[code]` maupun gambar PNG yang diunduh dari `/api/ticket-image/[code]`, kartu E-Ticket dirancang menyerupai **Kartu Identitas Agent VALORANT**:

1. **Header Kartu:** Logo Saba Exploit + tulisan `SABA EXPLOIT // MUBES 2026` + label `OFFICIAL PASS`.
2. **Zona Identitas Peserta:**
   - Latar gelap `#0F1923` dengan garis aksen merah `#FF4655` di sisi kiri dan ilustrasi halus Agent VALORANT di sisi kanan.
   - **Nama Lengkap Peserta** (huruf kapital tebal `Rajdhani`).
   - **Badge Generasi** (contoh: `GEN 17 • ALUMNI` atau `GEN 21 • AKTIF`).
3. **Zona Pemindaian QR (Wajib Kontras Tinggi):**
   - Kotak putih solid (`#FFFFFF`) dengan *padding* (`quiet zone`) minimal `16px` di sekeliling QR Code hitam pekat (`#000000`). **DILARANG** membuat QR Code transparan di atas latar gelap karena akan sulit terbaca oleh kamera HP di meja registrasi.
   - Tepat di bawah QR Code tercantum kode tiket besar ber-font monospace: **`SE-MUBES-001`**.
4. **Footer Kartu:** Tanggal (**28 Des 2026 • 07.30 WIB**) dan Lokasi (**Ruang Yudistira, SMA Negeri 1 Bantul**).

---

## 6. UNDANG-UNDANG ANTI-AI SLOP & RESPONSIVITAS MOBILE (`375px`)

AI Agent dilarang keras melanggar aturan visual berikut saat menulis JSX/TSX:

1. **Zero Decorative Icon Wrappers (Naked Icons Only):**
   - **DILARANG:** `<div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center"><Calendar className="w-5 h-5 text-red-500" /></div>`
   - **WAJIB:** `<Calendar className="h-5 w-5 shrink-0 text-[#FF4655]" />` (ikon ditampilkan langsung tanpa kotak/lingkaran berwarna di belakangnya).
2. **Larangan Efek Gradien & Glow Berlebihan:**
   - Dilarang menggunakan `bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 bg-clip-text text-transparent`.
   - Dilarang menggunakan bayangan berpendar (`shadow-[0_0_30px_rgba(255,70,85,0.6)]`) atau animasi `animate-ping` / `animate-pulse` pada teks maupun tombol.
3. **Anti-Flex-Wrap Regression pada Metadata:**
   - Setiap baris metadata horizontal (contoh: `Gen 18 • SE-MUBES-014` atau status `Hadir • Konsumsi`) wajib menerapkan:
     - Kontainer teks induk: `min-w-0 flex-1`
     - Baris metadata: `flex flex-row items-center gap-2 whitespace-nowrap truncate`
   - Hal ini mencegah teks metadata patah menjadi beberapa baris sempit pada layar ponsel `375px`.
4. **Ergonomi Sentuh Meja Registrasi (`min-h-[44px]`):**
   - Seluruh tombol aksi (`KONFIRMASI KEHADIRAN`, `DOWNLOAD E-TICKET`, tombol scanner `HADIR`, `KONSUMSI`, `SUVENIR`, tombol tab dashboard, dan seluruh input form) wajib memiliki tinggi minimal `44px` (`min-h-[44px]`).