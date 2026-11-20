/**
 * Single Source of Truth untuk Konstanta Domain MUBES SABA EXPLOIT 2026
 * Protocol: VALORANT — SABA EXPLOIT (@sabaexploit) SMA Negeri 1 Bantul
 */

export const DIVISIONS = [
  "Programming",
  "Design",
  "Photography",
  "Cinematography",
  "Technopreneurship",
] as const;

export type Division = (typeof DIVISIONS)[number];

export const PUBLIC_GENERATIONS = [
  "Gen 21",
  "Gen 18",
  "Gen 17",
  "Gen 16",
  "Gen 15",
  "Gen 14",
  "Gen 13",
  "Gen 12",
  "Gen 11",
  "Gen 10",
  "Gen 9",
  "Gen 8",
  "Gen 7",
  "Gen 6",
  "Gen 5",
  "Gen 4",
  "Gen 3",
  "Gen 2",
  "Gen 1",
] as const;

export type PublicGeneration = (typeof PUBLIC_GENERATIONS)[number];

export const ALL_GENERATIONS = [
  "Gen 21",
  "Gen 20",
  "Gen 19",
  "Gen 18",
  "Gen 17",
  "Gen 16",
  "Gen 15",
  "Gen 14",
  "Gen 13",
  "Gen 12",
  "Gen 11",
  "Gen 10",
  "Gen 9",
  "Gen 8",
  "Gen 7",
  "Gen 6",
  "Gen 5",
  "Gen 4",
  "Gen 3",
  "Gen 2",
  "Gen 1",
] as const;

export type Generation = (typeof ALL_GENERATIONS)[number];

export const GENERATION_LABELS: Record<Generation, string> = {
  "Gen 21": "Gen 21 (Kelas 10 — Anggota Aktif)",
  "Gen 20": "Gen 20 (Kelas 11 — Panitia)",
  "Gen 19": "Gen 19 (Kelas 12 — Panitia)",
  "Gen 18": "Gen 18 (Alumni)",
  "Gen 17": "Gen 17 (Alumni)",
  "Gen 16": "Gen 16 (Alumni)",
  "Gen 15": "Gen 15 (Alumni)",
  "Gen 14": "Gen 14 (Alumni)",
  "Gen 13": "Gen 13 (Alumni)",
  "Gen 12": "Gen 12 (Alumni)",
  "Gen 11": "Gen 11 (Alumni)",
  "Gen 10": "Gen 10 (Alumni)",
  "Gen 9": "Gen 9 (Alumni)",
  "Gen 8": "Gen 8 (Alumni)",
  "Gen 7": "Gen 7 (Alumni)",
  "Gen 6": "Gen 6 (Alumni)",
  "Gen 5": "Gen 5 (Alumni)",
  "Gen 4": "Gen 4 (Alumni)",
  "Gen 3": "Gen 3 (Alumni)",
  "Gen 2": "Gen 2 (Alumni)",
  "Gen 1": "Gen 1 (Alumni)",
};

export const TICKET_PREFIX = "SE-MUBES";

/**
 * Format nomor urut tiket menjadi format resmi SE-MUBES-XXX (contoh: SE-MUBES-001)
 */
export function formatTicketCode(sequence: number): string {
  return `${TICKET_PREFIX}-${String(sequence).padStart(3, "0")}`;
}

export const EVENT_DEFAULTS = {
  eventTitle: "MUBES SABA EXPLOIT",
  eventSubtitle: "ONE VISION, TIMELESS MEMORIES",
  eventDateIso: "2026-12-29T09:00:00+07:00",
  eventDateDisplay: "Selasa, 29 Desember 2026",
  eventTimeDisplay: "09.00 WIB – Selesai",
  eventLocation: "SMA Negeri 1 Bantul (Ruang Yudistira)",
  venueAddress: "Jl. KHA Wakhid Hasyim 99, Bantul",
  entryFeeLabel: "RADIANT PASS",
  entryFeeAmount: "Rp 20.000",
  entryFeeNote: "HTM Peserta • Termasuk Konsumsi & Merchandise",
  contactName: "Humas Saba ExploIT",
  contactWhatsapp: "6281234567890",
} as const;
