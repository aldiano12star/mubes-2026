import { NextResponse } from "next/server";
import { getPanitiaSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Helper untuk membersihkan dan mengapit nilai kolom CSV dengan tanda kutip ganda (CSV Escaping)
 */
function escapeCsv(value: unknown): string {
  const str = String(value ?? "").trim();
  return `"${str.replace(/"/g, '""')}"`;
}

/**
 * Format tanggal dan jam ke zona waktu resmi WIB (Asia/Jakarta)
 */
function formatWib(dateInput: Date | null | undefined): string {
  if (!dateInput) return "-";
  try {
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "medium",
      timeZone: "Asia/Jakarta",
    }).format(new Date(dateInput));
  } catch {
    return "-";
  }
}

/**
 * GET /api/export
 * Endpoint terproteksi sesi panitia untuk mengunduh rekap seluruh peserta
 * dalam format CSV dengan karakter pembuka UTF-8 BOM (\uFEFF) agar rapi di Microsoft Excel.
 */
export async function GET() {
  // 1. Verifikasi Sesi Panitia
  const session = await getPanitiaSession();
  if (!session) {
    return NextResponse.json(
      { error: "Akses tidak diizinkan. Sesi panitia tidak valid." },
      { status: 401 }
    );
  }

  try {
    // 2. Ambil seluruh data peserta diurutkan berdasarkan urutan nomor tiket
    const participants = await prisma.participant.findMany({
      orderBy: { ticketSequence: "asc" },
    });

    // 3. Header Kolom CSV
    const headers = [
      "No",
      "Kode Tiket",
      "Nama Lengkap",
      "Divisi",
      "Generasi",
      "WhatsApp",
      "Jalur Daftar",
      "Status Hadir",
      "Waktu Check-In",
      "Konsumsi",
      "Suvenir",
      "Pesan",
    ];

    // 4. Baris-baris Data
    const rows = participants.map((p, idx) => {
      const displayMessage = p.message
        ? p.isAnonymous
          ? `[Anonim] ${p.message}`
          : p.message
        : "-";

      return [
        escapeCsv(idx + 1),
        escapeCsv(p.ticketCode),
        escapeCsv(p.fullName),
        escapeCsv(p.division),
        escapeCsv(p.generation),
        escapeCsv(p.whatsapp ? `+${p.whatsapp}` : "-"),
        escapeCsv(p.isOnTheSpot ? "On-The-Spot (OTS)" : "Online RSVP"),
        escapeCsv(p.isCheckedIn ? "Hadir" : "Belum Hadir"),
        escapeCsv(formatWib(p.checkedInAt)),
        escapeCsv(p.hasConsumed ? "Sudah Diambil" : "Belum Diambil"),
        escapeCsv(p.hasSouvenir ? "Sudah Diambil" : "Belum Diambil"),
        escapeCsv(displayMessage),
      ].join(",");
    });

    // 5. Susun konten CSV lengkap dengan UTF-8 BOM (\uFEFF)
    const csvContent = "\uFEFF" + [headers.map(escapeCsv).join(","), ...rows].join("\r\n");

    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="Rekap-Mubes-Saba-Exploit-2026.csv"',
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("[Export CSV Error]:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengekspor data CSV." },
      { status: 500 }
    );
  }
}
