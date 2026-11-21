"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Shield } from "lucide-react";

export function WebHeader() {
  const [imgError, setImgError] = useState(false);

  return (
    <header className="sticky top-0 z-30 w-full border-b border-edge/80 bg-surface/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Sisi Kiri: Logo + MUBES 2026 & Sub-label SABA EXPLOIT */}
        <Link
          href="/"
          className="flex items-center gap-3 sm:gap-3.5 group focus:outline-hidden"
        >
          {!imgError ? (
            <div className="relative h-10 w-10 shrink-0">
              <Image
                src="/images/logo-saba-exploit.png"
                alt="Logo Saba ExploIT"
                fill
                sizes="40px"
                className="object-contain"
                priority
                onError={() => setImgError(true)}
              />
            </div>
          ) : (
            <div className="h-10 w-10 shrink-0 flex items-center justify-center font-display font-bold text-brand text-xl">
              SE
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-display font-bold text-lg sm:text-xl tracking-wider text-ink uppercase leading-none group-hover:text-brand transition-colors">
              MUBES 2026
            </span>
            <span className="font-condensed font-semibold text-[11px] tracking-[0.22em] text-brand uppercase leading-tight mt-0.5">
              SABA EXPLOIT
            </span>
          </div>
        </Link>

        {/* Tengah: Navigasi Anchor Desktop */}
        <nav className="hidden md:flex items-center gap-7">
          <a
            href="#rundown-section"
            className="min-h-[44px] inline-flex items-center font-condensed uppercase tracking-[0.16em] text-xs text-ink-muted hover:text-brand transition-colors"
          >
            Susunan Acara
          </a>
          <a
            href="#rsvp-section"
            className="min-h-[44px] inline-flex items-center font-condensed uppercase tracking-[0.16em] text-xs text-ink-muted hover:text-brand transition-colors"
          >
            Konfirmasi
          </a>
          <a
            href="#messages-section"
            className="min-h-[44px] inline-flex items-center font-condensed uppercase tracking-[0.16em] text-xs text-ink-muted hover:text-brand transition-colors"
          >
            Pesan
          </a>
        </nav>

        {/* Sisi Kanan: Ghost Tactical Link Akses Panitia */}
        <div className="flex items-center gap-2">
          <Link
            href="/panitia/login"
            className="group relative min-h-[44px] px-3.5 py-2 inline-flex items-center gap-2 text-xs font-condensed font-bold tracking-[0.18em] text-ink-muted hover:text-ink transition-colors cursor-pointer"
          >
            <Shield className="h-4 w-4 shrink-0 text-brand group-hover:scale-110 transition-transform" />
            <span className="uppercase">PANITIA</span>
            {/* Indikator Garis Merah Tipis saat Hover */}
            <span className="absolute bottom-1.5 left-3.5 right-3.5 h-[2px] bg-brand scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
          </Link>
        </div>
      </div>
    </header>
  );
}
