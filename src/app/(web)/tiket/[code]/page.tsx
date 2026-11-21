import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { EVENT_DEFAULTS } from "@/lib/constants";
import { TiltTicketCard } from "@/components/public/TiltTicketCard";
import { TicketActions } from "@/components/public/TicketActions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface TicketPageProps {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ existing?: string }>;
}

export async function generateMetadata({
  params,
}: TicketPageProps): Promise<Metadata> {
  const { code } = await params;
  const normalizedCode = decodeURIComponent(code).trim().toUpperCase();

  return {
    title: `E-Ticket ${normalizedCode} — Mubes Saba ExploIT 2026`,
    description: `Kartu E-Ticket Resmi Musyawarah Besar Saba ExploIT 2026 • Kode: ${normalizedCode} • Ruang Yudistira, SMAN 1 Bantul.`,
  };
}

export default async function TicketPage({
  params,
  searchParams,
}: TicketPageProps) {
  // 1. Next.js 16: Await async params & searchParams
  const [{ code }, { existing }] = await Promise.all([
    params,
    searchParams,
  ]);

  const normalizedCode = decodeURIComponent(code).trim().toUpperCase();

  if (!normalizedCode) {
    notFound();
  }

  // 2. Kueri data peserta dan pengaturan acara dari Neon PostgreSQL
  const [participant, settings] = await Promise.all([
    prisma.participant.findUnique({
      where: { ticketCode: normalizedCode },
    }),
    prisma.eventSettings.findUnique({
      where: { id: "default" },
    }),
  ]);

  if (!participant) {
    notFound();
  }

  const eventDateDisplay =
    settings?.eventDateDisplay ?? EVENT_DEFAULTS.eventDateDisplay;
  const eventTimeDisplay =
    settings?.eventTimeDisplay ?? EVENT_DEFAULTS.eventTimeDisplay;
  const eventLocation =
    settings?.eventLocation ?? EVENT_DEFAULTS.eventLocation;
  const eventSubtitle =
    settings?.eventSubtitle ?? EVENT_DEFAULTS.eventSubtitle;
  const entryFeeLabel =
    settings?.entryFeeLabel ?? EVENT_DEFAULTS.entryFeeLabel;
  const entryFeeAmount =
    settings?.entryFeeAmount ?? EVENT_DEFAULTS.entryFeeAmount;

  const isExisting = existing === "1";

  // 3. Generate QR Code kontras tinggi (modul hitam di atas bidang putih bersih)
  const qrDataUrl = await QRCode.toDataURL(participant.ticketCode, {
    width: 280,
    margin: 1,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
    errorCorrectionLevel: "M",
  });

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 space-y-6 py-8">
      {/* ── HEADER HUD KOORDINAT ── */}
      <div className="flex items-center gap-3">
        <span className="w-8 h-[2px] bg-[#FF4655]" />
        <span className="font-condensed font-bold text-xs tracking-[0.22em] text-[#FF4655] uppercase">
          VALORANT TACTICAL BOARDING PASS • MUBES 2026
        </span>
        <span className="h-px flex-1 bg-edge" />
      </div>

      {/* ── BANNER JIKA NOMOR WHATSAPP SUDAH PERNAH TERDAFTAR SEBELUMNYA ── */}
      {isExisting && (
        <div className="border border-amber-500/40 bg-amber-500/10 p-4 valo-chamfer-sm flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <h2 className="font-condensed font-bold uppercase text-sm sm:text-base text-amber-400 tracking-wide">
              NOMOR WHATSAPP SUDAH TERDAFTAR SEBELUMNYA
            </h2>
            <p className="font-sans text-xs text-ink-muted leading-relaxed mt-0.5">
              Nomor WhatsApp <strong className="text-white font-mono">+{participant.whatsapp}</strong> sudah terdaftar dalam sistem atas nama <strong className="text-white">{participant.fullName}</strong>. Menampilkan kartu E-Ticket resmi Anda yang telah tercatat.
            </p>
          </div>
        </div>
      )}

      {/* ── BANNER STATUS REGISTRASI / CHECK-IN ── */}
      {participant.isCheckedIn ? (
        <div className="border border-status-ok/40 bg-status-ok/10 p-4 valo-chamfer-sm flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-status-ok shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <h2 className="font-condensed font-bold uppercase text-sm sm:text-base text-status-ok tracking-wide">
              STATUS: TERVERIFIKASI HADIR (CHECKED-IN)
            </h2>
            <p className="font-sans text-xs text-ink-muted leading-relaxed mt-0.5">
              Peserta telah berhasil melakukan pemindaian kehadiran di meja registrasi Ruang Yudistira
              {participant.checkedInAt && (
                <> pada pukul{" "}
                  <strong className="text-ink font-mono tabular-nums">
                    {new Intl.DateTimeFormat("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "Asia/Jakarta",
                    }).format(new Date(participant.checkedInAt))} WIB
                  </strong>
                </>
              )}
              .
            </p>
          </div>
        </div>
      ) : (
        <div className="border border-edge bg-card p-4 valo-chamfer-sm flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-brand shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <h2 className="font-condensed font-bold uppercase text-sm sm:text-base text-ink tracking-wide">
              KONFIRMASI KEHADIRAN TERCATAT
            </h2>
            <p className="font-sans text-xs text-ink-muted leading-relaxed mt-0.5">
              {participant.lastWhatsappSentAt ? (
                <>
                  Pesan E-Ticket resmi telah dikirimkan ke nomor WhatsApp Anda (
                  <strong className="text-ink font-mono">
                    +{participant.whatsapp}
                  </strong>
                  ). Simpan atau unduh kartu tiket di bawah ini untuk ditunjukkan saat tiba di Ruang Yudistira.
                </>
              ) : (
                <>
                  Data kehadiran Anda telah tersimpan. Silakan simpan tautan halaman ini atau unduh gambar PNG E-Ticket di bawah ini untuk dibawa pada hari-H.
                </>
              )}
            </p>
          </div>
        </div>
      )}

      {/* ── KARTU VISUAL VALORANT TACTICAL BOARDING PASS (DIBUNGKUS TILT 3D CLIENT) ── */}
      <TiltTicketCard>
        <div className="relative border-2 border-[#2A3B4C] hover:border-brand/60 transition-colors bg-[#0F1923] valo-chamfer overflow-hidden shadow-2xl flex flex-col">
          {/* Garis Aksen Ganda Atas: Merah & Cyan Neon */}
          <div
            aria-hidden="true"
            className="h-1.5 flex w-full"
          >
            <span className="w-3/5 h-full bg-[#FF4655]" />
            <span className="w-2/5 h-full bg-[#00E5FF]" />
          </div>

          {/* Corner Brackets Taktis */}
          <div
            aria-hidden="true"
            className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-[#FF4655] pointer-events-none"
          />
          <div
            aria-hidden="true"
            className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-[#00E5FF] pointer-events-none"
          />
          <div
            aria-hidden="true"
            className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-[#00E5FF] pointer-events-none"
          />
          <div
            aria-hidden="true"
            className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-[#FF4655] pointer-events-none"
          />

          {/* ── 1. HEADER TIKET UNIVERSAL VALORANT ── */}
          <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-[#243545] bg-[#111A24]/90">
            {/* Sisi Kiri: Logo Resmi Saba ExploIT + Identitas Mubes */}
            <div className="flex items-center gap-3.5">
              <div className="relative h-11 w-11 sm:h-12 sm:w-12 shrink-0">
                <Image
                  src="/images/logo-saba-exploit.png"
                  alt="Logo Saba ExploIT"
                  fill
                  sizes="48px"
                  className="object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-base sm:text-lg text-ink tracking-wider uppercase leading-none">
                  MUBES 2026
                </span>
                <span className="font-condensed font-semibold text-[11px] text-[#FF4655] tracking-[0.16em] uppercase mt-1">
                  {eventSubtitle}
                </span>
              </div>
            </div>

            {/* Sisi Kanan: Badge Resmi HTM */}
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-[#00E5FF]/10 border border-[#00E5FF]/50 text-[#00E5FF] font-mono text-[11px] font-bold tracking-wider uppercase">
                {entryFeeLabel} • {entryFeeAmount}
              </div>
            </div>
          </div>

          {/* ── 2. BLOK IDENTITAS PESERTA BERGAYA VALORANT NAMEPLATE ── */}
          <div className="p-6 sm:p-8 space-y-5">
            {/* Header Mini Dossier & Status Check-In */}
            <div className="flex items-center justify-between border-b border-edge/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF4655]" />
                <span className="font-condensed font-bold text-xs tracking-[0.2em] text-ink-subtle uppercase">
                  OFFICIAL PASS HOLDER
                </span>
              </div>

              {participant.isCheckedIn ? (
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/40 px-2.5 py-0.5">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  <span>TERVERIFIKASI HADIR</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#00E5FF] bg-[#00E5FF]/10 border border-[#00E5FF]/40 px-2.5 py-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
                  <span>READY FOR CHECK-IN</span>
                </div>
              )}
            </div>

            {/* Pita Nama (Nameplate Krem Terang VALORANT) */}
            <div className="w-full bg-[#ECE8E1] px-5 py-3.5 text-[#0F1923] font-display font-black text-2xl sm:text-3xl tracking-wide uppercase truncate text-center shadow-md">
              {participant.fullName}
            </div>

            {/* Pita Gelar (Player Title Strip Tepat di Bawah Nama) */}
            <div className="w-full bg-[#14202C] px-5 py-2.5 border-t border-b border-[#2A3B4C] flex items-center justify-between font-mono text-xs text-[#ECE8E1] min-w-0">
              <div className="flex items-center gap-2 truncate">
                <span className="font-bold text-[#FF4655]">{participant.generation}</span>
                <span className="text-ink-subtle">•</span>
                <span className="truncate">{participant.division}</span>
              </div>

              {participant.isOnTheSpot && (
                <span className="px-2 py-0.5 bg-[#F59E0B] text-[#0F1923] font-mono text-[10px] font-bold uppercase shrink-0">
                  ON-THE-SPOT
                </span>
              )}
            </div>

            {/* ── 3. GARIS PERFORASI TIKET (TICKET STUB) DENGAN CUTOUTS ── */}
            <div className="relative my-6 flex items-center">
              <div
                aria-hidden="true"
                className="absolute -left-6 sm:-left-8 -top-3 h-6 w-6 rounded-full bg-surface border-r border-[#2A3B4C]"
              />
              <div className="w-full border-t-2 border-dashed border-[#2A3B4C]" />
              <div
                aria-hidden="true"
                className="absolute -right-6 sm:-right-8 -top-3 h-6 w-6 rounded-full bg-surface border-l border-[#2A3B4C]"
              />
            </div>

            {/* ── 4. ZONA QR VERIFICATION (SOLID WHITE #FFFFFF) ── */}
            <div className="relative max-w-[280px] sm:max-w-[300px] mx-auto">
              <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-2xl flex flex-col items-center justify-center text-center border-2 border-[#ECE8E1]">
                <div className="relative w-[200px] h-[200px] sm:w-[220px] sm:h-[220px] flex items-center justify-center">
                  <Image
                    src={qrDataUrl}
                    alt={`QR Code Tiket ${participant.ticketCode}`}
                    width={220}
                    height={220}
                    className="w-full h-full object-contain"
                    priority
                  />
                </div>

                {/* Kode Tiket Monospace Tebal */}
                <div className="font-mono font-black text-2xl sm:text-3xl text-zinc-950 tracking-wider tabular-nums mt-2">
                  {participant.ticketCode}
                </div>

                <div className="font-condensed text-[11px] tracking-widest text-zinc-600 uppercase font-bold mt-1">
                  TUNJUKKAN PADA MEJA REGISTRASI
                </div>
              </div>
            </div>

            {/* ── 5. FOOTER TIKET RAPI (GRID 2 KOLOM SEIMBANG) ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[#243545]">
              <div className="flex items-start gap-2.5 p-3.5 bg-[#14202C] border border-edge">
                <Calendar className="h-4 w-4 text-brand shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <span className="block font-condensed font-bold text-[10px] tracking-[0.16em] text-ink-subtle uppercase">
                    WAKTU PELAKSANAAN
                  </span>
                  <span className="font-sans font-semibold text-xs text-ink block truncate">
                    {eventDateDisplay}
                  </span>
                  <span className="font-mono text-[11px] text-ink-muted flex items-center gap-1 mt-0.5">
                    <Clock className="h-3 w-3 text-ink-subtle shrink-0" />
                    {eventTimeDisplay}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3.5 bg-[#14202C] border border-edge">
                <MapPin className="h-4 w-4 text-[#00E5FF] shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <span className="block font-condensed font-bold text-[10px] tracking-[0.16em] text-ink-subtle uppercase">
                    LOKASI ACARA
                  </span>
                  <span className="font-sans font-semibold text-xs text-ink block truncate">
                    {eventLocation}
                  </span>
                  <span className="font-mono text-[11px] text-ink-muted block truncate mt-0.5">
                    Jl. KHA Wakhid Hasyim 99, Bantul
                  </span>
                </div>
              </div>
            </div>

            {/* Baris Bawah Security Auth */}
            <div className="pt-2 flex items-center justify-between font-mono text-[10px] text-ink-subtle border-t border-edge/60">
              <span>SABA EXPLOIT • SECURITY VERIFIED</span>
              <span className="text-brand font-bold uppercase tracking-wider">PROTOCOL: VALORANT</span>
            </div>
          </div>
        </div>
      </TiltTicketCard>

      {/* ── KOMPONEN AKSI: DOWNLOAD, SALIN TAUTAN, KIRIM ULANG WA ── */}
      <TicketActions
        ticketCode={participant.ticketCode}
        hasWhatsapp={Boolean(participant.whatsapp)}
      />
    </div>
  );
}
