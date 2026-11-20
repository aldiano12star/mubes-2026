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
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { EVENT_DEFAULTS } from "@/lib/constants";
import { TiltTicketCard } from "@/components/public/TiltTicketCard";
import { TicketActions } from "@/components/public/TicketActions";

export const dynamic = "force-dynamic";

interface TicketPageProps {
  params: Promise<{ code: string }>;
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

export default async function TicketPage({ params }: TicketPageProps) {
  // 1. Next.js 16: Await async params
  const { code } = await params;
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

  // 3. Karakter Agent deterministik untuk VALORANT Lobby Party Card (Jett, Omen, Phoenix)
  const AGENT_SHOWCASE = [
    { slug: "jett", name: "Jett", role: "Duelist", portrait: "/images/valorant/agent-jett.png" },
    { slug: "omen", name: "Omen", role: "Controller", portrait: "/images/valorant/agent-omen.png" },
    { slug: "phoenix", name: "Phoenix", role: "Duelist", portrait: "/images/valorant/agent-phoenix.png" },
  ] as const;
  const assignedAgent = AGENT_SHOWCASE[participant.ticketSequence % 3];

  // 4. Generate QR Code kontras tinggi (modul hitam di atas bidang putih bersih)
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
    <div className="max-w-2xl mx-auto px-4 sm:px-6 space-y-8 py-8">
      {/* ── HEADER HUD KOORDINAT ── */}
      <div className="flex items-center gap-3">
        <span className="w-8 h-[2px] bg-[#FF4655]" />
        <span className="font-condensed font-bold text-xs tracking-[0.22em] text-[#FF4655] uppercase">
          VALORANT LOBBY PARTY CARD • MUBES 2026
        </span>
        <span className="h-px flex-1 bg-edge" />
      </div>

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

      {/* ── KARTU VISUAL VALORANT LOBBY PARTY CARD (DIBUNGKUS TILT 3D CLIENT) ── */}
      <TiltTicketCard>
        <div className="relative border-2 border-[#243545] hover:border-brand/60 transition-colors bg-[#0F1923] valo-chamfer overflow-hidden shadow-2xl flex flex-col">
          {/* Garis Aksen Ganda Atas: Merah & Cyan Neon */}
          <div
            aria-hidden="true"
            className="h-1.5 flex w-full"
          >
            <span className="w-2/3 h-full bg-[#FF4655]" />
            <span className="w-1/3 h-full bg-[#00E5FF]" />
          </div>

          {/* ── 1. TOP LEVEL BORDER & HEADER LOBBY ── */}
          <div className="px-5 sm:px-6 pt-4 pb-3 flex items-center justify-between border-b border-[#243545] bg-[#111A24]/90 z-10">
            {/* Sisi Kiri: Logo & Sub-label */}
            <div className="flex items-center gap-2.5">
              <div className="relative h-8 w-8 shrink-0">
                <Image
                  src="/images/logo-saba-exploit.png"
                  alt="Logo Saba ExploIT"
                  fill
                  sizes="32px"
                  className="object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-xs sm:text-sm text-ink tracking-wider uppercase leading-none">
                  SABA EXPLOIT
                </span>
                <span className="font-condensed font-semibold text-[10px] text-ink-subtle tracking-[0.16em] uppercase mt-0.5">
                  PARTY INVITE
                </span>
              </div>
            </div>

            {/* Tengah: Account Level Border (MUBES 26) */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#1A2634] border border-[#00E5FF]/60 text-[#00E5FF] font-mono font-bold text-[11px] tracking-widest uppercase shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse shrink-0" />
              <span>MUBES 26</span>
            </div>

            {/* Sisi Kanan: Badge HTM */}
            <div className="px-2.5 py-1 bg-[#00E5FF]/10 border border-[#00E5FF]/40 text-[#00E5FF] font-mono text-[10px] font-bold tracking-wider uppercase">
              {entryFeeLabel} • {entryFeeAmount}
            </div>
          </div>

          {/* ── 2. HERO ARTWORK BANNER (AGENT SHOWCASE + MAP SPLASH) ── */}
          <div className="relative w-full h-[260px] sm:h-[300px] overflow-hidden bg-[#0A1118]">
            {/* Texture Map Ascent */}
            <div className="absolute inset-0 select-none pointer-events-none">
              <Image
                src="/images/valorant/map-ascent-splash.png"
                alt="Ascent Map"
                fill
                sizes="(max-width: 768px) 100vw, 600px"
                className="object-cover object-center opacity-25 mix-blend-luminosity filter blur-[0.5px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F1923] via-[#0F1923]/60 to-transparent" />
            </div>

            {/* Watermark Tipografi Taktis Latar Belakang */}
            <div
              aria-hidden="true"
              className="absolute -right-4 top-1/2 -translate-y-1/2 font-display text-[84px] font-black text-white/[0.04] select-none pointer-events-none rotate-90 tracking-widest"
            >
              VALORANT
            </div>

            {/* Agent Character Portrait */}
            <div className="absolute inset-x-0 bottom-0 h-full flex items-end justify-center pointer-events-none">
              <div className="relative w-[280px] sm:w-[320px] h-[250px] sm:h-[290px]">
                <Image
                  src={assignedAgent.portrait}
                  alt={assignedAgent.name}
                  fill
                  sizes="320px"
                  priority
                  className="object-contain object-bottom drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)]"
                />
              </div>
            </div>

            {/* HUD Callout Kiri: Agent & Role */}
            <div className="absolute bottom-3 left-4 sm:left-6 z-10 flex items-center gap-2 px-2.5 py-1 bg-[#0F1923]/90 border border-edge/80 backdrop-blur-xs">
              <span className="w-1.5 h-1.5 bg-[#FF4655] rounded-full shrink-0" />
              <span className="font-condensed font-bold text-xs uppercase text-white tracking-widest">
                AGENT: {assignedAgent.name} • {assignedAgent.role}
              </span>
            </div>

            {/* HUD Callout Kanan: Lobby Party */}
            <div className="absolute bottom-3 right-4 sm:right-6 z-10 font-mono text-[10px] text-ink-subtle uppercase tracking-wider bg-[#0F1923]/90 px-2 py-0.5 border border-edge/60">
              LOBBY: SABA EXPLOIT
            </div>
          </div>

          {/* ── 3. CLASSIC VALORANT PLAYER NAMEPLATE & TITLE STRIP ── */}
          <div className="w-full flex flex-col z-10">
            {/* Baris Nama (Nameplate Krem Khas VALORANT Lobby) */}
            <div className="w-full bg-[#ECE8E1] px-5 py-3 text-[#0F1923] font-display font-black text-2xl sm:text-3xl tracking-wide uppercase truncate text-center shadow-md">
              {participant.fullName}
            </div>

            {/* Pita Gelar (Player Title Strip) */}
            <div className="w-full bg-[#16222F] px-5 py-2 border-t border-b border-[#FF4655]/40 flex items-center justify-between font-mono text-xs text-[#ECE8E1] min-w-0">
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

            {/* Status Lobby (READY Bar) */}
            <div className="w-full">
              {participant.isCheckedIn ? (
                <div className="w-full py-2 bg-emerald-500/15 border-b border-emerald-500/40 text-emerald-400 font-mono font-bold text-xs uppercase tracking-widest text-center flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>VERIFIED • CHECKED IN</span>
                </div>
              ) : (
                <div className="w-full py-2 bg-[#00E5FF]/10 border-b border-[#00E5FF]/40 text-[#00E5FF] font-mono font-bold text-xs uppercase tracking-widest text-center flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-ping shrink-0" />
                  <span>READY FOR DEPLOYMENT</span>
                </div>
              )}
            </div>
          </div>

          {/* ── 4. QR VERIFICATION DOCK (SOLID WHITE #FFFFFF) ── */}
          <div className="p-6 sm:p-8 space-y-6">
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

            {/* Detail Waktu & Lokasi Sesuai Notulensi Rapat */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-edge/80">
              <div className="flex items-start gap-2.5 p-3.5 bg-[#14202C] border border-edge">
                <Calendar className="h-4 w-4 text-brand shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <span className="block font-condensed font-bold text-[10px] tracking-[0.16em] text-ink-subtle uppercase">
                    JADWAL MISI
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
                    SEKTOR OPERASI
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

            {/* Footer Kartu Taktis */}
            <div className="pt-2 flex items-center justify-between font-mono text-[10px] text-ink-subtle border-t border-edge/60">
              <span>SABA EXPLOIT • {eventSubtitle.toUpperCase()}</span>
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
