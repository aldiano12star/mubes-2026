# 01 — PRODUCT REQUIREMENTS DOCUMENT (PRD) & LOGIKA BISNIS

**Proyek:** MUBES SABA EXPLOIT — _Protocol: VALORANT_
**Dokumen:** `docs/01-PRD-dan-Logika-Bisnis.md`
**Status:** Terkunci (Fase 2 SSOT)

---

## 1. RINGKASAN EKSEKUTIF & TUJUAN ACARA

### 1.1 Latar Belakang

**Musyawarah Besar (Mubes) Saba Exploit** adalah agenda tahunan organisasi **Saba Exploit** di **SMA Negeri 1 Bantul** yang diselenggarakan oleh pengurus aktif kelas 11 (**Gen 20**) dan kelas 12 (**Gen 19**). Acara ini mempertemukan anggota baru kelas 10 (**Gen 21**) dengan **5 generasi alumni** (**Gen 18, Gen 17, Gen 16, Gen 15, dan Gen 14**) dalam suasana santai, akrab, dan penuh kekeluargaan.

Agenda utama kegiatan meliputi:

1. Pembukaan dan pembahasan singkat Anggaran Dasar / Anggaran Rumah Tangga (**AD/ART**).
2. **Alumni Sharing Session:** Berbagi pengalaman berorganisasi, perjalanan perkuliahan/perguruan tinggi, dan wawasan pasca-sekolah.
3. **Fun Games & Networking:** Permainan interaktif untuk mempererat silaturahmi lintas generasi.

### 1.2 Tujuan Sistem Digital

1. **Memudahkan Tugas Seksi Humas:** Menggantikan form pendaftaran statis dengan portal undangan digital bertema **VALORANT** yang informatif, menarik untuk dibagikan di grup WhatsApp lintas generasi, dan minim pertanyaan berulang.
2. **Otomatisasi E-Ticket Tanpa Bot Rawan Blokir:** Menghasilkan kartu **E-Ticket QR (PNG)** berdesain khusus secara instan setelah pendaftaran—ditampilkan langsung di browser untuk diunduh dan dikirimkan otomatis ke email (Gmail) peserta via **Resend**.
3. **Mempercepat Registrasi & Logistik Hari-H:** Menyediakan _Web QR Scanner_ berbasis kamera HP panitia yang mencatat kehadiran, pembagian konsumsi, dan pembagian suvenir dalam satu layar, lengkap dengan fitur pendaftaran _On-The-Spot_ (OTS) dan ekspor laporan CSV untuk LPJ.

---

## 2. AKTOR PENGGUNA & MATRIKS HAK AKSES

| Aktor                                              | Deskripsi                                                                                                                 | Hak Akses & Kapabilitas                                                                                                                                                                                               |
| :------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Peserta Publik** _(Gen 21 & Alumni Gen 18–14)_   | Pengunjung tanpa akun yang membuka tautan undangan dari grup WhatsApp.                                                    | Melihat detail acara & rundown, membaca _Wall of Messages_, mengisi formulir RSVP, melihat & mengunduh E-Ticket PNG (`/tiket/[code]`), serta meminta kirim ulang E-Ticket ke email.                                   |
| **Panitia Humas & Registrasi** _(Gen 20 & Gen 19)_ | Tim pelaksana internal yang masuk menggunakan **1 Akun Panitia Bersama** (mendukung login bersamaan di banyak perangkat). | Mengakses `/panitia/dashboard`, memindai QR Code peserta, mengubah status **Hadir / Konsumsi / Suvenir**, mendaftarkan tamu **On-The-Spot (OTS)**, memoderasi pesan publik, mengedit detail acara, dan mengunduh CSV. |

---

## 3. SPESIFIKASI FITUR HALAMAN PUBLIK (TRACK B)

### 3.1 Halaman Undangan Utama (`/`)

Halaman utama disusun sebagai satu alur vertikal (_single-page briefing_) bertema **Dark Tactical VALORANT**:

1. **Hero & Tactical Briefing Header:**
   - Menampilkan logo resmi **Saba Exploit** (merah–hitam–putih), judul acara **MUSYAWARAH BESAR SABA EXPLOIT**, sub-tema **PROTOCOL: VALORANT**, serta visual ilustrasi karakter **Agent VALORANT** (`/images/valorant-agent.png`).
   - Menampilkan ringkasan waktu & tempat secara tegas: **Senin, 28 Desember 2026 • 07.30 WIB – Selesai • Ruang Yudistira, SMA Negeri 1 Bantul**.
   - Dilengkapi indikator hitung mundur (_live countdown_ Hari, Jam, Menit) menuju waktu mulai acara dan tombol aksi utama (**"KONFIRMASI KEHADIRAN"**) yang menggulir halus ke bagian formulir RSVP.
2. **Briefing Susunan Acara (_Rundown_) & Info Lokasi:**
   - Menampilkan daftar sesi acara (data awal berupa _placeholder_ terstruktur yang dapat diubah kapan saja lewat Dashboard Panitia).
   - Menampilkan kartu informasi lokasi (**Ruang Yudistira, SMA Negeri 1 Bantul**) serta kartu **Narahubung Humas** dengan tombol langsung membuka chat WhatsApp (`https://wa.me/...`).
3. **Formulir Konfirmasi Kehadiran (RSVP):**
   - **Nama Lengkap** _(Wajib, teks 2–80 karakter)_.
   - **Generasi** _(Wajib, pilihan dropdown/grid tombol)_:
     - `Gen 21` — Anggota Aktif (Kelas 10)
     - `Gen 18` — Alumni
     - `Gen 17` — Alumni
     - `Gen 16` — Alumni
     - `Gen 15` — Alumni
     - `Gen 14` — Alumni
   - **Alamat Email (Gmail)** _(Wajib, format email valid — digunakan sebagai kunci unik anti-duplikasi dan tujuan pengiriman E-Ticket)_.
   - **Nomor WhatsApp** _(Wajib, format angka/telepon Indonesia 9–15 digit, otomatis dinormalisasi ke format `628...`)_.
   - **Pesan & Harapan untuk Mubes** _(Opsional, maksimal 300 karakter)_.
   - **Opsi Anonimitas Pesan** _(Checkbox, default tidak dicentang)_:
     - Jika **tidak dicentang**: Pesan tampil di _Wall of Messages_ dengan nama asli dan generasi (contoh: `Raka Pratama • Gen 17`).
     - Jika **dicentang**: Pesan tampil sebagai `Agent Rahasia • Gen 17` (identitas asli tetap tersimpan di database untuk keperluan administratif panitia).
4. **Wall of Messages (Papan Aspirasi & Nostalgia):**
   - Menampilkan kartu-kartu pesan dari peserta yang mengisi kolom pesan dan tidak disembunyikan oleh panitia (`isMessageHidden = false`), diurutkan dari yang terbaru.
   - Menyediakan filter cepat berdasarkan generasi (`Semua`, `Gen 21`, `Gen 18`, `Gen 17`, `Gen 16`, `Gen 15`, `Gen 14`).

### 3.2 Halaman E-Ticket Digital (`/tiket/[code]`) & Otomatisasi Email

Begitu formulir RSVP dikirim dan lolos validasi:

1. **Pembuatan Kode Tiket Otomatis:** Sistem menetapkan nomor urut 3 digit yang diformat menjadi `SE-MUBES-001`, `SE-MUBES-002`, dan seterusnya, beserta token QR Code unik.
2. **Pengiriman Email Otomatis (Resend):** Server mengirimkan email HTML bertema taktis gelap ke alamat email pendaftar yang memuat rincian jadwal, lokasi, kode tiket `SE-MUBES-XXX`, gambar kartu E-Ticket, dan tombol tautan langsung ke `/tiket/[code]`.
   - _Graceful Degradation:_ Jika layanan email Resend mengalami gangguan jaringan sementara atau API key belum diisi saat pengujian lokal, pendaftaran **tetap berhasil tersimpan** di database dan pengguna tetap diarahkan ke halaman `/tiket/[code]` tanpa error.
3. **Tampilan Kartu E-Ticket & Unduh PNG:**
   - Halaman `/tiket/[code]` menampilkan kartu E-Ticket vertikal berdesain **VALORANT Agent Pass** yang memuat: Logo Saba Exploit, ilustrasi Agent Valorant, Nama Lengkap, Badge Generasi, Kode Tiket (`SE-MUBES-001`), QR Code resolusi tinggi, serta Jadwal & Lokasi acara.
   - Tersedia tombol **"DOWNLOAD E-TICKET (PNG)"** yang mengunduh gambar kartu tiket utuh (`/api/ticket-image/[code]`) langsung ke galeri perangkat peserta.
   - Tersedia tombol **"KIRIM ULANG KE EMAIL"** dengan pembatasan jeda (_cooldown_) 60 detik per klik untuk mencegah penyalahgunaan kuota email.

---

## 4. SPESIFIKASI FITUR WORKSPACE PANITIA (TRACK A)

### 4.1 Autentikasi Panitia (`/panitia/login`)

- Menggunakan **1 akun panitia bersama** (`PANITIA_USERNAME` dan `PANITIA_PASSWORD` dari konfigurasi environment server).
- Mendukung **Multi-Device Concurrent Login**: Beberapa HP panitia di meja registrasi dan laptop operator dapat masuk menggunakan akun yang sama secara bersamaan tanpa saling mengeluarkan sesi perangkat lain.
- Sesi berlaku selama **7 hari** dalam `HTTP-only Secure Cookie`.

### 4.2 Dashboard & Operasional Hari-H (`/panitia/dashboard`)

Dashboard panitia dibagi menjadi 4 panel navigasi utama yang responsif di layar HP maupun laptop:

1. **Ringkasan Statistik Real-Time (KPI Bar di Bagian Atas):**
   - **Total Terdaftar** _(menampilkan pemisahan Online vs OTS)_.
   - **Sudah Hadir (_Checked-In_)** beserta persentase kehadiran.
   - **Konsumsi Terambil** _(jumlah porsi yang sudah dicentang)_.
   - **Suvenir Terambil** _(jumlah paket suvenir yang sudah dicentang)_.
   - **Distribusi per Generasi** (`Gen 21` hingga `Gen 14`).

2. **Panel 1 — Tactical QR Scanner & Check-In Terpadu (Default Tab):**
   - **Pemindai Kamera Browser:** Menggunakan kamera belakang HP panitia untuk membaca QR Code E-Ticket peserta secara instan.
   - **Pencarian Manual Cepat (Jalur Darurat):** Kotak input di atas/bawah kamera untuk mencari peserta berdasarkan **Nama** atau **3 digit nomor tiket** (misal mengetik `015` langsung memunculkan `SE-MUBES-015`).
   - **Alur Pemindaian Terpadu (1-Scan Multi-Action):**
     - Saat QR dipindai untuk pertama kali: Sistem otomatis mengubah `isCheckedIn = true` dan mencatat `checkedInAt = waktu sekarang`, lalu memunculkan **Kartu Kontrol Peserta** di layar dengan 3 tombol sentuh besar (`min-h-[44px]`):
       1. `[✓] HADIR` _(otomatis aktif hijau/aksen, dapat diklik ulang untuk membatalkan jika tidak sengaja ter-scan)_.
       2. `[ ] KONSUMSI` _(klik untuk menandai konsumsi sudah diserahkan; klik ulang untuk membatalkan)_.
       3. `[ ] SUVENIR` _(klik untuk menandai suvenir sudah diserahkan; klik ulang untuk membatalkan)_.
     - Saat QR yang **sudah berstatus Hadir** dipindai ulang (misalnya peserta kembali ke meja panitia untuk mengambil suvenir di sesi akhir): Sistem **tidak menampilkan error**, melainkan langsung membuka Kartu Kontrol Peserta tersebut dengan status terkininya sehingga panitia cukup menekan tombol **`SUVENIR`**.

3. **Panel 2 — Daftar Peserta, Input On-The-Spot (OTS) & Export CSV:**
   - Menampilkan daftar lengkap seluruh peserta dengan pencarian dan filter (`Semua`, `Hadir`, `Belum Hadir`, `OTS`, serta filter per Generasi).
   - **Tombol `+ Daftar On-The-Spot (OTS)`:** Membuka modal pendaftaran cepat di meja registrasi untuk tamu yang datang tanpa mendaftar online sebelumnya:
     - Input wajib hanya **Nama Lengkap** dan **Generasi** (`Gen 21`, `Gen 18..14`, serta opsi darurat `Gen 20`/`Gen 19`).
     - Input **Email** dan **Nomor WhatsApp** bersifat **opsional** saat OTS (jika Email diisi, sistem tetap mengirimkan E-Ticket ke email tersebut).
     - Peserta OTS otomatis ditandai `isOnTheSpot = true` dan langsung berstatus **Hadir (`isCheckedIn = true`)**, lalu membuka Kartu Kontrol Peserta agar panitia dapat langsung mencentang **Konsumsi** dan **Suvenir**.
   - **Tombol `Export CSV (LPJ)`:** Mengunduh rekap seluruh peserta beserta status kehadiran, jam kedatangan, status konsumsi, status suvenir, dan keterangan OTS dalam format CSV (`UTF-8 BOM`).

4. **Panel 3 — Moderasi Wall of Messages:**
   - Menampilkan seluruh pesan dan harapan yang masuk dari peserta.
   - Panitia dapat melihat identitas asli pengirim (termasuk nama pengirim yang memilih opsi anonim) dan menekan tombol **Sembunyikan** / **Tampilkan** untuk mengatur apakah pesan tersebut tampil di halaman publik.

5. **Panel 4 — Pengaturan Detail Acara:**
   - Memungkinkan panitia memperbarui **Tanggal & Jam Acara**, **Lokasi**, **Susunan Acara (_Rundown_)**, serta **Nama & Nomor WhatsApp Narahubung Humas** secara langsung melalui antarmuka web tanpa mengubah kode.

---

## 5. ATURAN PENANGANAN EDGE CASES & INTEGRITAS BISNIS

| Skenario / Edge Case                                  | Perilaku Sistem yang Diwajibkan                                                                                                                                                                                                                                                                                  |
| :---------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Alumni mendaftar ulang dengan Email yang sama**     | Sistem melakukan pencarian berdasarkan email (_case-insensitive_, `trim()`). Jika sudah ada, **tidak membuat tiket baru** dan tidak melempar error; sistem langsung mengarahkan peserta ke halaman `/tiket/[code]` miliknya disertai pesan informasi bahwa tiket sudah terdaftar dan siap diunduh/dikirim ulang. |
| **Dua pendaftar menekan Submit pada detik yang sama** | Penetapan nomor urut tiket (`ticketNumber`) dieksekusi di dalam transaksi database atomik (`$transaction`) dengan mekanisme _retry_ otomatis jika terjadi benturan kunci unik, menjamin tidak ada dua peserta mendapat kode `SE-MUBES-XXX` yang sama.                                                            |
| **Kamera HP tidak diizinkan / gelap saat hari-H**     | Panitia tetap dapat menjalankan proses _check-in_, konsumsi, dan suvenir 100% melalui kotak **Pencarian Cepat** (ketik nama atau 3 digit nomor tiket) tanpa bergantung pada kamera.                                                                                                                              |
| **Peserta OTS tidak memiliki/lupa alamat Email**      | Pada jalur OTS panitia, kolom email dikosongkan (`null`). Sistem tetap menghasilkan kode tiket `SE-MUBES-XXX`, mencatat kehadiran, dan melewati langkah pengiriman email Resend.                                                                                                                                 |
| **Salah pencet tombol Konsumsi/Suvenir saat scan**    | Seluruh tombol status (`Hadir`, `Konsumsi`, `Suvenir`) bersifat _reversible toggle_ (dapat diaktifkan maupun dinonaktifkan kembali oleh panitia dengan audit timestamp terbaru).                                                                                                                                 |
