"use server";

import { revalidatePath } from "next/cache";
import { Prisma, type Participant, type EventSettings } from "@prisma/client";
import { requirePanitiaSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatTicketCode, EVENT_DEFAULTS } from "@/lib/constants";
import { sendTicketWhatsapp } from "@/lib/whatsapp";
import {
  type ActionResponse,
  otsRegistrationSchema,
  toggleStatusSchema,
  eventSettingsSchema,
} from "@/lib/validations";

/**
 * Helper aman untuk memanggil revalidatePath tanpa melempar pengecualian saat di luar request scope Next.js
 */
function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Abaikan saat pengujian/CLI
  }
}

/**
 * 1. Server Action: Check-In Peserta via QR Code / Kode Manual
 * - Terproteksi sesi panitia
 * - Normalisasi kode (angka saja -> SE-MUBES-XXX)
 * - Idempoten: Jika sudah hadir, tidak melempar error dan tetap mengembalikan data peserta
 */
export async function scanQrCheckInAction(
  rawScannedCode: string
): Promise<ActionResponse<Participant>> {
  try {
    await requirePanitiaSession();
  } catch {
    return {
      success: false,
      error: "Sesi panitia berakhir. Silakan login kembali.",
    };
  }

  let normalized = rawScannedCode?.trim().toUpperCase() ?? "";

  // Jika operator hanya mengetik angka (misal "15" atau "015"), ubah menjadi format SE-MUBES-015
  if (/^\d+$/.test(normalized)) {
    normalized = formatTicketCode(parseInt(normalized, 10));
  }

  if (!normalized) {
    return {
      success: false,
      error: "Kode tiket tidak boleh kosong.",
    };
  }

  try {
    const participant = await prisma.participant.findUnique({
      where: { ticketCode: normalized },
    });

    if (!participant) {
      return {
        success: false,
        error: `Kode tiket "${normalized}" tidak ditemukan dalam sistem.`,
      };
    }

    // Jika belum hadir, update status menjadi hadir secara atomik
    if (!participant.isCheckedIn) {
      const updated = await prisma.participant.update({
        where: { id: participant.id },
        data: {
          isCheckedIn: true,
          checkedInAt: new Date(),
        },
      });

      safeRevalidate("/panitia/dashboard");
      safeRevalidate(`/tiket/${updated.ticketCode}`);

      return {
        success: true,
        message: `Check-in berhasil: ${updated.fullName} (${updated.ticketCode})`,
        data: updated,
      };
    }

    // Jika sudah hadir, jangan lempar error, kembalikan peserta agar panitia bisa toggle konsumsi/suvenir
    safeRevalidate("/panitia/dashboard");
    return {
      success: true,
      message: "Peserta sudah tercatat hadir. Siap mengatur konsumsi/suvenir.",
      data: participant,
    };
  } catch (error) {
    console.error("[Scan Check-In Error]:", error);
    return {
      success: false,
      error: "Terjadi kesalahan saat memproses check-in. Silakan coba lagi.",
    };
  }
}

/**
 * 2. Server Action: Toggle Status Kehadiran, Konsumsi, atau Suvenir
 * - Terproteksi sesi panitia
 * - Sinkronisasi atomik antara boolean dan timestamp terkait
 */
export async function toggleParticipantStatusAction(
  rawInput: unknown
): Promise<ActionResponse<Participant>> {
  try {
    await requirePanitiaSession();
  } catch {
    return {
      success: false,
      error: "Sesi panitia berakhir. Silakan login kembali.",
    };
  }

  const parsed = toggleStatusSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: "Data status tidak valid.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { participantId, field, value } = parsed.data;

  try {
    const updateData: Prisma.ParticipantUpdateInput = {};

    if (field === "isCheckedIn") {
      updateData.isCheckedIn = value;
      updateData.checkedInAt = value ? new Date() : null;
    } else if (field === "hasConsumed") {
      updateData.hasConsumed = value;
      updateData.consumedAt = value ? new Date() : null;
    } else if (field === "hasSouvenir") {
      updateData.hasSouvenir = value;
      updateData.souvenirAt = value ? new Date() : null;
    }

    const updated = await prisma.participant.update({
      where: { id: participantId },
      data: updateData,
    });

    safeRevalidate("/panitia/dashboard");
    if (field === "isCheckedIn") {
      safeRevalidate(`/tiket/${updated.ticketCode}`);
    }

    return {
      success: true,
      message: "Status peserta berhasil diperbarui.",
      data: updated,
    };
  } catch (error) {
    console.error("[Toggle Status Error]:", error);
    return {
      success: false,
      error: "Gagal memperbarui status peserta. Silakan coba lagi.",
    };
  }
}

/**
 * 3. Server Action: Registrasi On-The-Spot (OTS) di Meja Registrasi Hari-H
 * - Terproteksi sesi panitia
 * - Otomatis ditandai isOnTheSpot: true dan isCheckedIn: true
 * - Transaksi atomik penomoran tiket dengan retry loop P2002
 * - Pengiriman WhatsApp non-blocking jika nomor WhatsApp diisi
 */
export async function createOnTheSpotAction(
  rawInput: unknown
): Promise<ActionResponse<Participant>> {
  try {
    await requirePanitiaSession();
  } catch {
    return {
      success: false,
      error: "Sesi panitia berakhir. Silakan login kembali.",
    };
  }

  const parsed = otsRegistrationSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: "Periksa isian formulir OTS.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  try {
    // Jika nomor WhatsApp diisi, periksa apakah sudah pernah terdaftar sebelumnya
    if (data.whatsapp) {
      const existing = await prisma.participant.findUnique({
        where: { whatsapp: data.whatsapp },
      });

      if (existing) {
        return {
          success: false,
          error: `Nomor WhatsApp sudah terdaftar atas nama ${existing.fullName} (${existing.ticketCode}).`,
        };
      }
    }

    // Transaksi Atomik dengan Retry Loop (maksimal 5 kali percobaan)
    let attempts = 0;
    const maxAttempts = 5;
    let created: Participant | null = null;

    while (attempts < maxAttempts) {
      attempts++;
      try {
        created = await prisma.$transaction(async (tx) => {
          const last = await tx.participant.findFirst({
            orderBy: { ticketSequence: "desc" },
            select: { ticketSequence: true },
          });

          const nextSeq = (last?.ticketSequence ?? 0) + 1;
          const ticketCode = formatTicketCode(nextSeq);

          return await tx.participant.create({
            data: {
              ticketSequence: nextSeq,
              ticketCode,
              fullName: data.fullName,
              division: data.division,
              generation: data.generation,
              whatsapp: data.whatsapp || null,
              isOnTheSpot: true,
              isCheckedIn: true,
              checkedInAt: new Date(),
            },
          });
        });
        break; // Berhasil
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          if (attempts < maxAttempts) {
            await new Promise((r) => setTimeout(r, 50 * attempts));
            continue;
          }
        }
        throw error;
      }
    }

    if (!created) {
      return {
        success: false,
        error: "Sistem sedang sibuk. Silakan coba sesaat lagi.",
      };
    }

    // Pengiriman E-Ticket ke WhatsApp secara non-blocking jika nomor WhatsApp ada
    if (created.whatsapp) {
      try {
        const settings = await prisma.eventSettings.findUnique({
          where: { id: "default" },
        });

        const settingsData = {
          eventDateDisplay:
            settings?.eventDateDisplay ?? EVENT_DEFAULTS.eventDateDisplay,
          eventTimeDisplay:
            settings?.eventTimeDisplay ?? EVENT_DEFAULTS.eventTimeDisplay,
          eventLocation:
            settings?.eventLocation ?? EVENT_DEFAULTS.eventLocation,
        };

        const waRes = await sendTicketWhatsapp(
          {
            fullName: created.fullName,
            ticketCode: created.ticketCode,
            division: created.division,
            generation: created.generation,
            whatsapp: created.whatsapp,
          },
          settingsData
        );

        if (waRes.sent) {
          await prisma.participant.update({
            where: { id: created.id },
            data: { lastWhatsappSentAt: new Date() },
          });
        }
      } catch (waError) {
        console.warn("[OTS WA Error] Pengiriman WA OTS gagal:", waError);
      }
    }

    safeRevalidate("/");
    safeRevalidate("/panitia/dashboard");

    return {
      success: true,
      message: `Peserta OTS ${created.fullName} (${created.ticketCode}) berhasil ditambahkan dan ditandai hadir!`,
      data: created,
    };
  } catch (error) {
    console.error("[OTS Registration Error]:", error);
    return {
      success: false,
      error: "Terjadi kesalahan saat mendaftarkan peserta OTS.",
    };
  }
}

/**
 * 4. Server Action: Moderasi Visibilitas Pesan di Wall of Messages
 * - Terproteksi sesi panitia
 * - Mengubah isMessageHidden antara true/false
 */
export async function toggleMessageVisibilityAction(
  participantId: string
): Promise<ActionResponse<Participant>> {
  try {
    await requirePanitiaSession();
  } catch {
    return {
      success: false,
      error: "Sesi panitia berakhir. Silakan login kembali.",
    };
  }

  if (!participantId?.trim()) {
    return {
      success: false,
      error: "ID peserta tidak valid.",
    };
  }

  try {
    const existing = await prisma.participant.findUnique({
      where: { id: participantId },
    });

    if (!existing) {
      return {
        success: false,
        error: "Data peserta tidak ditemukan.",
      };
    }

    const updated = await prisma.participant.update({
      where: { id: participantId },
      data: {
        isMessageHidden: !existing.isMessageHidden,
      },
    });

    safeRevalidate("/");
    safeRevalidate("/panitia/dashboard");

    const statusText = updated.isMessageHidden
      ? "disembunyikan dari"
      : "ditampilkan pada";

    return {
      success: true,
      message: `Pesan dari ${updated.fullName} berhasil ${statusText} Wall of Messages publik.`,
      data: updated,
    };
  } catch (error) {
    console.error("[Toggle Message Visibility Error]:", error);
    return {
      success: false,
      error: "Gagal memperbarui visibilitas pesan.",
    };
  }
}

/**
 * 5. Server Action: Memperbarui Pengaturan Detail Acara & Rundown
 * - Terproteksi sesi panitia
 * - Upsert pada baris tunggal EventSettings (id: "default")
 */
export async function updateEventSettingsAction(
  rawInput: unknown
): Promise<ActionResponse<EventSettings>> {
  try {
    await requirePanitiaSession();
  } catch {
    return {
      success: false,
      error: "Sesi panitia berakhir. Silakan login kembali.",
    };
  }

  const parsed = eventSettingsSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: "Periksa kembali isian pengaturan acara.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  try {
    const updated = await prisma.eventSettings.upsert({
      where: { id: "default" },
      update: {
        eventTitle: data.eventTitle,
        eventSubtitle: data.eventSubtitle,
        eventDateIso: data.eventDateIso,
        eventDateDisplay: data.eventDateDisplay,
        eventTimeDisplay: data.eventTimeDisplay,
        eventLocation: data.eventLocation,
        entryFeeLabel: data.entryFeeLabel,
        entryFeeAmount: data.entryFeeAmount,
        entryFeeNote: data.entryFeeNote,
        contactName: data.contactName,
        contactWhatsapp: data.contactWhatsapp,
        isRegistrationOpen: data.isRegistrationOpen,
        rundownJson: data.rundown,
      },
      create: {
        id: "default",
        eventTitle: data.eventTitle,
        eventSubtitle: data.eventSubtitle,
        eventDateIso: data.eventDateIso,
        eventDateDisplay: data.eventDateDisplay,
        eventTimeDisplay: data.eventTimeDisplay,
        eventLocation: data.eventLocation,
        entryFeeLabel: data.entryFeeLabel,
        entryFeeAmount: data.entryFeeAmount,
        entryFeeNote: data.entryFeeNote,
        contactName: data.contactName,
        contactWhatsapp: data.contactWhatsapp,
        isRegistrationOpen: data.isRegistrationOpen,
        rundownJson: data.rundown,
      },
    });

    safeRevalidate("/");
    safeRevalidate("/panitia/dashboard");

    return {
      success: true,
      message: "Pengaturan detail acara berhasil disimpan.",
      data: updated,
    };
  } catch (error) {
    console.error("[Update Event Settings Error]:", error);
    return {
      success: false,
      error: "Gagal menyimpan pengaturan acara. Silakan coba lagi.",
    };
  }
}
