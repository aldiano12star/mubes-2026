import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Calendar,
  Clock,
  MessageCircle,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import { EVENT_DEFAULTS } from "@/lib/constants";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export function WebFooter() {
  const currentYear = new Date().getFullYear();

  const navLinks = [
    { label: "Beranda", href: "/#hero-section" },
    { label: "Susunan Acara", href: "/#rundown-section" },
    { label: "Lokasi Acara", href: "/#denah-section" },
    { label: "Konfirmasi Kehadiran", href: "/#rsvp-section" },
    { label: "Wall of Messages", href: "/#messages-section" },
    { label: "Portal Panitia", href: "/panitia/login" },
  ];

  return (
    <footer className="w-full border-t border-[#2A3B4C]/70 bg-[#0A1118] text-ink-muted mt-auto relative">
      {/* Garis Aksen Atas */}
      <div aria-hidden="true" className="h-[2px] w-full flex">
        <span className="w-3/5 h-full bg-[#FF4655]" />
        <span className="w-2/5 h-full bg-[#00E5FF]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* KOLOM 1: IDENTITAS ACARA & ORGANISASI */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="relative h-12 w-12 shrink-0">
                <Image
                  src="/images/logo-saba-exploit.png"
                  alt="Logo Saba ExploIT"
                  fill
                  sizes="48px"
                  className="object-contain"
                />
              </div>
              <div>
                <h3 className="font-display font-black text-lg sm:text-xl text-ink tracking-wider uppercase leading-none">
                  MUBES SABA EXPLOIT
                </h3>
                <p className="font-condensed font-bold text-xs text-[#FF4655] tracking-[0.2em] uppercase mt-1">
                  {EVENT_DEFAULTS.eventSubtitle}
                </p>
              </div>
            </div>

            <p className="font-sans text-xs sm:text-sm text-ink-muted leading-relaxed max-w-md">
              Musyawarah Besar Saba ExploIT 2026 menjadi forum musyawarah organisasi dan temu kangen anggota aktif serta alumni lintas generasi.
            </p>

            <div className="space-y-2 pt-2">
              <div className="flex items-start gap-2.5 text-xs text-ink-subtle">
                <MapPin className="h-4 w-4 text-brand shrink-0 mt-0.5" />
                <span className="leading-snug">
                  SMA Negeri 1 Bantul • {EVENT_DEFAULTS.venueAddress}
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-ink-subtle">
                <ShieldAlert className="h-4 w-4 text-[#00E5FF] shrink-0" />
                <span className="font-mono text-[11px] text-[#00E5FF] tracking-wider uppercase">
                  STATUS: PROTOKOL TERBUKA
                </span>
              </div>
            </div>
          </div>

          {/* KOLOM 2: NAVIGASI */}
          <div className="lg:col-span-3 space-y-3">
            <div className="flex items-center gap-2 border-b border-edge/60 pb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF4655]" />
              <h4 className="font-condensed font-bold text-xs text-ink tracking-[0.2em] uppercase">
                NAVIGASI
              </h4>
            </div>

            <nav className="flex flex-col space-y-1" aria-label="Navigasi Footer">
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="min-h-[44px] flex items-center text-xs sm:text-sm text-ink-muted hover:text-white transition-colors group px-1"
                >
                  <span className="w-1.5 h-1.5 bg-edge group-hover:bg-[#FF4655] transition-colors rounded-none mr-2.5 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* KOLOM 3: JADWAL & NARAHUBUNG */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2 border-b border-edge/60 pb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF]" />
              <h4 className="font-condensed font-bold text-xs text-ink tracking-[0.2em] uppercase">
                INFORMASI & HUMAS
              </h4>
            </div>

            <div className="p-3.5 bg-[#14202C] border border-[#243545] space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-ink font-semibold">
                <Calendar className="h-3.5 w-3.5 text-brand shrink-0" />
                <span>{EVENT_DEFAULTS.eventDateDisplay}</span>
              </div>
              <div className="flex items-center gap-2 text-ink-muted font-mono text-[11px]">
                <Clock className="h-3.5 w-3.5 text-ink-subtle shrink-0" />
                <span>{EVENT_DEFAULTS.eventTimeDisplay} (Ruang Yudistira)</span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <a
                href="https://instagram.com/sabaexploit"
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] w-full flex items-center justify-between px-3.5 py-2 bg-[#101B26] hover:bg-[#162534] border border-[#243545] hover:border-[#FF4655]/60 transition-colors text-xs text-ink group"
              >
                <div className="flex items-center gap-2.5">
                  <InstagramIcon className="h-4 w-4 text-[#FF4655] shrink-0" />
                  <span className="font-mono text-xs">@sabaexploit</span>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-ink-subtle group-hover:text-white transition-colors" />
              </a>

              <a
                href={`https://wa.me/${EVENT_DEFAULTS.contactWhatsapp}?text=${encodeURIComponent(
                  "Halo Humas Saba ExploIT, saya ingin menanyakan perihal MUBES 2026..."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] w-full flex items-center justify-between px-3.5 py-2 bg-[#101B26] hover:bg-[#162534] border border-[#243545] hover:border-[#00E5FF]/60 transition-colors text-xs text-ink group"
              >
                <div className="flex items-center gap-2.5">
                  <MessageCircle className="h-4 w-4 text-[#00E5FF] shrink-0" />
                  <span className="font-mono text-xs">Hubungi Humas (+{EVENT_DEFAULTS.contactWhatsapp})</span>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-ink-subtle group-hover:text-white transition-colors" />
              </a>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR COPYRIGHT */}
        <div className="mt-12 pt-6 border-t border-[#243545] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-subtle font-mono">
          <div className="text-center sm:text-left">
            &copy; {currentYear} Saba ExploIT — SMA Negeri 1 Bantul. All rights reserved.
          </div>
          <div className="text-center sm:text-right flex items-center gap-2">
            <span className="text-[#FF4655] font-bold">MUBES 2026</span>
            <span>•</span>
            <span>PANITIA GEN 19 & GEN 20</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
