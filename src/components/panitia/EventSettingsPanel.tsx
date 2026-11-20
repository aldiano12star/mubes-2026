"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import type { EventSettings } from "@prisma/client";
import {
  Settings,
  Calendar,
  Clock,
  MapPin,
  MessageSquare,
  Plus,
  Trash2,
  Save,
  Loader2,
  Lock,
  Unlock,
  AlertCircle,
  Ticket,
} from "lucide-react";
import { toast } from "@/components/ui/Toast";
import { updateEventSettingsAction } from "@/actions/panitia.actions";
import { EVENT_DEFAULTS } from "@/lib/constants";
import type { RundownItem } from "@/lib/validations";

interface EventSettingsPanelProps {
  initialSettings: EventSettings | null;
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

export function EventSettingsPanel({
  initialSettings,
}: EventSettingsPanelProps) {
  const router = useRouter();

  // Inisialisasi state form dari database atau default SSOT
  const [eventTitle, setEventTitle] = useState(
    initialSettings?.eventTitle ?? EVENT_DEFAULTS.eventTitle
  );
  const [eventSubtitle, setEventSubtitle] = useState(
    initialSettings?.eventSubtitle ?? EVENT_DEFAULTS.eventSubtitle
  );
  const [eventDateDisplay, setEventDateDisplay] = useState(
    initialSettings?.eventDateDisplay ?? EVENT_DEFAULTS.eventDateDisplay
  );
  const [eventTimeDisplay, setEventTimeDisplay] = useState(
    initialSettings?.eventTimeDisplay ?? EVENT_DEFAULTS.eventTimeDisplay
  );
  const [eventDateIso, setEventDateIso] = useState(
    initialSettings?.eventDateIso ?? EVENT_DEFAULTS.eventDateIso
  );
  const [eventLocation, setEventLocation] = useState(
    initialSettings?.eventLocation ?? EVENT_DEFAULTS.eventLocation
  );
  const [entryFeeLabel, setEntryFeeLabel] = useState(
    initialSettings?.entryFeeLabel ?? EVENT_DEFAULTS.entryFeeLabel
  );
  const [entryFeeAmount, setEntryFeeAmount] = useState(
    initialSettings?.entryFeeAmount ?? EVENT_DEFAULTS.entryFeeAmount
  );
  const [entryFeeNote, setEntryFeeNote] = useState(
    initialSettings?.entryFeeNote ?? EVENT_DEFAULTS.entryFeeNote
  );
  const [contactName, setContactName] = useState(
    initialSettings?.contactName ?? EVENT_DEFAULTS.contactName
  );
  const [contactWhatsapp, setContactWhatsapp] = useState(
    initialSettings?.contactWhatsapp ?? EVENT_DEFAULTS.contactWhatsapp
  );
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(
    initialSettings?.isRegistrationOpen ?? true
  );

  // Inisialisasi daftar rundown acara
  const parsedRundown: RundownItem[] = Array.isArray(initialSettings?.rundownJson)
    ? (initialSettings.rundownJson as unknown as RundownItem[])
    : DEFAULT_RUNDOWN;

  const [rundown, setRundown] = useState<RundownItem[]>(parsedRundown);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Manipulasi item rundown
  const handleAddRundown = () => {
    setRundown((prev) => [
      ...prev,
      { time: "00.00 – 00.00 WIB", title: "Sesi Baru", description: "" },
    ]);
  };

  const handleUpdateRundown = (
    index: number,
    field: keyof RundownItem,
    value: string
  ) => {
    setRundown((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveRundown = (index: number) => {
    if (rundown.length <= 1) {
      toast.error("Susunan acara minimal harus memiliki 1 sesi.");
      return;
    }
    setRundown((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSaving(true);

    try {
      const response = await updateEventSettingsAction({
        eventTitle,
        eventSubtitle,
        eventDateIso,
        eventDateDisplay,
        eventTimeDisplay,
        eventLocation,
        entryFeeLabel,
        entryFeeAmount,
        entryFeeNote,
        contactName,
        contactWhatsapp,
        isRegistrationOpen,
        rundown,
      });

      if (!response.success) {
        setErrorMessage(response.error);
        toast.error(response.error);
        setIsSaving(false);
        return;
      }

      toast.success(response.message);
      router.refresh();
    } catch (err) {
      console.error("[Update Settings Error]:", err);
      const msg = "Terjadi kegagalan jaringan saat menyimpan pengaturan.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="border border-zinc-800 bg-zinc-900/90 rounded-xl p-5 sm:p-6 space-y-6">
      {/* Header Panel */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2.5">
          <Settings className="h-5 w-5 text-zinc-300" />
          <h2 className="font-semibold text-base sm:text-lg text-zinc-100">
            Pengaturan Acara & Informasi Mubes
          </h2>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-400 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── BAGIAN 1: STATUS PENDAFTARAN & JUDUL ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Status Pendaftaran Online */}
          <div className="md:col-span-2 p-4 bg-zinc-950 border border-zinc-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="font-medium text-sm text-zinc-100 flex items-center gap-2">
                {isRegistrationOpen ? (
                  <Unlock className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Lock className="h-4 w-4 text-rose-400" />
                )}
                <span>Portal Pendaftaran Publik</span>
              </span>
              <p className="text-xs text-zinc-400">
                {isRegistrationOpen
                  ? "Formulir pendaftaran dan RSVP di halaman publik sedang DIBUKA untuk umum."
                  : "Formulir pendaftaran di halaman publik DITUTUP. Hanya panitia yang dapat mendaftarkan tamu via OTS."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsRegistrationOpen(!isRegistrationOpen)}
              className={`min-h-[44px] px-4 py-2 border rounded-lg text-xs font-medium transition-colors cursor-pointer self-start sm:self-auto ${
                isRegistrationOpen
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                  : "bg-rose-500/15 border-rose-500/30 text-rose-400 hover:bg-rose-500/20"
              }`}
            >
              {isRegistrationOpen ? "STATUS: DIBUKA" : "STATUS: DITUTUP"}
            </button>
          </div>

          {/* Judul Utama */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-300">
              Judul Utama Acara
            </label>
            <input
              type="text"
              required
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              className="w-full min-h-[44px] px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg hover:border-zinc-700 focus:border-rose-500 focus:outline-hidden text-zinc-100 text-xs transition-colors"
            />
          </div>

          {/* Subjudul / Tema */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-300">
              Subjudul / Tema Acara
            </label>
            <input
              type="text"
              required
              value={eventSubtitle}
              onChange={(e) => setEventSubtitle(e.target.value)}
              className="w-full min-h-[44px] px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg hover:border-zinc-700 focus:border-rose-500 focus:outline-hidden text-zinc-100 text-xs transition-colors"
            />
          </div>
        </div>

        {/* ── BAGIAN 2: JADWAL & LOKASI ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-300 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-zinc-400" />
              <span>Teks Tampilan Tanggal</span>
            </label>
            <input
              type="text"
              required
              value={eventDateDisplay}
              onChange={(e) => setEventDateDisplay(e.target.value)}
              placeholder="Selasa, 29 Desember 2026"
              className="w-full min-h-[44px] px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg hover:border-zinc-700 focus:border-rose-500 focus:outline-hidden text-zinc-100 text-xs transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-300 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-zinc-400" />
              <span>Teks Tampilan Jam</span>
            </label>
            <input
              type="text"
              required
              value={eventTimeDisplay}
              onChange={(e) => setEventTimeDisplay(e.target.value)}
              placeholder="09.00 WIB – Selesai"
              className="w-full min-h-[44px] px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg hover:border-zinc-700 focus:border-rose-500 focus:outline-hidden text-zinc-100 text-xs transition-colors"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2 md:col-span-1">
            <label className="block text-xs font-medium text-zinc-300">
              Waktu ISO (Target Countdown)
            </label>
            <input
              type="text"
              required
              value={eventDateIso}
              onChange={(e) => setEventDateIso(e.target.value)}
              placeholder="2026-12-29T09:00:00+07:00"
              className="w-full min-h-[44px] px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg hover:border-zinc-700 focus:border-rose-500 focus:outline-hidden text-zinc-100 font-mono text-xs transition-colors"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2 md:col-span-3">
            <label className="block text-xs font-medium text-zinc-300 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-zinc-400" />
              <span>Lokasi Acara</span>
            </label>
            <input
              type="text"
              required
              value={eventLocation}
              onChange={(e) => setEventLocation(e.target.value)}
              placeholder="SMA Negeri 1 Bantul (Ruang Yudistira)"
              className="w-full min-h-[44px] px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg hover:border-zinc-700 focus:border-rose-500 focus:outline-hidden text-zinc-100 text-xs transition-colors"
            />
          </div>
        </div>

        {/* ── BAGIAN 3: BIAYA KONTRIBUSI / HTM (RADIANT PASS) ── */}
        <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
            <Ticket className="h-4 w-4 text-rose-500" />
            <span className="font-semibold text-xs text-zinc-200 uppercase">
              Informasi Biaya Kontribusi Peserta (HTM)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-300">
                Label Biaya (Tiket Pass)
              </label>
              <input
                type="text"
                required
                value={entryFeeLabel}
                onChange={(e) => setEntryFeeLabel(e.target.value)}
                placeholder="RADIANT PASS"
                className="w-full min-h-[44px] px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 focus:border-rose-500 focus:outline-hidden text-zinc-100 text-xs transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-300">
                Nominal Biaya
              </label>
              <input
                type="text"
                required
                value={entryFeeAmount}
                onChange={(e) => setEntryFeeAmount(e.target.value)}
                placeholder="Rp 20.000"
                className="w-full min-h-[44px] px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 focus:border-rose-500 focus:outline-hidden text-zinc-100 text-xs transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-300">
                Catatan Fasilitas HTM
              </label>
              <input
                type="text"
                required
                value={entryFeeNote}
                onChange={(e) => setEntryFeeNote(e.target.value)}
                placeholder="HTM Peserta • Termasuk Konsumsi & Merchandise"
                className="w-full min-h-[44px] px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 focus:border-rose-500 focus:outline-hidden text-zinc-100 text-xs transition-colors"
              />
            </div>
          </div>
        </div>

        {/* ── BAGIAN 4: KONTAK HUMAS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-300 flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-zinc-400" />
              <span>Nama Narahubung Humas</span>
            </label>
            <input
              type="text"
              required
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Contoh: Raka (Humas Mubes)"
              className="w-full min-h-[44px] px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg hover:border-zinc-700 focus:border-rose-500 focus:outline-hidden text-zinc-100 text-xs transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-300">
              WhatsApp Narahubung (Format: 628xx)
            </label>
            <input
              type="text"
              required
              value={contactWhatsapp}
              onChange={(e) => setContactWhatsapp(e.target.value)}
              placeholder="6281234567890"
              className="w-full min-h-[44px] px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg hover:border-zinc-700 focus:border-rose-500 focus:outline-hidden text-zinc-100 font-mono text-xs transition-colors"
            />
          </div>
        </div>

        {/* ── BAGIAN 5: SUSUNAN ACARA (RUNDOWN) ── */}
        <div className="space-y-4 pt-4 border-t border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold text-sm text-zinc-200">
                Susunan Acara (Rundown)
              </span>
              <p className="text-xs text-zinc-400">
                Daftar sesi yang tampil pada tabel briefing di halaman publik.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddRundown}
              className="min-h-[44px] px-3.5 py-2 border border-zinc-800 hover:border-zinc-700 bg-zinc-950 hover:bg-zinc-800 text-zinc-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Sesi</span>
            </button>
          </div>

          <div className="space-y-3">
            {rundown.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-lg space-y-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono font-bold text-xs text-rose-400">
                    Sesi #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveRundown(idx)}
                    className="p-1.5 text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Hapus sesi ini"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-zinc-400">
                      Waktu Pelaksanaan
                    </label>
                    <input
                      type="text"
                      required
                      value={item.time}
                      onChange={(e) =>
                        handleUpdateRundown(idx, "time", e.target.value)
                      }
                      placeholder="09.00 – 09.30 WIB"
                      className="w-full min-h-[40px] px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-md text-zinc-100 text-xs focus:border-rose-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[11px] text-zinc-400">
                      Nama Sesi Acara
                    </label>
                    <input
                      type="text"
                      required
                      value={item.title}
                      onChange={(e) =>
                        handleUpdateRundown(idx, "title", e.target.value)
                      }
                      placeholder="Contoh: Registrasi & Tactical Check-In"
                      className="w-full min-h-[40px] px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-md text-zinc-100 text-xs focus:border-rose-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="sm:col-span-3 space-y-1">
                    <label className="text-[11px] text-zinc-400">
                      Deskripsi Ringkas
                    </label>
                    <textarea
                      rows={2}
                      value={item.description}
                      onChange={(e) =>
                        handleUpdateRundown(idx, "description", e.target.value)
                      }
                      placeholder="Deskripsi kegiatan sesi ini..."
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-zinc-100 text-xs focus:border-rose-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tombol Simpan Perubahan */}
        <div className="pt-4 border-t border-zinc-800 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="min-h-[44px] px-6 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:bg-rose-600/50 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed shadow-xs"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                <span>Menyimpan Pengaturan...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4 shrink-0" />
                <span>Simpan Seluruh Pengaturan</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
