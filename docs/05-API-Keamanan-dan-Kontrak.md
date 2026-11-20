# 05 — KONTRAK API, KEAMANAN ZERO-TRUST, WHATSAPP GATEWAY & SEO
**Proyek:** MUBES SABA EXPLOIT — *Protocol: VALORANT*
**Dokumen:** `docs/05-API-Keamanan-dan-Kontrak.md`
**Status:** Terkunci (Fase 2 SSOT)

---

## 1. VARIABEL LINGKUNGAN WAJIB (`.env`)

```env
# 1. Database Neon PostgreSQL
DATABASE_URL="postgresql://user:pass@ep-xxx-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://user:pass@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

# 2. Autentikasi Panitia (1 Akun Multi-Device)
PANITIA_USERNAME="panitia_se"
PANITIA_PASSWORD="ganti_dengan_password_kuat_panitia"
JWT_SECRET="minimal_32_karakter_acak_untuk_signing_cookie_jwt"

# 3. WhatsApp Gateway Adapter (Default: Fonnte Free Tier)
WHATSAPP_PROVIDER="fonnte"
FONNTE_API_URL="[https://api.fonnte.com/send](https://api.fonnte.com/send)"
FONNTE_TOKEN="isi_token_api_dari_dashboard_fonnte"
FONNTE_SEND_IMAGE="false" # Set "false" untuk Fonnte Gratis (text-only); ubah ke "true" jika upgrade berbayar

# 4. URL Publik Aplikasi (untuk tautan E-Ticket & OpenGraph WA)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 2. KONTRAK RESPON STANDAR & VALIDASI ZOD (`src/lib/validations.ts`)

```typescript
import { z } from "zod";

export const DIVISIONS = [
  "Programming",
  "Design",
  "Photography",
  "Cinematography",
  "Technopreneurship",
] as const;

export const PUBLIC_GENERATIONS = [
  "Gen 21",
  "Gen 18",
  "Gen 17",
  "Gen 16",
  "Gen 15",
  "Gen 14",
] as const;

export const ALL_GENERATIONS = [
  "Gen 21",
  "Gen 20",
  "Gen 19",
  "Gen 18",
  "Gen 17",
  "Gen 16",
  "Gen 15",
  "Gen 14",
] as const;

export type ActionResponse<T null> =
  | { success: true; message: string; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export function normalizeWhatsapp(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("8")) return `62${digits}`;
  return digits;
}

// 1. Validasi Pendaftaran Publik (RSVP)
export const publicRegistrationSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Nama lengkap minimal 2 karakter")
    .max(80, "Nama lengkap maksimal 80 karakter"),
  whatsapp: z
    .string()
    .trim()
    .min(9, "Nomor WhatsApp minimal 9 digit")
    .max(16, "Nomor WhatsApp maksimal 16 digit")
    .transform(normalizeWhatsapp)
    .refine((val) => /^628[1-9][0-9]{6,12}$/.test(val), {
      message: "Masukkan nomor WhatsApp Indonesia yang valid (contoh: 08123456789)",
    }),
  division: z.enum(DIVISIONS, {
    errorMap: () => ({ message: "Pilih divisi yang valid" }),
  }),
  generation: z.enum(PUBLIC_GENERATIONS, {
    errorMap: () => ({ message: "Pilih generasi yang valid" }),
  }),
  message: z
    .string()
    .trim()
    .max(300, "Pesan & harapan maksimal 300 karakter")
    .optional()
    .default(""),
  isAnonymous: z.boolean().default(false),
});

// 2. Validasi Login Panitia
export const panitiaLoginSchema = z.object({
  username: z.string().trim().min(1, "Username wajib diisi"),
  password: z.string().min(1, "Password wajib diisi"),
});

// 3. Validasi Input On-The-Spot (OTS) oleh Panitia
export const otsRegistrationSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Nama lengkap minimal 2 karakter")
    .max(80, "Nama lengkap maksimal 80 karakter"),
  division: z.enum(DIVISIONS, {
    errorMap: () => ({ message: "Pilih divisi yang valid" }),
  }),
  generation: z.enum(ALL_GENERATIONS, {
    errorMap: () => ({ message: "Pilih generasi yang valid" }),
  }),
  whatsapp: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .transform((val) => (val ? normalizeWhatsapp(val) : "")),
});

// 4. Validasi Update Status Check-In / Konsumsi / Suvenir
export const toggleStatusSchema = z.object({
  participantId: z.string().cuid("ID peserta tidak valid"),
  field: z.enum(["isCheckedIn", "hasConsumed", "hasSouvenir"]),
  value: z.boolean(),
});

// 5. Validasi Pengaturan Detail Acara oleh Panitia
export const rundownItemSchema = z.object({
  time: z.string().trim().min(1, "Waktu sesi wajib diisi").max(40),
  title: z.string().trim().min(1, "Judul sesi wajib diisi").max(100),
  description: z.string().trim().max(250).default(""),
});

export const eventSettingsSchema = z.object({
  eventTitle: z.string().trim().min(3).max(120),
  eventSubtitle: z.string().trim().min(3).max(180),
  eventDateIso: z.string().trim().min(10),
  eventDateDisplay: z.string().trim().min(3).max(80),
  eventTimeDisplay: z.string().trim().min(3).max(60),
  eventLocation: z.string().trim().min(3).max(150),
  contactName: z.string().trim().min(2).max(80),
  contactWhatsapp: z.string().trim().min(9).max(16).transform(normalizeWhatsapp),
  isRegistrationOpen: z.boolean(),
  rundown: z.array(rundownItemSchema).min(1, "Minimal harus ada 1 susunan acara"),
});
```

---

## 3. AUTENTIKASI PANITIA MULTI-DEVICE (`src/lib/auth.ts`)

- Menggunakan `jose` (`SignJWT` & `jwtVerify`) dengan cookie `se_mubes_panitia_session` (`httpOnly: true`, `sameSite: "lax"`, masa berlaku 7 hari).
- Setiap aksi di `src/actions/panitia.actions.ts` dan `/api/export` wajib memanggil `await requirePanitiaSession()`.

---

## 4. SPESIFIKASI SERVER ACTIONS & ROUTE HANDLERS

1. **`registerParticipantAction(rawInput)` (`src/actions/registration.actions.ts`):**
   - Validasi dengan `publicRegistrationSchema`.
   - Cek apakah nomor `whatsapp` sudah terdaftar (`findUnique`). Jika **sudah ada**, kembalikan `{ success: true, data: { ticketCode, isExisting: true } }` tanpa membuat duplikat.
   - Jika **belum ada**, jalankan `$transaction` atomik untuk membuat kode tiket `SE-MUBES-XXX`.
   - Panggil `sendTicketWhatsapp(participant, settings)` secara *non-blocking / graceful fallback* (jika token WA Gateway belum diisi atau gagal jaringan, pendaftaran tetap sukses dan pengguna langsung dialihkan ke `/tiket/[code]`).
2. **`resendTicketWhatsappAction(ticketCode)` (`src/actions/registration.actions.ts`):**
   - Mengirim ulang gambar E-Ticket PNG + pesan WhatsApp dengan *cooldown* minimal **60 detik** (`lastWhatsappSentAt`).
3. **`panitia.actions.ts` (`scanQrCheckInAction`, `toggleParticipantStatusAction`, `createOnTheSpotAction`, `toggleMessageVisibilityAction`, `updateEventSettingsAction`):**
   - Terproteksi sesi JWT panitia. Pada `createOnTheSpotAction`, jika nomor `whatsapp` diisi oleh panitia dan valid, sistem juga otomatis mengirimkan E-Ticket ke WhatsApp tamu tersebut.
4. **`GET /api/ticket-image/[code]`:**
   - Merender kartu E-Ticket PNG (`900 × 1500 px`) menggunakan `ImageResponse` (`next/og`) yang menampilkan Nama, **Divisi**, Generasi, Kode Tiket `SE-MUBES-XXX`, dan QR Code kontras tinggi.
5. **`GET /api/export`:**
   - Terproteksi sesi panitia. Mengunduh CSV (`UTF-8 BOM`) dengan kolom:
     `No,Kode Tiket,Nama Lengkap,Divisi,Generasi,WhatsApp,Jalur Daftar,Status Hadir,Waktu Check-In,Konsumsi,Suvenir,Pesan`.

---

## 5. INTEGRASI WHATSAPP GATEWAY ADAPTER (`src/lib/whatsapp.ts`)

- **Arsitektur Pluggable Adapter:** `src/lib/whatsapp.ts` membaca `process.env.WHATSAPP_PROVIDER` (default `"fonnte"`) sehingga pergantian penyedia layanan WhatsApp di masa depan cukup dilakukan lewat `.env`.
- **Implementasi Fonnte (`POST https://api.fonnte.com/send`):**
  - Header: `Authorization: process.env.FONNTE_TOKEN` dan `Content-Type: application/json`.
  - Payload JSON:
    ```json
    {
      "target": "6281234567890",
      "message": "...",
      "countryCode": "62"
    }
    ```
  - Jika `process.env.FONNTE_SEND_IMAGE === "true"`, sertakan properti `"url": "${appUrl}/api/ticket-image/${participant.ticketCode}"` di dalam payload. Pada mode default `"false"` (Fonnte Gratis), properti `url` tidak dikirim agar tidak ditolak oleh API.
- **Graceful Fallback:** Jika `FONNTE_TOKEN` masih kosong atau bernilai placeholder saat pengujian lokal, fungsi mencatat log di terminal server dan tetap mengembalikan status sukses agar proses pendaftaran tidak terhambat.
- **Format Pesan WhatsApp Otomatis:**
  ```text
  *E-TICKET MUBES SABA EXPLOIT 2026*
  _PROTOCOL: VALORANT_

  Halo *${participant.fullName}*!
  Konfirmasi kehadiranmu telah tercatat.

  • *Kode Tiket:* ${participant.ticketCode}
  • *Divisi / Gen:* ${participant.division} •${participant.generation}
  • *Tanggal:* ${settings.eventDateDisplay}
  • *Waktu:* ${settings.eventTimeDisplay}
  • *Lokasi:* ${settings.eventLocation}

  Buka & unduh E-Ticket QR kamu melalui tautan berikut untuk ditunjukkan saat registrasi di lokasi:
  ${appUrl}/tiket/${participant.ticketCode}

  Sampai jumpa di Ruang Yudistira!
  — Panitia Mubes Saba ExploIT
  ```
  
## 6. KONFIGURASI SEO & PREVIEW WHATSAPP (OPENGRAPH)

```typescript
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: "Mubes Saba ExploIT 2026 — Protocol: VALORANT",
  description:
    "Undangan Resmi Musyawarah Besar Saba ExploIT SMA Negeri 1 Bantul • Senin, 28 Desember 2026 di Ruang Yudistira. Konfirmasi kehadiranmu & dapatkan E-Ticket QR via WhatsApp!",
  openGraph: {
    title: "MUBES SABA EXPLOIT 2026 // PROTOCOL: VALORANT",
    description:
      "Senin, 28 Desember 2026 • 07.30 WIB – Selesai • Ruang Yudistira, SMAN 1 Bantul. Klik untuk konfirmasi kehadiran & ambil E-Ticket!",
    type: "website",
    locale: "id_ID",
    siteName: "Saba ExploIT SMAN 1 Bantul",
  },
};
```