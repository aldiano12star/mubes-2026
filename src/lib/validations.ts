import { z } from "zod";
import {
  DIVISIONS,
  PUBLIC_GENERATIONS,
  ALL_GENERATIONS,
} from "@/lib/constants";

/**
 * Kontrak Standar Respons Server Actions & API Handlers
 */
export type ActionResponse<T = null> =
  | {
      success: true;
      message: string;
      data: T;
    }
  | {
      success: false;
      error: string;
      fieldErrors?: Record<string, string[]>;
    };

/**
 * Normalisasi nomor WhatsApp ke format internasional standar Indonesia (628xxxxxxxxxx)
 * Membersihkan spasi, tanda hubung (+, -), dan mengonversi awalan 0 atau 8 menjadi 628.
 */
export function normalizeWhatsapp(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("8")) return `62${digits}`;
  return digits;
}

// 1. Skema Validasi Pendaftaran Publik (RSVP)
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
    message: "Pilih divisi yang valid",
  }),
  generation: z.enum(PUBLIC_GENERATIONS, {
    message: "Pilih generasi yang valid",
  }),
  message: z
    .string()
    .trim()
    .max(300, "Pesan & harapan maksimal 300 karakter")
    .optional()
    .default(""),
  isAnonymous: z.boolean().default(false),
});

export type PublicRegistrationInput = z.infer<typeof publicRegistrationSchema>;

// 2. Skema Validasi Login Panitia
export const panitiaLoginSchema = z.object({
  username: z.string().trim().min(1, "Username wajib diisi"),
  password: z.string().min(1, "Password wajib diisi"),
});

export type PanitiaLoginInput = z.infer<typeof panitiaLoginSchema>;

// 3. Skema Validasi Pendaftaran On-The-Spot (OTS) oleh Panitia
export const otsRegistrationSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Nama lengkap minimal 2 karakter")
    .max(80, "Nama lengkap maksimal 80 karakter"),
  division: z.enum(DIVISIONS, {
    message: "Pilih divisi yang valid",
  }),
  generation: z.enum(ALL_GENERATIONS, {
    message: "Pilih generasi yang valid",
  }),
  whatsapp: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .transform((val) => (val ? normalizeWhatsapp(val) : ""))
    .refine((val) => !val || /^628[1-9][0-9]{6,12}$/.test(val), {
      message: "Masukkan nomor WhatsApp Indonesia yang valid (contoh: 08123456789)",
    }),
});

export type OtsRegistrationInput = z.infer<typeof otsRegistrationSchema>;

// 4. Skema Validasi Update Status Check-In / Konsumsi / Suvenir
export const toggleStatusSchema = z.object({
  participantId: z.string().cuid("ID peserta tidak valid"),
  field: z.enum(["isCheckedIn", "hasConsumed", "hasSouvenir"], {
    message: "Bidang status tidak valid",
  }),
  value: z.boolean(),
});

export type ToggleStatusInput = z.infer<typeof toggleStatusSchema>;

// 5. Skema Validasi Pengaturan Detail Acara & Rundown oleh Panitia
export const rundownItemSchema = z.object({
  time: z.string().trim().min(1, "Waktu sesi wajib diisi").max(40),
  title: z.string().trim().min(1, "Judul sesi wajib diisi").max(100),
  description: z.string().trim().max(250).default(""),
});

export type RundownItem = z.infer<typeof rundownItemSchema>;

export const eventSettingsSchema = z.object({
  eventTitle: z.string().trim().min(3, "Judul acara minimal 3 karakter").max(120),
  eventSubtitle: z.string().trim().min(3, "Subjudul acara minimal 3 karakter").max(180),
  eventDateIso: z.string().trim().min(10, "Format tanggal ISO minimal 10 karakter"),
  eventDateDisplay: z.string().trim().min(3).max(80),
  eventTimeDisplay: z.string().trim().min(3).max(60),
  eventLocation: z.string().trim().min(3).max(150),
  entryFeeLabel: z.string().trim().min(2, "Label HTM minimal 2 karakter").max(80).default("RADIANT PASS"),
  entryFeeAmount: z.string().trim().min(2, "Nominal HTM minimal 2 karakter").max(50).default("Rp 20.000"),
  entryFeeNote: z.string().trim().max(200).default("HTM Peserta • Termasuk Konsumsi & Merchandise"),
  contactName: z.string().trim().min(2).max(80),
  contactWhatsapp: z.string().trim().min(9).max(16).transform(normalizeWhatsapp),
  isRegistrationOpen: z.boolean(),
  rundown: z.array(rundownItemSchema).min(1, "Minimal harus ada 1 susunan acara"),
});

export type EventSettingsInput = z.infer<typeof eventSettingsSchema>;
