"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { Calendar, Clock, MapPin, ChevronRight, Zap, Ticket } from "lucide-react";
import { CountdownTimer } from "@/components/public/CountdownTimer";
import { EVENT_DEFAULTS } from "@/lib/constants";
import {
  VALORANT_ROSTER,
  type ValorantAbility,
  type ValorantAgent,
} from "@/lib/valorant-roster";

interface HeroBriefingProps {
  eventTitle?: string;
  eventSubtitle?: string;
  eventDateIso?: string;
  eventDateDisplay?: string;
  eventTimeDisplay?: string;
  eventLocation?: string;
  venueAddress?: string;
  entryFeeLabel?: string;
  entryFeeAmount?: string;
  entryFeeNote?: string;
}

export function HeroBriefing({
  eventTitle = EVENT_DEFAULTS.eventTitle,
  eventSubtitle = EVENT_DEFAULTS.eventSubtitle,
  eventDateIso = EVENT_DEFAULTS.eventDateIso,
  eventDateDisplay = EVENT_DEFAULTS.eventDateDisplay,
  eventTimeDisplay = EVENT_DEFAULTS.eventTimeDisplay,
  eventLocation = EVENT_DEFAULTS.eventLocation,
  venueAddress = EVENT_DEFAULTS.venueAddress,
  entryFeeLabel = EVENT_DEFAULTS.entryFeeLabel,
  entryFeeAmount = EVENT_DEFAULTS.entryFeeAmount,
  entryFeeNote = EVENT_DEFAULTS.entryFeeNote,
}: HeroBriefingProps) {
  const [selectedSlug, setSelectedSlug] = useState<"jett" | "omen" | "phoenix">(
    "jett"
  );
  const [activeSkill, setActiveSkill] = useState<ValorantAbility | null>(null);
  const [agentImgError, setAgentImgError] = useState(false);

  const currentAgent: ValorantAgent =
    VALORANT_ROSTER.find((a) => a.slug === selectedSlug) || VALORANT_ROSTER[0];

  // Mouse Parallax (Framer Motion springs, desktop only)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 120 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const bgTextX = useTransform(smoothX, [-0.5, 0.5], [30, -30]);
  const bgTextY = useTransform(smoothY, [-0.5, 0.5], [20, -20]);
  const pillarX = useTransform(smoothX, [-0.5, 0.5], [-20, 20]);
  const agentX = useTransform(smoothX, [-0.5, 0.5], [-35, 35]);
  const agentY = useTransform(smoothY, [-0.5, 0.5], [-25, 25]);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <section
      id="hero-section"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative overflow-hidden bg-[#0F1923] border-b border-edge/80 pt-8 pb-16 lg:pt-14 lg:pb-24 scroll-mt-20"
    >
      {/* ── LAYER 1: TEXTURE ASCENT SPLASH BACKGROUND ── */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        <Image
          src="/images/valorant/map-ascent-splash.png"
          alt="Ascent Map Texture"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-10 mix-blend-luminosity filter blur-[1px]"
        />
        {/* Dark radial vignette towards canvas edges */}
        <div className="absolute inset-0 bg-radial from-transparent via-[#0F1923]/75 to-[#0F1923]" />
      </div>

      {/* ── LAYER 2: GIANT WATERMARK EDITORIAL TYPOGRAPHY ── */}
      <motion.div
        style={{ x: bgTextX, y: bgTextY }}
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none select-none flex items-center justify-end overflow-hidden pr-4 lg:pr-12"
      >
        <span className="font-display font-black text-[18vw] leading-none tracking-tighter text-white/[0.035] uppercase select-none whitespace-nowrap">
          {currentAgent.name}
        </span>
      </motion.div>

      {/* ── LAYER 3: RED GEOMETRIC PILLAR / SLANTED ACCENT ── */}
      <motion.div
        style={{ x: pillarX }}
        aria-hidden="true"
        className="hidden lg:block absolute right-[14%] top-0 bottom-0 w-44 bg-[#FF4655]/12 border-x border-[#FF4655]/25 transform skew-x-[-14deg] pointer-events-none"
      />

      {/* ── LAYER 4: MAIN CONTENT GRID ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* ════ KOLOM KIRI: MISSION BRIEFING & SPIKE COUNTDOWN ════ */}
          <div className="lg:col-span-7">
            <div className="w-full max-w-[560px] space-y-6">
              {/* Tactical Tagline / Coordinates */}
              <div className="flex items-center gap-3">
                <span className="w-8 h-[2px] bg-brand shrink-0" />
                <span className="font-condensed font-bold text-xs tracking-[0.24em] text-brand uppercase">
                  SMAN 1 BANTUL • RUANG YUDISTIRA
                </span>
                <span className="h-px flex-1 bg-edge/60" />
              </div>

              {/* Giant Anton Title with Editorial Subtitle */}
              <div className="space-y-3">
                <h1 className="font-display font-bold uppercase text-4xl sm:text-6xl lg:text-7xl text-ink tracking-tight leading-[0.95]">
                  {eventTitle}
                </h1>
                <p className="font-condensed font-bold text-sm sm:text-lg tracking-[0.18em] text-[#FF4655] uppercase">
                  {eventSubtitle}
                </p>
              </div>

              {/* Tactical Metadata Grid (Tata Letak 2+1 Sejajar Presisi dengan Countdown) */}
              <div className="space-y-3 pt-1">
                {/* Baris Atas: 2 Kolom Sejajar (Tanggal & Lokasi) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="border border-edge bg-[#14202C]/80 valo-chamfer-sm p-3.5 flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-brand shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <span className="block font-condensed font-bold text-[10px] tracking-[0.2em] text-ink-subtle uppercase">
                        TANGGAL ACARA
                      </span>
                      <span className="font-sans font-semibold text-sm text-ink block">
                        {eventDateDisplay}
                      </span>
                      <span className="font-mono text-xs text-ink-muted flex items-center gap-1.5 mt-0.5">
                        <Clock className="h-3.5 w-3.5 text-ink-subtle shrink-0" />
                        {eventTimeDisplay}
                      </span>
                    </div>
                  </div>

                  <div className="border border-edge bg-[#14202C]/80 valo-chamfer-sm p-3.5 flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-brand shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <span className="block font-condensed font-bold text-[10px] tracking-[0.2em] text-ink-subtle uppercase">
                        LOKASI ACARA
                      </span>
                      <span className="font-sans font-semibold text-sm text-ink block">
                        {eventLocation}
                      </span>
                      <span className="font-mono text-xs text-ink-muted block mt-0.5">
                        {venueAddress}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Baris Bawah: 1 Bilah Horizontal Selebar Penuh (HTM Radiant Pass) */}
                <div className="border border-[#00E5FF]/40 bg-[#14202C]/90 valo-chamfer-sm p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Ticket className="h-5 w-5 text-[#00E5FF] shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-condensed font-bold text-xs tracking-[0.2em] text-[#00E5FF] uppercase">
                          {entryFeeLabel}
                        </span>
                      </div>
                      <span className="font-sans font-semibold text-xs text-white block truncate mt-0.5">
                        {entryFeeNote}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    <span className="font-mono text-sm px-3 py-1 bg-[#00E5FF]/15 border border-[#00E5FF]/40 text-[#00E5FF] font-bold tracking-wider">
                      {entryFeeAmount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Precision Spike Countdown Component */}
              <div className="pt-2">
                <CountdownTimer targetIso={eventDateIso} />
              </div>

              {/* Double-Border Riot CTA Buttons */}
              <div className="pt-4 flex flex-wrap items-center gap-4">
                <a
                  href="#rsvp-section"
                  className="riot-btn-frame min-h-[48px]"
                >
                  <span className="riot-btn-inner flex items-center gap-2">
                    <span>KONFIRMASI KEHADIRAN</span>
                    <ChevronRight className="h-4 w-4" />
                  </span>
                </a>

                <a
                  href="#rundown-section"
                  className="riot-btn-frame-secondary min-h-[48px]"
                >
                  <span className="riot-btn-inner">
                    LIHAT RUNDOWN
                  </span>
                </a>
              </div>
            </div>
          </div>

          {/* ════ KOLOM KANAN: AGENT SELECT STAGE & 4-ABILITY KIT ════ */}
          <div className="lg:col-span-5 relative flex flex-col items-center">
            {/* Full Agent Character Portrait with Parallax & Free-bleed Stance */}
            <div className="relative w-full h-[380px] sm:h-[480px] lg:h-[520px] flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentAgent.slug}
                  style={{ x: agentX, y: agentY }}
                  initial={{ opacity: 0, x: 40, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -30, scale: 1.05 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="relative w-full h-full flex items-center justify-center"
                >
                  {!agentImgError ? (
                    <Image
                      src={currentAgent.portrait}
                      alt={currentAgent.name}
                      fill
                      priority
                      sizes="(max-width: 1024px) 90vw, 500px"
                      className="object-contain object-bottom drop-shadow-[0_20px_35px_rgba(0,0,0,0.85)] filter contrast-[1.04]"
                      onError={() => setAgentImgError(true)}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 border border-edge bg-card text-center">
                      <Zap className="h-12 w-12 text-brand mb-2" />
                      <span className="font-display text-2xl uppercase font-bold text-ink">
                        {currentAgent.name}
                      </span>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Slanted Agent Badge Overlay */}
              <div className="absolute top-2 left-2 z-20 flex items-center gap-2 px-3 py-1 bg-[#0F1923]/90 border border-edge valo-chamfer-sm backdrop-blur-xs">
                <div className="relative w-4 h-4 shrink-0">
                  <Image
                    src={currentAgent.roleIcon}
                    alt={currentAgent.role}
                    fill
                    sizes="16px"
                    className="object-contain invert opacity-90"
                  />
                </div>
                <span className="font-condensed font-bold text-xs tracking-wider uppercase text-ink">
                  {currentAgent.name} • {currentAgent.role}
                </span>
              </div>
            </div>

            {/* Interactive Agent Switcher (3 Icons) & Ability Kit Panel */}
            <div className="w-full max-w-md bg-[#14202C]/95 border border-edge/90 p-4 valo-chamfer space-y-3 backdrop-blur-md">
              {/* Agent Roster Select Row */}
              <div className="flex items-center justify-between border-b border-edge/60 pb-3">
                <span className="font-condensed font-bold text-xs tracking-[0.16em] text-ink-muted uppercase">
                  PILIH AGENT DISPLAY
                </span>
                <div className="flex items-center gap-2">
                  {VALORANT_ROSTER.map((agent) => {
                    const isSelected = selectedSlug === agent.slug;
                    return (
                      <button
                        key={agent.slug}
                        type="button"
                        onClick={() => {
                          setSelectedSlug(agent.slug);
                          setActiveSkill(null);
                        }}
                        className={`min-h-[48px] min-w-[48px] relative rounded-xs transition-all flex items-center justify-center p-1 cursor-pointer ${
                          isSelected
                            ? "bg-brand/20 border-2 border-brand shadow-[0_0_12px_rgba(255,70,85,0.4)]"
                            : "bg-[#0F1923] border border-edge hover:border-edge-strong opacity-70 hover:opacity-100"
                        }`}
                        title={agent.name}
                      >
                        <div className="relative w-9 h-9">
                          <Image
                            src={agent.icon}
                            alt={agent.name}
                            fill
                            sizes="36px"
                            className="object-contain"
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4-Skill Ability Kit Bar (C • Q • E • X) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-condensed font-bold text-[11px] tracking-[0.16em] text-ink-subtle uppercase">
                    ABILITY KIT ({currentAgent.name})
                  </span>
                  <span className="font-mono text-[10px] text-brand tracking-widest uppercase">
                    KLIK SKILL UNTUK INFO
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {currentAgent.abilities.map((ability, idx) => {
                    const isSkillActive =
                      activeSkill?.name === ability.name;
                    return (
                      <button
                        key={ability.name + idx}
                        type="button"
                        onClick={() =>
                          setActiveSkill(isSkillActive ? null : ability)
                        }
                        onMouseEnter={() => setActiveSkill(ability)}
                        className={`min-h-[48px] relative p-1.5 flex flex-col items-center justify-center border transition-all cursor-pointer group ${
                          isSkillActive
                            ? "bg-brand/20 border-brand shadow-[0_0_10px_rgba(255,70,85,0.3)]"
                            : "bg-[#0F1923] border-edge hover:border-brand/60"
                        }`}
                      >
                        <div className="relative w-7 h-7">
                          <Image
                            src={ability.icon}
                            alt={ability.name}
                            fill
                            sizes="28px"
                            className={`object-contain brightness-0 invert filter transition-opacity ${
                              isSkillActive
                                ? "opacity-100"
                                : "opacity-80 group-hover:opacity-100"
                            }`}
                          />
                        </div>
                        <span className="font-mono font-bold text-[10px] text-ink-muted mt-0.5">
                          {ability.slot}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Tactical Skill Description Popover / Box (Kontras Tinggi & Keterbacaan Optimal) */}
                <div className="min-h-[64px] p-3 bg-[#0F1923]/90 border border-[#2A3B4C] border-l-2 border-l-[#FF4655] text-left">
                  {activeSkill ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-white px-1.5 py-0.5 bg-brand border border-brand/50">
                          {activeSkill.slot}
                        </span>
                        <span className="font-condensed font-bold text-sm uppercase text-white tracking-wider">
                          {activeSkill.name}
                        </span>
                      </div>
                      <p className="font-sans text-sm leading-relaxed text-[#ECE8E1]">
                        {activeSkill.description}
                      </p>
                    </div>
                  ) : (
                    <p className="font-sans text-xs text-ink-subtle italic flex items-center justify-center h-full py-2">
                      Arahkan kursor atau ketuk salah satu skill di atas untuk membaca fungsi taktisnya.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
