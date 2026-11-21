"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import {
  MapPin,
  Calendar,
  Clock,
  MessageSquare,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Crosshair,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { EVENT_DEFAULTS } from "@/lib/constants";

export interface RundownItem {
  time: string;
  title: string;
  description: string;
}

interface EventBriefingSectionProps {
  rundown?: RundownItem[];
  contactName?: string;
  contactWhatsapp?: string;
  eventLocation?: string;
  eventDateDisplay?: string;
  eventTimeDisplay?: string;
  schoolPhotoSrc?: string;
  schoolBlueprintSrc?: string | null;
}

const DEFAULT_RUNDOWN: RundownItem[] = [
  {
    time: "09.00 – 09.30 WIB",
    title: "Open Gate & Registrasi",
    description:
      "Registrasi peserta di meja Humas, pemindaian E-Ticket QR, dan persiapan acara.",
  },
  {
    time: "09.30 – 09.55 WIB",
    title: "Pembukaan & Sambutan",
    description:
      "Pembukaan oleh MC, menyanyikan lagu Indonesia Raya, serta sambutan Ketua Panitia, Presiden Saba ExploIT, dan Pembimbing.",
  },
  {
    time: "09.55 – 10.35 WIB",
    title: "Laporan Proker & Sidang AD/ART",
    description:
      "Penyampaian laporan program kerja, keanggotaan, serta pembahasan AD/ART organisasi.",
  },
  {
    time: "10.35 – 11.55 WIB",
    title: "Perkenalan Anggota & Sharing Session",
    description:
      "Sesi perkenalan anggota dilanjutkan tanya jawab dan kilas balik lintas generasi.",
  },
  {
    time: "11.55 – 12.45 WIB",
    title: "ISHOMA",
    description:
      "Istirahat, sholat, dan makan bersama seluruh peserta dan alumni.",
  },
  {
    time: "12.45 – 13.45 WIB",
    title: "Games & Pembagian Hadiah",
    description:
      "Dua permainan interaktif MUBES, penyampaian kesan-pesan pemenang, dan penyerahan hadiah.",
  },
  {
    time: "13.45 – 13.55 WIB",
    title: "Penutup & Foto Bersama",
    description:
      "Penutupan resmi MUBES 2026 dan sesi dokumentasi bersama seluruh generasi.",
  },
];

export function EventBriefingSection({
  rundown = DEFAULT_RUNDOWN,
  contactName = EVENT_DEFAULTS.contactName,
  contactWhatsapp = EVENT_DEFAULTS.contactWhatsapp,
  eventLocation = EVENT_DEFAULTS.eventLocation,
  eventDateDisplay = EVENT_DEFAULTS.eventDateDisplay,
  eventTimeDisplay = EVENT_DEFAULTS.eventTimeDisplay,
  schoolPhotoSrc = "/images/venue/school-photo.jpg",
  schoolBlueprintSrc = null,
}: EventBriefingSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Fallback state untuk foto & blueprint venue sekolah
  const [useFallbackPhoto, setUseFallbackPhoto] = useState(false);
  const [useFallbackBlueprint, setUseFallbackBlueprint] = useState(false);

  // State ekspansi susunan acara panjang (> 6 sesi)
  const [isExpanded, setIsExpanded] = useState(false);

  const cleanContactWhatsapp = contactWhatsapp.replace(/\D/g, "");
  const waUrl = `https://wa.me/${cleanContactWhatsapp}?text=${encodeURIComponent(
    "Halo Humas Saba ExploIT, saya ingin bertanya terkait acara Musyawarah Besar (Mubes) 2026..."
  )}`;

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReduced) return;

      if (timelineRef.current) {
        const rows = timelineRef.current.querySelectorAll(".rundown-row");
        gsap.fromTo(
          rows,
          { opacity: 0, x: -24 },
          {
            opacity: 1,
            x: 0,
            stagger: 0.1,
            duration: 0.45,
            ease: "power2.out",
            scrollTrigger: {
              trigger: timelineRef.current,
              start: "top 80%",
            },
          }
        );
      }
    },
    { scope: containerRef, dependencies: [isExpanded] }
  );

  const visibleRundown =
    rundown.length > 6 && !isExpanded ? rundown.slice(0, 6) : rundown;
  const hiddenCount = rundown.length - 6;

  return (
    <section
      id="rundown-section"
      ref={containerRef}
      className="relative w-full bg-[#ECE8E1] text-[#0F1923] py-16 sm:py-24 scroll-mt-20 valo-slash-top valo-slash-bottom"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* ── BAGIAN ATAS: TACTICAL RECON HUD & VENUE SHOWCASE ── */}
        <div id="denah-section" className="space-y-6 scroll-mt-24">
          {/* Editorial Section Header */}
          <div className="flex items-center gap-3">
            <span className="w-8 h-[2px] bg-[#FF4655]" />
            <span className="font-condensed font-bold text-xs tracking-[0.22em] text-[#FF4655] uppercase">
              TACTICAL RECON HUD • MARKAS OPERASI MUBES
            </span>
            <span className="h-px flex-1 bg-[#0F1923]/15" />
          </div>

          <div className="relative border-2 border-[#0F1923] bg-[#0F1923] text-white overflow-hidden shadow-2xl valo-chamfer">
            {/* Top Bar Recon Dossier */}
            <div className="bg-[#0F1923] border-b border-white/10 px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-[#00E5FF] animate-spin-slow" />
                <span className="font-condensed font-bold text-xs tracking-[0.2em] text-white uppercase">
                  SEKTOR: SMAN 1 BANTUL • RUANG YUDISTIRA
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-[#00E5FF] border border-[#00E5FF]/40 bg-[#00E5FF]/10 px-2 py-0.5 uppercase tracking-wider font-semibold">
                  RECON SCAN: ACTIVE
                </span>
                <span className="hidden sm:inline font-mono text-[10px] text-[#0F1923] bg-[#ECE8E1] font-bold px-2 py-0.5 uppercase tracking-wider">
                  MARKAS BESAR
                </span>
              </div>
            </div>

            {/* Split Screen Showcase: Foto Sekolah + Blueprint Denah */}
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[320px] lg:min-h-[380px]">
              {/* Foto Utama Sekolah (Tampil penuh, jernih & tajam sesuai color grading) */}
              <div className="lg:col-span-8 relative min-h-[240px] sm:min-h-[300px] lg:min-h-full overflow-hidden group">
                <Image
                  src={
                    useFallbackPhoto
                      ? "/images/valorant/map-ascent-splash.png"
                      : schoolPhotoSrc
                  }
                  alt="Foto Udara SMA Negeri 1 Bantul — Ruang Yudistira"
                  fill
                  sizes="(max-width: 1024px) 100vw, 65vw"
                  className="object-cover group-hover:scale-102 transition-transform duration-700"
                  priority
                  onError={() => setUseFallbackPhoto(true)}
                />
                {/* Overlay lembut bagian bawah untuk kenyamanan baca badge callout */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F1923]/90 via-[#0F1923]/20 to-transparent pointer-events-none" />

                {/* Tactical Recon HUD Corner Accents */}
                <div className="absolute top-4 right-4 pointer-events-none opacity-40">
                  <div className="w-12 h-12 border-t border-r border-[#00E5FF]" />
                </div>
                <div className="absolute bottom-16 left-4 pointer-events-none opacity-40">
                  <div className="w-12 h-12 border-b border-l border-[#00E5FF]" />
                </div>

                {/* Tactical Callout Badges on Top of Photo (Sesuai Notulensi & Permintaan User) */}
                <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2 z-10">
                  <div className="bg-[#0F1923]/90 border border-[#FF4655]/60 px-3 py-1.5 backdrop-blur-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#FF4655] animate-pulse shrink-0" />
                    <span className="font-condensed font-bold text-xs tracking-wider text-white">
                      SITE A • RUANG YUDISTIRA
                    </span>
                  </div>
                  <div className="bg-[#0F1923]/90 border border-status-ok/60 px-3 py-1.5 backdrop-blur-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-status-ok shrink-0" />
                    <span className="font-condensed font-bold text-xs tracking-wider text-white">
                      SPAWN • PARKIR DALAM SEKOLAH
                    </span>
                  </div>
                  <div className="bg-[#0F1923]/90 border border-[#00E5FF]/60 px-3 py-1.5 backdrop-blur-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#00E5FF] shrink-0" />
                    <span className="font-condensed font-bold text-xs tracking-wider text-white">
                      CHECKPOINT • MEJA REGISTRASI HUMAS
                    </span>
                  </div>
                </div>
              </div>

              {/* Blueprint Denah Sekolah & Info Venue */}
              <div className="lg:col-span-4 p-6 bg-[#0F1923] flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-white/10 space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="font-condensed font-bold text-xs tracking-[0.18em] text-[#00E5FF] uppercase">
                      DENAH SEKOLAH (TACTICAL BLUEPRINT)
                    </span>
                    <span className="font-mono text-[10px] text-[#FF4655]">
                      RUANG YUDISTIRA
                    </span>
                  </div>

                  {/* Blueprint Denah Container / Slot Belum Ada */}
                  {schoolBlueprintSrc && !useFallbackBlueprint ? (
                    <div className="relative w-full aspect-square max-w-[180px] mx-auto bg-[#14202C] border border-[#00E5FF]/30 p-2 flex items-center justify-center">
                      <Image
                        src={schoolBlueprintSrc}
                        alt="Denah Blueprint SMAN 1 Bantul"
                        fill
                        sizes="180px"
                        className="object-contain filter invert opacity-90 p-1"
                        onError={() => setUseFallbackBlueprint(true)}
                      />
                    </div>
                  ) : (
                    /* Placeholder Tactical Radar / Blueprint Grid Estetik */
                    <div className="relative w-full aspect-square max-w-[180px] mx-auto bg-[#14202C] border border-[#00E5FF]/40 p-3 flex flex-col items-center justify-center text-center overflow-hidden valo-chamfer-sm group">
                      {/* Latar Belakang Minimap Taktis Halus */}
                      <Image
                        src="/images/valorant/map-ascent-minimap.png"
                        alt="Tactical Radar Grid"
                        fill
                        sizes="180px"
                        className="object-contain filter invert opacity-20 p-2 pointer-events-none group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Radar Target Graphic & Keterangan */}
                      <div className="relative z-10 flex flex-col items-center justify-center space-y-2 p-1">
                        <div className="relative w-9 h-9 flex items-center justify-center">
                          <span className="absolute inset-0 rounded-full border border-[#00E5FF]/40 animate-ping opacity-60" />
                          <span className="relative w-2.5 h-2.5 rounded-full bg-[#00E5FF]/40 border border-[#00E5FF]" />
                        </div>

                        <div className="space-y-1">
                          <span className="font-condensed font-bold text-[11px] text-[#00E5FF] tracking-[0.16em] uppercase block">
                            DENAH LOKASI
                          </span>
                          <span className="font-mono text-[9px] text-white/90 bg-[#0F1923]/90 border border-white/15 px-2 py-0.5 rounded-none block">
                            SEGERA HADIR (SIE KORLAP)
                          </span>
                        </div>
                      </div>

                      {/* Corner Taktis */}
                      <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-[#00E5FF]/60 pointer-events-none" />
                      <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-[#00E5FF]/60 pointer-events-none" />
                      <div className="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-[#00E5FF]/60 pointer-events-none" />
                      <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-[#00E5FF]/60 pointer-events-none" />
                    </div>
                  )}

                  {/* Alamat Resmi & Waktu (Bersih, Sesuai Notulensi) */}
                  <div className="space-y-2 pt-1 font-condensed">
                    <div>
                      <span className="text-[10px] tracking-[0.2em] text-white/50 uppercase block">
                        LOKASI RESMI
                      </span>
                      <p className="font-bold text-base text-white tracking-wide">
                        {eventLocation}
                      </p>
                      <p className="text-xs text-white/80 font-sans">
                        Jl. KHA Wakhid Hasyim 99, Bantul
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] tracking-[0.2em] text-white/50 uppercase block">
                        WAKTU OPERASIONAL
                      </span>
                      <p className="font-bold text-sm text-[#FF4655] tracking-wide">
                        {eventDateDisplay} • {eventTimeDisplay}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between font-mono text-[10px] text-white/50">
                  <span>COORD: 07°53&apos;S 110°19&apos;E</span>
                  <span className="text-[#00E5FF]">BANTUL RECON</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── BAGIAN BAWAH: EDITORIAL MISSION TIMELINE & STICKY HUMAS CARD ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Kolom Kiri: Editorial Mission Timeline (Rundown) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <span className="w-8 h-[2px] bg-[#FF4655]" />
                <h2 className="font-display font-bold uppercase text-2xl sm:text-3xl text-[#0F1923] tracking-wide">
                  SUSUNAN ACARA (MISSION TIMELINE)
                </h2>
              </div>
              <span className="font-mono text-xs text-[#0F1923]/60 font-semibold">
                TOTAL: {rundown.length} SESI
              </span>
            </div>

            <div
              ref={timelineRef}
              className="space-y-0 divide-y divide-[#0F1923]/15 border-y border-[#0F1923]/20"
            >
              {visibleRundown.map((item, idx) => {
                const stepNum = String(idx + 1).padStart(2, "0");
                return (
                  <div
                    key={idx}
                    className="rundown-row group relative py-5 sm:py-6 px-4 hover:bg-[#0F1923]/[0.035] transition-all duration-300 flex flex-col sm:flex-row sm:items-baseline gap-4 sm:gap-6 border-l-4 border-l-transparent hover:border-l-[#FF4655]"
                  >
                    {/* Big Bold Anton Step Number */}
                    <div className="font-display font-bold text-3xl sm:text-4xl text-[#0F1923]/30 group-hover:text-[#FF4655] transition-colors shrink-0 w-12">
                      {stepNum}
                    </div>

                    {/* Time Badge */}
                    <div className="font-mono font-bold text-xs sm:text-sm text-[#FF4655] shrink-0 sm:w-44 tracking-wider">
                      {item.time}
                    </div>

                    {/* Title & Description with Smooth Shift */}
                    <div className="min-w-0 flex-1 space-y-1 transform group-hover:translate-x-1.5 transition-transform duration-300">
                      <h3 className="font-display font-bold uppercase text-lg sm:text-xl text-[#0F1923] tracking-wide">
                        {item.title}
                      </h3>
                      <p className="font-sans text-xs sm:text-sm text-[#0F1923]/75 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tombol Buka/Tutup Rundown Panjang (> 6 sesi) */}
            {rundown.length > 6 && (
              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="min-h-[44px] px-6 py-2.5 border-2 border-[#0F1923] bg-white hover:bg-[#0F1923] text-[#0F1923] hover:text-white font-condensed font-bold text-xs uppercase tracking-[0.18em] transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  {isExpanded ? (
                    <>
                      <span>TUTUP JADWAL LENGKAP</span>
                      <ChevronUp className="h-4 w-4 shrink-0" />
                    </>
                  ) : (
                    <>
                      <span>LIHAT SELURUH JADWAL (+{hiddenCount} SESI)</span>
                      <ChevronDown className="h-4 w-4 shrink-0" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Kolom Kanan: Sticky Dark Humas Briefing Card */}
          <div className="lg:col-span-4 sticky top-24">
            <div className="relative border-2 border-[#0F1923] bg-[#0F1923] text-[#ECE8E1] valo-chamfer p-6 sm:p-7 space-y-5 overflow-hidden shadow-2xl">
              {/* Subtle Weapon Watermark in Background */}
              <div className="absolute -right-12 -bottom-8 w-64 h-32 opacity-10 pointer-events-none select-none">
                <Image
                  src="/images/valorant/weapon-vandal.png"
                  alt=""
                  fill
                  sizes="250px"
                  className="object-contain filter invert"
                />
              </div>

              {/* Card Header */}
              <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                <MessageSquare className="h-5 w-5 text-[#FF4655]" />
                <h3 className="font-display font-bold uppercase text-lg text-white tracking-wide">
                  NARAHUBUNG HUMAS
                </h3>
              </div>

              <p className="font-sans text-xs text-white/70 leading-relaxed">
                Memerlukan konfirmasi jadwal, kendala registrasi tiket, atau koordinasi alumni? Hubungi koordinator resmi Humas Saba ExploIT:
              </p>

              {/* Contact Information Box */}
              <div className="p-4 bg-[#14202C] border border-white/10 space-y-1.5">
                <span className="font-condensed font-bold text-[10px] tracking-[0.2em] text-[#FF4655] uppercase block">
                  KOORDINATOR HUMAS
                </span>
                <p className="font-display font-bold uppercase text-base sm:text-lg text-white tracking-wide">
                  {contactName}
                </p>
                <p className="font-mono text-xs text-white/80 tabular-nums">
                  +{cleanContactWhatsapp}
                </p>
              </div>

              {/* Riot Double-Border Style Action Button for WhatsApp */}
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="riot-btn-frame w-full min-h-[48px]"
              >
                <span className="riot-btn-inner flex items-center justify-center gap-2">
                  <MessageSquare className="h-4 w-4 shrink-0" />
                  <span>HUBUNGI VIA WHATSAPP</span>
                  <ChevronRight className="h-4 w-4 shrink-0" />
                </span>
              </a>

              <div className="p-3 bg-[#0F1923] border border-white/10 text-[11px] text-white/50 leading-tight font-sans">
                Layanan respons taktis aktif setiap hari pukul 08.00 – 21.00 WIB.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
