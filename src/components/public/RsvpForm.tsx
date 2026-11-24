"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import {
  Lock,
  MessageSquare,
  AlertTriangle,
  Info,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Ticket,
  ChevronDown,
  Check,
} from "lucide-react";
import { toast } from "@/components/ui/Toast";
import { registerParticipantAction } from "@/actions/registration.actions";
import {
  DIVISIONS,
  PUBLIC_GENERATIONS,
  EVENT_DEFAULTS,
  type Division,
  type PublicGeneration,
} from "@/lib/constants";

interface RsvpFormProps {
  isRegistrationOpen?: boolean;
  entryFeeLabel?: string;
  entryFeeAmount?: string;
}

export function RsvpForm({
  isRegistrationOpen = true,
  entryFeeLabel = EVENT_DEFAULTS.entryFeeLabel,
  entryFeeAmount = EVENT_DEFAULTS.entryFeeAmount,
}: RsvpFormProps) {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [division, setDivision] = useState<Division | "">("");
  const [generation, setGeneration] = useState<PublicGeneration | "">("");
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Custom Dropdown State
  const [isGenDropdownOpen, setIsGenDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tutup dropdown saat klik di luar area atau menekan Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsGenDropdownOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsGenDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    if (!division) {
      setFieldErrors((prev) => ({
        ...prev,
        division: ["Silakan pilih salah satu divisi"],
      }));
      toast.error("Pilih divisi Anda terlebih dahulu.");
      return;
    }

    if (!generation) {
      setFieldErrors((prev) => ({
        ...prev,
        generation: ["Silakan pilih generasi Anda"],
      }));
      toast.error("Pilih generasi Anda terlebih dahulu.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await registerParticipantAction({
        fullName,
        whatsapp,
        division,
        generation,
        message,
        isAnonymous,
      });

      if (!response.success) {
        toast.error(response.error);
        if (response.fieldErrors) {
          setFieldErrors(response.fieldErrors);
        }
        setIsSubmitting(false);
        return;
      }

      // Deteksi nomor WhatsApp yang sudah pernah terdaftar sebelumnya
      if (response.data.isExisting) {
        toast.info(
          "Nomor WhatsApp Sudah Terdaftar",
          `Nomor WhatsApp ini sudah terdaftar atas nama ${response.data.existingName ?? "peserta"} (${response.data.ticketCode}). Mengalihkan ke E-Ticket Anda...`,
          5000
        );
        router.push(`/tiket/${response.data.ticketCode}?existing=1`);
        return;
      }

      toast.success(response.message);
      router.push(`/tiket/${response.data.ticketCode}`);
    } catch (err) {
      console.error("[RSVP Form Error]:", err);
      toast.error("Terjadi kegagalan jaringan saat mengirim data. Coba lagi.");
      setIsSubmitting(false);
    }
  };

  if (!isRegistrationOpen) {
    return (
      <section id="rsvp-section" className="relative bg-[#0F1923] text-white py-16 scroll-mt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-8">
            <span className="w-8 h-[2px] bg-[#FF4655]" />
            <h2 className="font-condensed font-bold text-xs tracking-[0.22em] text-[#FF4655] uppercase">
              KONFIRMASI KEHADIRAN
            </h2>
          </div>

          <div className="border border-edge-strong bg-[#14202C] p-8 sm:p-12 valo-chamfer text-center space-y-4">
            <div className="flex justify-center">
              <Lock className="h-12 w-12 text-[#FF4655]" />
            </div>
            <h3 className="font-display font-bold uppercase text-2xl sm:text-3xl text-white tracking-wide">
              PENDAFTARAN ONLINE TELAH DITUTUP
            </h3>
            <p className="font-sans text-sm text-ink-muted leading-relaxed max-w-xl mx-auto">
              Pendaftaran online ditutup. Silakan datang langsung ke Ruang Yudistira SMAN 1 Bantul pada hari-H untuk registrasi On-The-Spot (OTS).
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Live Card Preview Derived States
  const previewName = fullName.trim() || "AGENT CALLSIGN";
  const previewDivision = division || "UNASSIGNED DIV";

  // Penentuan status keanggotaan otomatis
  const isMemberActive =
    generation === "Gen 19" || generation === "Gen 20" || generation === "Gen 21";
  const memberStatusBadge = generation
    ? isMemberActive
      ? "ANGGOTA AKTIF"
      : "ALUMNI"
    : "BELUM DIPILIH";

  return (
    <section
      id="rsvp-section"
      className="relative bg-[#0F1923] text-white py-16 sm:py-24 scroll-mt-20 border-t border-edge/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="flex items-center gap-3">
          <span className="w-8 h-[2px] bg-[#FF4655]" />
          <h2 className="font-condensed font-bold text-xs tracking-[0.22em] text-[#FF4655] uppercase">
            KONFIRMASI KEHADIRAN
          </h2>
          <span className="h-px flex-1 bg-edge/60" />
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* ════ KOLOM KIRI (STICKY): LIVE PLAYER CARD PREVIEW ════ */}
          <div className="lg:col-span-5 sticky top-24 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-condensed font-bold text-xs tracking-[0.16em] text-ink-muted uppercase">
                LIVE PLAYER CARD PREVIEW
              </span>
              <span className="font-mono text-[10px] text-brand tracking-widest uppercase flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                REAL-TIME SYNC
              </span>
            </div>

            {/* Tactical Player Card Container */}
            <div className="relative w-full aspect-[9/14] max-w-[340px] mx-auto bg-[#14202C] border-2 border-edge hover:border-brand/60 transition-colors valo-chamfer overflow-hidden shadow-2xl flex flex-col justify-between p-5 select-none">
              {/* Card Background Texture */}
              <div className="absolute inset-0 pointer-events-none opacity-20 mix-blend-luminosity">
                <Image
                  src="/images/valorant/map-ascent-splash.png"
                  alt=""
                  fill
                  sizes="340px"
                  className="object-cover"
                />
              </div>

              {/* Decorative Corner Ticks */}
              <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#FF4655]" />
              <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#FF4655]" />
              <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-white/40" />
              <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-white/40" />

              {/* Top Card HUD: Event Tag + Sequence Placeholder */}
              <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
                  <span className="font-condensed font-bold text-xs tracking-wider text-white uppercase">
                    MUBES 2026
                  </span>
                </div>
                <span className="font-mono font-bold text-xs text-[#FF4655] tracking-widest bg-black/40 px-2 py-0.5 border border-[#FF4655]/40">
                  SE-MUBES-XXX
                </span>
              </div>

              {/* Middle Section: Player Identity */}
              <div className="relative z-10 my-auto flex flex-col items-center justify-center text-center space-y-3 py-6">
                <div className="relative w-20 h-20 rounded-full border-2 border-[#FF4655] bg-black/60 flex items-center justify-center shadow-lg">
                  <ShieldCheck className="w-10 h-10 text-[#FF4655]" />
                </div>

                <div className="space-y-1.5 w-full px-2">
                  <span className="font-display font-bold uppercase text-2xl sm:text-3xl text-white tracking-wide block truncate drop-shadow-md">
                    {previewName}
                  </span>

                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 bg-[#FF4655]/20 border border-[#FF4655]/50 font-condensed font-bold text-xs uppercase text-[#FF4655] tracking-wider">
                      {previewDivision}
                    </span>
                    <span className="px-2 py-0.5 bg-white/10 border border-white/20 font-condensed font-bold text-xs uppercase text-white/90 tracking-wider">
                      {generation ? generation : "GENERASI STANDBY"}
                    </span>
                  </div>

                  {/* Badge Status Keanggotaan Otomatis */}
                  <div className="pt-1 flex items-center justify-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 font-condensed font-bold text-[11px] tracking-wider uppercase border ${
                        !generation
                          ? "bg-white/5 border-white/20 text-white/50"
                          : isMemberActive
                          ? "bg-[#00E5FF]/15 border-[#00E5FF]/50 text-[#00E5FF]"
                          : "bg-[#ECE8E1]/15 border-[#ECE8E1]/40 text-[#ECE8E1]"
                      }`}
                    >
                      {memberStatusBadge}
                    </span>
                    <span className="px-2 py-0.5 bg-[#00E5FF]/10 border border-[#00E5FF]/40 font-mono text-[10px] text-[#00E5FF] font-semibold tracking-wider uppercase">
                      {entryFeeAmount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Card HUD: Live Verification Status */}
              <div className="relative z-10 border-t border-white/10 pt-3 space-y-1.5 font-mono text-[10px]">
                <div className="flex items-center justify-between text-white/60">
                  <span>STATUS ANGGOTA:</span>
                  <span
                    className={`font-bold tracking-wider ${
                      !generation
                        ? "text-white/40"
                        : isMemberActive
                        ? "text-[#00E5FF]"
                        : "text-[#ECE8E1]"
                    }`}
                  >
                    {memberStatusBadge}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60">VERIFIKASI:</span>
                  <span className="text-status-ok font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    SIAP DIDAFTARKAN
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ════ KOLOM KANAN: FORMULIR KEHADIRAN ════ */}
          <div className="lg:col-span-7 border border-edge bg-[#14202C] valo-chamfer p-6 sm:p-10 space-y-8 shadow-xl">
            <div className="border-b border-edge/80 pb-4 space-y-1">
              <h3 className="font-display font-bold uppercase text-2xl sm:text-3xl text-white tracking-wide">
                FORMULIR KEHADIRAN
              </h3>
              <p className="font-sans text-xs sm:text-sm text-ink-muted leading-relaxed">
                Isi data berikut untuk mendapatkan E-Ticket resmi. Satu nomor WhatsApp hanya dapat didaftarkan satu kali.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 1. Nama Lengkap */}
              <div className="space-y-2">
                <label
                  htmlFor="fullName"
                  className="block font-condensed font-bold text-xs tracking-[0.16em] text-white uppercase"
                >
                  NAMA LENGKAP <span className="text-[#FF4655]">*</span>
                </label>
                <input
                  id="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Muhammad Fauzan"
                  className="w-full min-h-[44px] px-4 py-2.5 bg-[#0F1923] border border-edge hover:border-edge-strong focus:border-[#FF4655] focus:outline-hidden text-white font-sans text-sm transition-colors placeholder:text-ink-subtle"
                />
                {fieldErrors.fullName && (
                  <p className="font-sans text-xs text-[#FF4655] flex items-center gap-1 mt-1">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    <span>{fieldErrors.fullName[0]}</span>
                  </p>
                )}
              </div>

              {/* 2. Nomor WhatsApp */}
              <div className="space-y-2">
                <label
                  htmlFor="whatsapp"
                  className="block font-condensed font-bold text-xs tracking-[0.16em] text-white uppercase"
                >
                  NOMOR WHATSAPP <span className="text-[#FF4655]">*</span>
                </label>
                <input
                  id="whatsapp"
                  type="tel"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full min-h-[44px] px-4 py-2.5 bg-[#0F1923] border border-edge hover:border-edge-strong focus:border-[#FF4655] focus:outline-hidden text-white font-sans text-sm transition-colors placeholder:text-ink-subtle tabular-nums"
                />
                <p className="font-sans text-[11px] text-ink-muted flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5 text-ink-subtle shrink-0" />
                  <span>
                    Format Indonesia (08... / 628...). Tautan E-Ticket QR akan otomatis dikirimkan ke nomor ini.
                  </span>
                </p>
                {fieldErrors.whatsapp && (
                  <p className="font-sans text-xs text-[#FF4655] flex items-center gap-1 mt-1">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    <span>{fieldErrors.whatsapp[0]}</span>
                  </p>
                )}
              </div>

              {/* 3. Pilihan Divisi */}
              <div className="space-y-2">
                <label className="block font-condensed font-bold text-xs tracking-[0.16em] text-white uppercase">
                  DIVISI SABA EXPLOIT <span className="text-[#FF4655]">*</span>
                </label>
                <div
                  role="radiogroup"
                  aria-label="Pilih Divisi"
                  className="grid grid-cols-2 sm:grid-cols-3 gap-2.5"
                >
                  {DIVISIONS.map((div) => {
                    const isSelected = division === div;
                    return (
                      <motion.button
                        key={div}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        whileTap={{ scale: 0.96 }}
                        transition={{ type: "spring", stiffness: 420, damping: 28 }}
                        onClick={() => setDivision(div)}
                        className={`min-h-[44px] relative px-3 py-2 text-xs font-condensed uppercase tracking-wider border transition-all text-left flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? "text-white font-bold border-brand"
                            : "bg-[#0F1923] border-edge text-ink-muted hover:text-white hover:border-edge-strong"
                        }`}
                      >
                        {isSelected && (
                          <motion.div
                            layoutId="activeDivisionHighlight"
                            className="absolute inset-0 bg-brand -z-0"
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 35,
                            }}
                          />
                        )}
                        <span className="relative z-10 truncate">{div}</span>
                        {isSelected && (
                          <span className="relative z-10 h-1.5 w-1.5 rounded-full bg-white shrink-0 ml-1.5" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
                {fieldErrors.division && (
                  <p className="font-sans text-xs text-[#FF4655] flex items-center gap-1 mt-1">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    <span>{fieldErrors.division[0]}</span>
                  </p>
                )}
              </div>

              {/* 4. Custom Dropdown Generasi Taktis (Tanpa Kata Cohort & Tanpa Teks Alumni/Aktif di Opsi) */}
              <div className="space-y-2" ref={dropdownRef}>
                <label
                  htmlFor="generation-trigger"
                  className="block font-condensed font-bold text-xs tracking-[0.16em] text-white uppercase"
                >
                  GENERASI <span className="text-[#FF4655]">*</span>
                </label>

                <div className="relative">
                  {/* Trigger Button */}
                  <button
                    id="generation-trigger"
                    type="button"
                    aria-haspopup="listbox"
                    aria-expanded={isGenDropdownOpen}
                    onClick={() => setIsGenDropdownOpen((prev) => !prev)}
                    className={`w-full min-h-[44px] px-4 py-2.5 bg-[#0F1923] border text-left flex items-center justify-between transition-colors cursor-pointer ${
                      isGenDropdownOpen
                        ? "border-[#FF4655]"
                        : "border-[#2A3B4C] hover:border-edge-strong"
                    }`}
                  >
                    <span
                      className={`font-condensed font-semibold text-sm tracking-wider uppercase truncate ${
                        generation ? "text-white" : "text-ink-subtle"
                      }`}
                    >
                      {generation ? generation : "PILIH GENERASI ANDA"}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-[#FF4655] shrink-0 transition-transform duration-200 ${
                        isGenDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Panel Dropdown Menu */}
                  <AnimatePresence>
                    {isGenDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        role="listbox"
                        className="absolute z-50 left-0 right-0 top-full mt-1 bg-[#131E2A] border border-[#2A3B4C] shadow-2xl max-h-60 overflow-y-auto divide-y divide-[#2A3B4C]/40"
                      >
                        {PUBLIC_GENERATIONS.map((gen) => {
                          const isSelected = generation === gen;
                          return (
                            <motion.button
                              key={gen}
                              type="button"
                              role="option"
                              aria-selected={isSelected}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                setGeneration(gen);
                                setIsGenDropdownOpen(false);
                              }}
                              className={`w-full min-h-[44px] px-4 py-2.5 text-left flex items-center justify-between transition-colors cursor-pointer font-condensed text-sm tracking-wider uppercase ${
                                isSelected
                                  ? "bg-brand/20 text-[#FF4655] font-bold"
                                  : "text-white/90 hover:bg-[#0F1923] hover:text-white"
                              }`}
                            >
                              <span>{gen}</span>
                              {isSelected && (
                                <Check className="h-4 w-4 text-[#FF4655] shrink-0" />
                              )}
                            </motion.button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {fieldErrors.generation && (
                  <p className="font-sans text-xs text-[#FF4655] flex items-center gap-1 mt-1">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    <span>{fieldErrors.generation[0]}</span>
                  </p>
                )}
              </div>

              {/* 5. Pesan & Harapan untuk Mubes */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="message"
                    className="font-condensed font-bold text-xs tracking-[0.16em] text-white uppercase flex items-center gap-1.5"
                  >
                    <MessageSquare className="h-3.5 w-3.5 text-[#FF4655]" />
                    <span>PESAN & HARAPAN (OPSIONAL)</span>
                  </label>
                  <span className="font-mono text-[11px] text-ink-subtle tabular-nums">
                    {message.length}/300
                  </span>
                </div>
                <textarea
                  id="message"
                  rows={3}
                  maxLength={300}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tuliskan harapan atau kenangan berkesan selama di Saba ExploIT..."
                  className="w-full p-3 bg-[#0F1923] border border-edge hover:border-edge-strong focus:border-[#FF4655] focus:outline-hidden text-white font-sans text-sm leading-relaxed transition-colors placeholder:text-ink-subtle resize-none"
                />
                {fieldErrors.message && (
                  <p className="font-sans text-xs text-[#FF4655] flex items-center gap-1 mt-1">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    <span>{fieldErrors.message[0]}</span>
                  </p>
                )}
              </div>

              {/* 6. Checkbox Anonimitas Pesan */}
              <div className="p-3.5 bg-[#0F1923] border border-edge">
                <label className="min-h-[44px] flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded-none accent-[#FF4655] border-edge cursor-pointer shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="font-condensed font-bold uppercase text-xs sm:text-sm text-white tracking-wide block">
                      KIRIM SEBAGAI ANONIM
                    </span>
                    <span className="font-sans text-xs text-ink-muted leading-relaxed block mt-0.5">
                      Pesan Anda di Wall of Messages akan ditampilkan sebagai{" "}
                      <strong className="text-white">Agent Rahasia</strong>. Identitas Anda tetap tercatat di sistem panitia.
                    </span>
                  </div>
                </label>
              </div>

              {/* Catatan Biaya Kontribusi */}
              <div className="p-3 bg-[#0F1923] border border-[#00E5FF]/30 flex items-start gap-2.5 text-xs text-ink-muted">
                <Ticket className="h-4 w-4 text-[#00E5FF] shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-condensed font-bold text-[#00E5FF] tracking-wider uppercase mr-1">
                    KONTRIBUSI {entryFeeLabel} ({entryFeeAmount}):
                  </span>
                  <span>
                    Biaya dibayarkan saat registrasi di lokasi (sudah termasuk konsumsi dan suvenir resmi).
                  </span>
                </div>
              </div>

              {/* 7. Tombol Submit */}
              <div className="pt-2">
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 420, damping: 28 }}
                  className="riot-btn-frame w-full min-h-[52px] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span className="riot-btn-inner flex items-center justify-center gap-2.5 text-base sm:text-lg">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>MEMPROSES REGISTRASI...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-5 w-5" />
                        <span>KONFIRMASI & AMBIL E-TICKET</span>
                      </>
                    )}
                  </span>
                </motion.button>
                <p className="font-mono text-[11px] text-ink-subtle text-center mt-3">
                  SISTEM ANTI-DUPLIKASI: 1 NOMOR WHATSAPP = 1 TIKET
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
