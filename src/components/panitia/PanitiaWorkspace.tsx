"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Participant, EventSettings } from "@prisma/client";
import {
  QrCode,
  Users,
  MessageSquare,
  Settings,
  FileSpreadsheet,
  LogOut,
  CheckCircle2,
  Utensils,
  Gift,
  RefreshCw,
} from "lucide-react";
import { toast } from "@/components/ui/Toast";
import { logoutPanitiaAction } from "@/actions/auth.actions";
import { ALL_GENERATIONS, type Generation } from "@/lib/constants";
import { QrScannerPanel } from "@/components/panitia/QrScannerPanel";
import { ParticipantsTablePanel } from "@/components/panitia/ParticipantsTablePanel";
import { MessageModerationPanel } from "@/components/panitia/MessageModerationPanel";
import { EventSettingsPanel } from "@/components/panitia/EventSettingsPanel";
import { OnTheSpotModal } from "@/components/panitia/OnTheSpotModal";

interface PanitiaWorkspaceProps {
  initialParticipants: Participant[];
  initialSettings: EventSettings | null;
  panitiaUsername: string;
}

type WorkspaceTab = "scanner" | "participants" | "messages" | "settings";

export function PanitiaWorkspace({
  initialParticipants,
  initialSettings,
  panitiaUsername,
}: PanitiaWorkspaceProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("scanner");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOtsModalOpen, setIsOtsModalOpen] = useState(false);
  const [activeControlParticipant, setActiveControlParticipant] =
    useState<Participant | null>(null);

  // Sinkronisasi data lokal saat server me-refresh initialParticipants
  const [participants, setParticipants] = useState<Participant[]>(initialParticipants);
  useEffect(() => {
    setParticipants(initialParticipants);
  }, [initialParticipants]);

  // Sinkronisasi activeControlParticipant jika ada update dari server
  useEffect(() => {
    if (activeControlParticipant) {
      const updated = participants.find(
        (p) => p.id === activeControlParticipant.id
      );
      if (updated) {
        setActiveControlParticipant(updated);
      }
    }
  }, [participants, activeControlParticipant]);

  // ── HUKUM DERIVED STATE: Seluruh KPI dan Rekap dihitung langsung via useMemo ──
  const stats = useMemo(() => {
    const total = participants.length;
    const online = participants.filter((p) => !p.isOnTheSpot).length;
    const ots = participants.filter((p) => p.isOnTheSpot).length;
    const checkedIn = participants.filter((p) => p.isCheckedIn).length;
    const checkedInPercent =
      total > 0 ? Math.round((checkedIn / total) * 100) : 0;
    const consumed = participants.filter((p) => p.hasConsumed).length;
    const souvenir = participants.filter((p) => p.hasSouvenir).length;

    // Rekapitulasi per Generasi
    const defaultGens = ["Gen 21", "Gen 18", "Gen 17", "Gen 16", "Gen 15", "Gen 14"];
    const genBreakdown = ALL_GENERATIONS.map((gen: Generation) => {
      const cohort = participants.filter((p) => p.generation === gen);
      const registered = cohort.length;
      const attended = cohort.filter((p) => p.isCheckedIn).length;
      return {
        gen,
        registered,
        attended,
      };
    }).filter(
      (item) => defaultGens.includes(item.gen) || item.registered > 0
    );

    return {
      total,
      online,
      ots,
      checkedIn,
      checkedInPercent,
      consumed,
      souvenir,
      genBreakdown,
    };
  }, [participants]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Data peserta berhasil disinkronkan.");
    }, 600);
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logoutPanitiaAction();
    } catch {
      setIsLoggingOut(false);
    }
  };

  const handleOtsCreated = (newParticipant: Participant) => {
    setParticipants((prev) => [
      newParticipant,
      ...prev.filter((p) => p.id !== newParticipant.id),
    ]);
    setActiveControlParticipant(newParticipant);
    setActiveTab("scanner");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 font-sans pb-12">
      {/* ── TOP HEADER ADMIN BAR ── */}
      <header className="sticky top-0 z-30 w-full border-b border-zinc-800 bg-zinc-900/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Identitas Kiri: Logo + Title */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative h-9 w-9 shrink-0">
              <Image
                src="/images/logo-saba-exploit.png"
                alt="Logo Saba ExploIT"
                fill
                sizes="36px"
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-base sm:text-lg text-zinc-100 leading-none truncate">
                Panel Panitia Mubes 2026
              </span>
              <span className="text-xs text-zinc-400 mt-1 truncate">
                Ruang Kerja Operasional • Hari-H
              </span>
            </div>
          </div>

          {/* Sisi Kanan: Status Akun, Export CSV, Logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Indikator Akun Multi-Device */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 border border-zinc-800 bg-zinc-950 rounded-lg text-xs text-zinc-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="truncate">
                Operator: <strong className="text-zinc-100">{panitiaUsername}</strong>
              </span>
            </div>

            {/* Tombol Refresh Data */}
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="min-h-[44px] px-3.5 py-2 border border-zinc-800 hover:border-zinc-700 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-xs font-medium text-zinc-200 inline-flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              title="Sinkronkan data peserta terbaru dari server"
            >
              <RefreshCw
                className={`h-4 w-4 text-zinc-400 ${
                  isRefreshing ? "animate-spin text-rose-500" : ""
                }`}
              />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>

            {/* Tombol Export CSV */}
            <a
              href="/api/export"
              download="Rekap-Mubes-Saba-Exploit-2026.csv"
              className="min-h-[44px] px-3.5 py-2 border border-zinc-800 hover:border-zinc-700 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-xs font-medium text-zinc-200 inline-flex items-center gap-2 transition-colors cursor-pointer"
              title="Unduh Rekapitulasi Peserta Lengkap (CSV UTF-8 BOM)"
            >
              <FileSpreadsheet className="h-4 w-4 text-rose-500 shrink-0" />
              <span className="hidden sm:inline">Export CSV</span>
            </a>

            {/* Tombol Logout */}
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="min-h-[44px] px-3.5 py-2 border border-zinc-800 hover:border-rose-500/30 bg-zinc-900 hover:bg-rose-500/10 rounded-lg text-xs font-medium text-zinc-400 hover:text-rose-400 inline-flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              title="Keluar dari sesi panitia"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── KONTEN UTAMA WORKSPACE ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-page-enter">
        {/* ── KPI BAR REAL-TIME (4 STAT CARDS) ── */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium tracking-wide text-zinc-400 uppercase">
              Metrik Operasional Real-Time
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* 1. Total Terdaftar */}
            <div className="p-4 sm:p-5 border border-zinc-800 bg-zinc-900/90 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-medium uppercase">
                  Total Terdaftar
                </span>
                <Users className="h-4 w-4 text-zinc-400" />
              </div>
              <div className="font-mono font-bold text-3xl sm:text-4xl text-zinc-100 tabular-nums leading-none">
                {stats.total}
              </div>
              <div className="min-w-0 flex-1 flex flex-row items-center gap-2 whitespace-nowrap truncate text-xs text-zinc-400 pt-1">
                <span>Online: <strong className="text-zinc-200">{stats.online}</strong></span>
                <span className="text-zinc-600">•</span>
                <span>OTS: <strong className="text-amber-400">{stats.ots}</strong></span>
              </div>
            </div>

            {/* 2. Sudah Hadir */}
            <div className="p-4 sm:p-5 border border-zinc-800 bg-zinc-900/90 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-medium uppercase">
                  Sudah Hadir
                </span>
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="font-mono font-bold text-3xl sm:text-4xl text-emerald-400 tabular-nums leading-none">
                {stats.checkedIn}
              </div>
              <div className="text-xs text-zinc-400 pt-1 truncate">
                <span className="text-emerald-400 font-semibold font-mono">
                  {stats.checkedInPercent}%
                </span>{" "}
                Kehadiran Lapangan
              </div>
            </div>

            {/* 3. Konsumsi Terambil */}
            <div className="p-4 sm:p-5 border border-zinc-800 bg-zinc-900/90 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-medium uppercase">
                  Konsumsi Terambil
                </span>
                <Utensils className="h-4 w-4 text-amber-400" />
              </div>
              <div className="font-mono font-bold text-3xl sm:text-4xl text-amber-400 tabular-nums leading-none">
                {stats.consumed}
              </div>
              <div className="text-xs text-zinc-400 pt-1 truncate">
                Dari {stats.checkedIn} Peserta Hadir
              </div>
            </div>

            {/* 4. Suvenir Terambil */}
            <div className="p-4 sm:p-5 border border-zinc-800 bg-zinc-900/90 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-medium uppercase">
                  Suvenir Terambil
                </span>
                <Gift className="h-4 w-4 text-sky-400" />
              </div>
              <div className="font-mono font-bold text-3xl sm:text-4xl text-sky-400 tabular-nums leading-none">
                {stats.souvenir}
              </div>
              <div className="text-xs text-zinc-400 pt-1 truncate">
                Paket Telah Diserahkan
              </div>
            </div>
          </div>

          {/* ── REKAPITULASI PER GENERASI ── */}
          <div className="border border-zinc-800 bg-zinc-900/60 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium tracking-wide text-zinc-400 uppercase">
                Distribusi Kehadiran per Generasi
              </span>
              <span className="font-mono text-xs text-zinc-500">
                Format: Hadir / Terdaftar
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
              {stats.genBreakdown.map((item) => {
                const isAllAttended =
                  item.registered > 0 && item.attended === item.registered;

                return (
                  <div
                    key={item.gen}
                    className="p-2.5 bg-zinc-950 border border-zinc-800/90 rounded-lg flex flex-col justify-between space-y-1.5"
                  >
                    <div className="min-w-0 flex-1 flex flex-row items-center justify-between gap-1 whitespace-nowrap truncate">
                      <span className="font-semibold text-xs text-zinc-200 truncate">
                        {item.gen}
                      </span>
                      {isAllAttended && (
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                      )}
                    </div>
                    <div className="font-mono text-xs font-semibold text-zinc-100 tabular-nums">
                      <span
                        className={
                          item.attended > 0
                            ? "text-emerald-400"
                            : "text-zinc-500"
                        }
                      >
                        {item.attended}
                      </span>
                      <span className="text-zinc-500 font-normal">
                        {" "}/ {item.registered}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── 4 TAB NAVIGASI INTERNAL WORKSPACE ── */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 border-b border-zinc-800 overflow-x-auto pb-3">
            <button
              type="button"
              onClick={() => setActiveTab("scanner")}
              className={`min-h-[44px] px-4 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-2 cursor-pointer shrink-0 ${
                activeTab === "scanner"
                  ? "bg-rose-600/15 text-rose-400 border border-rose-500/30 font-semibold"
                  : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
              }`}
            >
              <QrCode className="h-4 w-4 shrink-0" />
              <span>1. Scanner QR & Check-In</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("participants")}
              className={`min-h-[44px] px-4 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-2 cursor-pointer shrink-0 ${
                activeTab === "participants"
                  ? "bg-rose-600/15 text-rose-400 border border-rose-500/30 font-semibold"
                  : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
              }`}
            >
              <Users className="h-4 w-4 shrink-0" />
              <span>2. Daftar Peserta & OTS</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("messages")}
              className={`min-h-[44px] px-4 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-2 cursor-pointer shrink-0 ${
                activeTab === "messages"
                  ? "bg-rose-600/15 text-rose-400 border border-rose-500/30 font-semibold"
                  : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
              }`}
            >
              <MessageSquare className="h-4 w-4 shrink-0" />
              <span>3. Moderasi Pesan</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("settings")}
              className={`min-h-[44px] px-4 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-2 cursor-pointer shrink-0 ${
                activeTab === "settings"
                  ? "bg-rose-600/15 text-rose-400 border border-rose-500/30 font-semibold"
                  : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
              }`}
            >
              <Settings className="h-4 w-4 shrink-0" />
              <span>4. Pengaturan Acara</span>
            </button>
          </div>

          {/* ── KONTEN TAB AKTIF ── */}
          <div>
            {/* PANEL 1: SCANNER QR & CHECK-IN */}
            {activeTab === "scanner" && (
              <QrScannerPanel
                participants={participants}
                activeParticipant={activeControlParticipant}
                onSelectParticipant={setActiveControlParticipant}
              />
            )}

            {/* PANEL 2: DAFTAR PESERTA & OTS */}
            {activeTab === "participants" && (
              <ParticipantsTablePanel
                participants={participants}
                onOpenOtsModal={() => setIsOtsModalOpen(true)}
                onSelectForControl={(p) => {
                  setActiveControlParticipant(p);
                  setActiveTab("scanner");
                }}
              />
            )}

            {/* PANEL 3: MODERASI PESAN */}
            {activeTab === "messages" && (
              <MessageModerationPanel participants={participants} />
            )}

            {/* PANEL 4: PENGATURAN ACARA */}
            {activeTab === "settings" && (
              <EventSettingsPanel initialSettings={initialSettings} />
            )}
          </div>
        </section>
      </main>

      {/* ── MODAL ON-THE-SPOT (OTS) TER-PORTAL ── */}
      <OnTheSpotModal
        isOpen={isOtsModalOpen}
        onClose={() => setIsOtsModalOpen(false)}
        onCreated={handleOtsCreated}
      />
    </div>
  );
}
