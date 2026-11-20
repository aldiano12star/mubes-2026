"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  publicRegistrationSchema,
  type ActionResponse,
} from "@/lib/validations";
import { formatTicketCode, EVENT_DEFAULTS } from "@/lib/constants";
import { sendTicketWhatsapp } from "@/lib/whatsapp";

/**
 * Server Action: Mendaftarkan peserta publik (RSVP)
 * - Validasi Zero-Trust dengan Zod
 * - Pengecekan Anti-Duplikasi WhatsApp (mengembalikan tiket lama jika sudah terdaftar)
 * - Transaksi Atomik ACID ($transaction) dengan retry loop untuk mencegah race condition ticketSequence
 * - Pengiriman E-Ticket ke WhatsApp secara non-blocking dengan graceful fallback
 */
export async function registerParticipantAction(
  rawInput: unknown
): Promise<
  ActionResponse<{
    ticketCode: string;
    isExisting: boolean;
    existingName?: string;
  }>
> {
  // 1. Validasi input dengan Zod
  const parsed = publicRegistrationSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: "Periksa kembali isian formulir Anda.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  try {
    // 2. Cek status pembukaan registrasi dari EventSettings
    const settings = await prisma.eventSettings.findUnique({
      where: { id: "default" },
    });

    if (settings && !settings.isRegistrationOpen) {
      return {
        success: false,
        error:
          "Mohon maaf, pendaftaran online saat ini sudah ditutup oleh panitia.",
      };
    }

    // 3. Cek Anti-Duplikasi WhatsApp
    const existing = await prisma.participant.findUnique({
      where: { whatsapp: data.whatsapp },
    });

    if (existing) {
      return {
        success: true,
        message: `Nomor WhatsApp ini sudah terdaftar atas nama ${existing.fullName} (${existing.ticketCode}). Mengalihkan ke E-Ticket Anda...`,
        data: {
          ticketCode: existing.ticketCode,
          existingName: existing.fullName,
          isExisting: true,
        },
      };
    }

    // 4. Transaksi Atomik ACID dengan Retry Loop (maksimal 5 kali percobaan)
    let attempts = 0;
    const maxAttempts = 5;
    let createdParticipant = null;

    while (attempts < maxAttempts) {
      attempts++;
      try {
        createdParticipant = await prisma.$transaction(async (tx) => {
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
              whatsapp: data.whatsapp,
              message: data.message || null,
              isAnonymous: data.isAnonymous,
              isOnTheSpot: false,
            },
          });
        });
        break; // Berhasil, keluar dari loop
      } catch (error: unknown) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          // Benturan kunci unik: periksa apakah disebabkan oleh duplikasi whatsapp konkuren
          const concurrent = await prisma.participant.findUnique({
            where: { whatsapp: data.whatsapp },
          });

          if (concurrent) {
            return {
              success: true,
              message:
                "Nomor WhatsApp Anda sudah terdaftar. Mengalihkan ke E-Ticket...",
              data: {
                ticketCode: concurrent.ticketCode,
                isExisting: true,
              },
            };
          }

          // Jika benturan terjadi pada ticketSequence, coba lagi dengan backoff kecil
          if (attempts < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, 50 * attempts));
            continue;
          }
        }

        console.error(
          "[Registration Action Error] Gagal dalam transaksi pembuatan tiket:",
          error
        );
        return {
          success: false,
          error:
            "Terjadi kesalahan saat memproses pendaftaran. Silakan coba lagi.",
        };
      }
    }

    if (!createdParticipant) {
      return {
        success: false,
        error: "Sistem sedang sibuk. Silakan coba beberapa saat lagi.",
      };
    }

    // 5. Pengiriman E-Ticket WhatsApp secara Non-Blocking (Graceful Fallback)
    try {
      const settingsData = {
        eventDateDisplay:
          settings?.eventDateDisplay ?? EVENT_DEFAULTS.eventDateDisplay,
        eventTimeDisplay:
          settings?.eventTimeDisplay ?? EVENT_DEFAULTS.eventTimeDisplay,
        eventLocation: settings?.eventLocation ?? EVENT_DEFAULTS.eventLocation,
      };

      const waResult = await sendTicketWhatsapp(
        {
          fullName: createdParticipant.fullName,
          ticketCode: createdParticipant.ticketCode,
          division: createdParticipant.division,
          generation: createdParticipant.generation,
          whatsapp: createdParticipant.whatsapp,
        },
        settingsData
      );

      if (waResult.sent) {
        await prisma.participant.update({
          where: { id: createdParticipant.id },
          data: { lastWhatsappSentAt: new Date() },
        });
      }
    } catch (waError) {
      console.warn(
        "[Registration Action] Pengiriman WhatsApp non-blocking gagal:",
        waError
      );
    }

    // 6. Revalidasi cache halaman (aman terhadap pemanggilan di luar request store Next.js)
    try {
      revalidatePath("/", "page");
      revalidatePath("/panitia/dashboard", "page");
      revalidatePath(`/tiket/${createdParticipant.ticketCode}`, "page");
    } catch {
      // Abaikan saat dipanggil di luar konteks request Next.js (misal: saat pengujian)
    }

    return {
      success: true,
      message: "Konfirmasi kehadiran berhasil!",
      data: {
        ticketCode: createdParticipant.ticketCode,
        isExisting: false,
      },
    };
  } catch (err) {
    console.error("[Registration Action Error] Pengecualian tak terduga:", err);
    return {
      success: false,
      error: "Terjadi gangguan sistem. Silakan coba beberapa saat lagi.",
    };
  }
}

/**
 * Server Action: Mengirim ulang E-Ticket ke nomor WhatsApp peserta
 * - Dibatasi jeda (cooldown) minimal 60 detik per klik
 */
export async function resendTicketWhatsappAction(
  ticketCode: string
): Promise<ActionResponse<null>> {
  const code = ticketCode?.trim().toUpperCase();

  if (!code) {
    return {
      success: false,
      error: "Kode tiket tidak valid.",
    };
  }

  try {
    // 1. Cari data peserta
    const participant = await prisma.participant.findUnique({
      where: { ticketCode: code },
    });

    if (!participant || !participant.whatsapp) {
      return {
        success: false,
        error:
          "Data peserta tidak ditemukan atau nomor WhatsApp belum terdaftar.",
      };
    }

    // 2. Proteksi Cooldown 60 Detik
    if (participant.lastWhatsappSentAt) {
      const diffMs =
        Date.now() - new Date(participant.lastWhatsappSentAt).getTime();
      if (diffMs < 60_000) {
        const remainingSec = Math.ceil((60_000 - diffMs) / 1000);
        return {
          success: false,
          error: `Tunggu ${remainingSec} detik sebelum mengirim ulang pesan WhatsApp.`,
        };
      }
    }

    // 3. Ambil pengaturan acara
    const settings = await prisma.eventSettings.findUnique({
      where: { id: "default" },
    });

    const settingsData = {
      eventDateDisplay:
        settings?.eventDateDisplay ?? EVENT_DEFAULTS.eventDateDisplay,
      eventTimeDisplay:
        settings?.eventTimeDisplay ?? EVENT_DEFAULTS.eventTimeDisplay,
      eventLocation: settings?.eventLocation ?? EVENT_DEFAULTS.eventLocation,
    };

    // 4. Kirim pesan WhatsApp
    const result = await sendTicketWhatsapp(
      {
        fullName: participant.fullName,
        ticketCode: participant.ticketCode,
        division: participant.division,
        generation: participant.generation,
        whatsapp: participant.whatsapp,
      },
      settingsData
    );

    if (result.sent) {
      await prisma.participant.update({
        where: { id: participant.id },
        data: { lastWhatsappSentAt: new Date() },
      });

      return {
        success: true,
        message: "E-Ticket berhasil dikirimkan ke nomor WhatsApp Anda!",
        data: null,
      };
    }

    if (result.skipped) {
      return {
        success: false,
        error: `Pengiriman WhatsApp dilewati: ${result.reason || "Gateway belum aktif"}`,
      };
    }

    return {
      success: false,
      error:
        result.error ||
        "Gagal mengirim pesan WhatsApp. Silakan coba beberapa saat lagi.",
    };
  } catch (error) {
    console.error(
      "[Resend WhatsApp Action Error] Pengecualian tak terduga:",
      error
    );
    return {
      success: false,
      error:
        "Terjadi kesalahan saat memproses pengiriman ulang. Silakan coba lagi.",
    };
  }
}
