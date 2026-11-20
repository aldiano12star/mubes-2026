# 03 — SKEMA DATABASE NEON POSTGRESQL & HUKUM TRANSAKSI ACID
**Proyek:** MUBES SABA EXPLOIT — *Protocol: VALORANT*
**Dokumen:** `docs/03-Skema-Data-dan-ACID.md`
**Status:** Terkunci (Fase 2 SSOT)

---

## 1. KONFIGURASI DATABASE NEON POSTGRESQL

```env
# Pooled connection (PgBouncer) — digunakan saat runtime aplikasi di Vercel
DATABASE_URL="postgresql://[user]:[password]@[endpoint]-pooler.[region].aws.neon.tech/neondb?sslmode=require"

# Direct connection — digunakan oleh Prisma CLI saat menjalankan db push / migrate
DIRECT_URL="postgresql://[user]:[password]@[endpoint].[region].aws.neon.tech/neondb?sslmode=require"
```

---

## 2. CETAK BIRU UTUH `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

/// Model utama untuk menyimpan seluruh pendaftar online maupun tamu On-The-Spot (OTS)
model Participant {
  id                 String    @id @default(cuid())
  ticketSequence     Int       @unique
  ticketCode         String    @unique // Format wajib: "SE-MUBES-001", "SE-MUBES-002", dst.
  fullName           String
  division           String    // "Programming", "Design", "Photography", "Cinematography", "Technopreneurship"
  generation         String    // "Gen 21", "Gen 18", "Gen 17", "Gen 16", "Gen 15", "Gen 14" (atau "Gen 20"/"Gen 19" untuk OTS)
  whatsapp           String?   @unique // Wajib untuk pendaftaran online (format 628...); opsional (null) untuk OTS
  message            String?   // Pesan & harapan untuk Mubes (maks 300 karakter)
  isAnonymous        Boolean   @default(false) // true = tampil sebagai "Agent Rahasia" di Wall of Messages
  isMessageHidden    Boolean   @default(false) // true = disembunyikan panitia dari Wall of Messages publik
  isOnTheSpot        Boolean   @default(false) // true = didaftarkan panitia langsung di meja registrasi hari-H

  // Status Operasional Meja Registrasi Hari-H (1-Scan Multi-Action)
  isCheckedIn        Boolean   @default(false)
  checkedInAt        DateTime?
  hasConsumed        Boolean   @default(false) // Status pengambilan konsumsi
  consumedAt         DateTime?
  hasSouvenir        Boolean   @default(false) // Status pengambilan suvenir
  souvenirAt         DateTime?

  // Audit Pengiriman E-Ticket via WhatsApp Gateway
  lastWhatsappSentAt DateTime?

  createdAt          DateTime  @default(now())
  updatedAt          DateTime  @updatedAt

  @@index([generation])
  @@index([division])
  @@index([isCheckedIn])
  @@index([createdAt])
}

/// Model konfigurasi tunggal (Singleton) untuk detail acara yang bisa diedit panitia lewat dashboard
model EventSettings {
  id                 String   @id @default("default")
  eventTitle         String   @default("MUSYAWARAH BESAR SABA EXPLOIT")
  eventSubtitle      String   @default("PROTOCOL: VALORANT — REUNION & BRIEFING LINTAS GENERASI")
  eventDateIso       String   @default("2026-12-28T07:30:00+07:00")
  eventDateDisplay   String   @default("Senin, 28 Desember 2026")
  eventTimeDisplay   String   @default("07.30 WIB – Selesai")
  eventLocation      String   @default("Ruang Yudistira, SMA Negeri 1 Bantul")
  rundownJson        Json     // Array objek: [{ "time": "07.30 - 08.00", "title": "...", "description": "..." }]
  contactName        String   @default("Humas Saba ExploIT")
  contactWhatsapp    String   @default("6281234567890")
  isRegistrationOpen Boolean  @default(true)
  updatedAt          DateTime @updatedAt
}
```

### 2.1 Catatan Teknis Keunikan `NULL` pada PostgreSQL
- Kolom `whatsapp String? @unique` menjamin satu nomor WhatsApp hanya dapat memiliki satu tiket pada pendaftaran online, sementara beberapa peserta *On-The-Spot* (OTS) yang tidak menyertakan nomor WhatsApp tetap dapat disimpan dengan nilai `whatsapp: null` tanpa benturan *unique constraint*.

---

## 3. HUKUM TRANSAKSI ACID & ANTI-RACE CONDITION

1. **Format Kode Tiket:** `SE-MUBES-${String(sequence).padStart(3, "0")}` (contoh: `SE-MUBES-001`).
2. **Transaksi Atomik (`prisma.$transaction`):** Penetapan `ticketSequence` baru wajib berjalan di dalam `$transaction` dengan mekanisme pengulangan otomatis (*retry* hingga 5 kali) apabila terjadi benturan kunci unik (`P2002`).
3. **Normalisasi & Anti-Duplikasi WhatsApp:**
   - Nomor WhatsApp dinormalisasi menjadi `628xxxxxxxxxx`.
   - Sebelum membuat baris baru, server mencari `prisma.participant.findUnique({ where: { whatsapp: normalizedWhatsapp } })`. Jika ditemukan, sistem mengembalikan tiket lama (`isExisting: true`).
4. **Atomisitas Status Hari-H:** Pembaruan `isCheckedIn`, `hasConsumed`, dan `hasSouvenir` wajib selalu menyinkronkan kolom timestamp-nya (`checkedInAt`, `consumedAt`, `souvenirAt`) dalam satu operasi `update`.

---

## 4. SEED DATA AWAL (`prisma/seed.ts`)

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const defaultRundown = [
    {
      time: "07.30 – 08.15 WIB",
      title: "Registrasi & Tactical Check-In",
      description: "Pemindaian E-Ticket QR di pintu masuk Ruang Yudistira serta pembagian konsumsi awal.",
    },
    {
      time: "08.15 – 09.30 WIB",
      title: "Pembukaan & Sidang Pleno AD/ART",
      description: "Sambutan ketua panitia dan pembahasan singkat Anggaran Dasar / Anggaran Rumah Tangga Saba ExploIT.",
    },
    {
      time: "09.30 – 11.00 WIB",
      title: "Alumni Sharing Session (Gen 14 – Gen 18)",
      description: "Obrolan santai pengalaman berorganisasi, kehidupan perkuliahan, dan tips menghadapi jenjang pasca-SMA.",
    },
    {
      time: "11.00 – Selesai",
      title: "Fun Games, Ramah Tamah & Pembagian Suvenir",
      description: "Sesi permainan interaktif lintas generasi, foto bersama, dan pengambilan suvenir kenang-kenangan.",
    },
  ];

  await prisma.eventSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      eventTitle: "MUSYAWARAH BESAR SABA EXPLOIT",
      eventSubtitle: "PROTOCOL: VALORANT — BRIEFING & SILATURAHMI LINTAS GENERASI",
      eventDateIso: "2026-12-28T07:30:00+07:00",
      eventDateDisplay: "Senin, 28 Desember 2026",
      eventTimeDisplay: "07.30 WIB – Selesai",
      eventLocation: "Ruang Yudistira, SMA Negeri 1 Bantul",
      rundownJson: defaultRundown,
      contactName: "Koordinator Humas Saba ExploIT (Placeholder)",
      contactWhatsapp: "6281234567890",
      isRegistrationOpen: true,
    },
  });

  console.log("Seed EventSettings Mubes Saba ExploIT berhasil dijalankan.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```