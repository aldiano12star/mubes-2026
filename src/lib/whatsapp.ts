/**
 * Pluggable WhatsApp Gateway Adapter
 * Default provider: Fonnte REST API (https://api.fonnte.com/send)
 *
 * Dirancang agar pengiriman pesan dapat bekerja secara graceful fallback
 * tanpa menggagalkan transaksi pendaftaran peserta meskipun gateway eksternal sedang offline.
 */

export interface WhatsappParticipantData {
  fullName: string;
  ticketCode: string;
  division: string;
  generation: string;
  whatsapp?: string | null;
}

export interface WhatsappSettingsData {
  eventDateDisplay: string;
  eventTimeDisplay: string;
  eventLocation: string;
}

export interface SendWhatsappResult {
  sent: boolean;
  skipped?: boolean;
  reason?: string;
  error?: string;
  response?: unknown;
}

/**
 * Menyusun template pesan WhatsApp resmi bertema VALORANT
 */
export function composeTicketWhatsappMessage(
  participant: WhatsappParticipantData,
  settings: WhatsappSettingsData,
  appUrl: string
): string {
  return (
    `*E-TICKET MUBES SABA EXPLOIT 2026*\n` +
    `_PROTOCOL: VALORANT_\n\n` +
    `Halo *${participant.fullName}*!\n` +
    `Konfirmasi kehadiranmu telah tercatat.\n\n` +
    `• *Kode Tiket:* ${participant.ticketCode}\n` +
    `• *Divisi / Gen:* ${participant.division} • ${participant.generation}\n` +
    `• *Tanggal:* ${settings.eventDateDisplay}\n` +
    `• *Waktu:* ${settings.eventTimeDisplay}\n` +
    `• *Lokasi:* ${settings.eventLocation}\n\n` +
    `Buka & unduh E-Ticket QR kamu melalui tautan berikut untuk ditunjukkan saat registrasi di lokasi:\n` +
    `${appUrl}/tiket/${participant.ticketCode}\n\n` +
    `Sampai jumpa di Ruang Yudistira!\n` +
    `— Panitia Mubes Saba ExploIT`
  );
}

/**
 * Mengirimkan E-Ticket via WhatsApp Gateway Adapter (Fonnte Ready)
 */
export async function sendTicketWhatsapp(
  participant: WhatsappParticipantData,
  settings: WhatsappSettingsData
): Promise<SendWhatsappResult> {
  const targetWhatsapp = participant.whatsapp?.trim();

  // 1. Validasi keberadaan nomor WhatsApp (OTS bisa saja tanpa nomor WA)
  if (!targetWhatsapp) {
    return {
      sent: false,
      skipped: true,
      reason: "Nomor WhatsApp tidak tersedia (tamu OTS).",
    };
  }

  const appUrl = (
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ).replace(/\/$/, "");

  const fonnteToken = process.env.FONNTE_TOKEN?.trim() || "";
  const apiUrl =
    process.env.FONNTE_API_URL?.trim() || "https://api.fonnte.com/send";
  const sendImage = process.env.FONNTE_SEND_IMAGE === "true";

  // 2. Graceful fallback jika token belum diisi atau masih berupa nilai placeholder
  if (!fonnteToken || fonnteToken.includes("isi_token_")) {
    console.warn(
      "[WhatsApp Adapter] FONNTE_TOKEN belum dikonfigurasi, pengiriman dilewati (graceful fallback)."
    );
    return {
      sent: false,
      skipped: true,
      reason: "FONNTE_TOKEN belum dikonfigurasi.",
    };
  }

  const message = composeTicketWhatsappMessage(participant, settings, appUrl);

  const payload: Record<string, string> = {
    target: targetWhatsapp,
    message,
    countryCode: "62",
  };

  // Hanya kirim properti "url" jika akun Fonnte mendukung pengiriman gambar
  if (sendImage) {
    payload.url = `${appUrl}/api/ticket-image/${participant.ticketCode}`;
  }

  // 3. Panggilan API dengan timeout 10 detik agar tidak menggantung proses registrasi
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: fonnteToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const responseData = await response.json().catch(() => null);

    if (!response.ok) {
      console.error("[WhatsApp Adapter] Gagal mengirim pesan via Fonnte:", responseData);
      return {
        sent: false,
        error: `HTTP ${response.status}: ${JSON.stringify(responseData)}`,
      };
    }

    return {
      sent: true,
      response: responseData,
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("[WhatsApp Adapter] Pengecualian jaringan saat menghubungi gateway:", errorMessage);
    return {
      sent: false,
      error: errorMessage,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}
