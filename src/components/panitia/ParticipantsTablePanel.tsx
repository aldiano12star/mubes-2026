"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Participant } from "@prisma/client";
import {
  Users,
  Search,
  UserPlus,
  CheckCircle2,
  Utensils,
  Gift,
  ExternalLink,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "@/components/ui/Toast";
import { toggleParticipantStatusAction } from "@/actions/panitia.actions";
import { ALL_GENERATIONS, type Generation } from "@/lib/constants";

interface ParticipantsTablePanelProps {
  participants: Participant[];
  onOpenOtsModal: () => void;
  onSelectForControl?: (participant: Participant) => void;
}

type StatusFilter = "all" | "checkedIn" | "notCheckedIn" | "ots";

export function ParticipantsTablePanel({
  participants,
  onOpenOtsModal,
  onSelectForControl,
}: ParticipantsTablePanelProps) {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [genFilter, setGenFilter] = useState<string>("all");
  const [loadingRowId, setLoadingRowId] = useState<string | null>(null);

  // ── HUKUM DERIVED STATE: Filter murni dihitung melalui useMemo ──
  const filteredParticipants = useMemo(() => {
    return participants.filter((p) => {
      // Filter teks pencarian (Nama / Kode Tiket / WhatsApp)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = p.fullName.toLowerCase().includes(q);
        const matchCode = p.ticketCode.toLowerCase().includes(q);
        const matchWa = p.whatsapp?.includes(q);
        if (!matchName && !matchCode && !matchWa) return false;
      }

      // Filter status kehadiran / OTS
      if (statusFilter === "checkedIn" && !p.isCheckedIn) return false;
      if (statusFilter === "notCheckedIn" && p.isCheckedIn) return false;
      if (statusFilter === "ots" && !p.isOnTheSpot) return false;

      // Filter generasi
      if (genFilter !== "all" && p.generation !== genFilter) return false;

      return true;
    });
  }, [participants, searchQuery, statusFilter, genFilter]);

  // Handler toggle status cepat langsung dari baris tabel
  const handleToggle = async (
    participantId: string,
    field: "isCheckedIn" | "hasConsumed" | "hasSouvenir",
    currentValue: boolean
  ) => {
    setLoadingRowId(`${participantId}-${field}`);

    try {
      const response = await toggleParticipantStatusAction({
        participantId,
        field,
        value: !currentValue,
      });

      if (!response.success) {
        toast.error(response.error);
        return;
      }

      toast.success(response.message);
      router.refresh();
    } catch (err) {
      console.error("[Table Toggle Error]:", err);
      toast.error("Gagal memperbarui status.");
    } finally {
      setLoadingRowId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── HEADER FILTER & AKSI UTAMA ── */}
      <div className="border border-zinc-800 bg-zinc-900/90 rounded-xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-zinc-300" />
            <h2 className="font-semibold text-base sm:text-lg text-zinc-100">
              Daftar Peserta ({filteredParticipants.length} dari {participants.length})
            </h2>
          </div>

          {/* Tombol Utama: + Daftar On-The-Spot (OTS) */}
          <button
            type="button"
            onClick={onOpenOtsModal}
            className="min-h-[44px] px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs self-start md:self-auto"
          >
            <UserPlus className="h-4 w-4 shrink-0" />
            <span>+ Daftar On-The-Spot (OTS)</span>
          </button>
        </div>

        {/* Baris Filter Multi-Kriteria */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 pt-2 border-t border-zinc-800/80">
          {/* 1. Pencarian Input */}
          <div className="lg:col-span-5 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, kode tiket (014), atau WhatsApp..."
              className="w-full min-h-[44px] pl-4 pr-10 py-2 bg-zinc-950 border border-zinc-800 rounded-lg hover:border-zinc-700 focus:border-rose-500 focus:outline-hidden text-zinc-100 text-xs transition-colors placeholder:text-zinc-500"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-100 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : (
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
            )}
          </div>

          {/* 2. Filter Status Kehadiran */}
          <div className="lg:col-span-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="w-full min-h-[44px] px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg hover:border-zinc-700 focus:border-rose-500 focus:outline-hidden text-zinc-200 text-xs transition-colors cursor-pointer"
            >
              <option value="all">Semua Status Kehadiran</option>
              <option value="checkedIn">Sudah Hadir</option>
              <option value="notCheckedIn">Belum Hadir</option>
              <option value="ots">Tamu OTS Saja</option>
            </select>
          </div>

          {/* 3. Filter Generasi */}
          <div className="lg:col-span-3">
            <select
              value={genFilter}
              onChange={(e) => setGenFilter(e.target.value)}
              className="w-full min-h-[44px] px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg hover:border-zinc-700 focus:border-rose-500 focus:outline-hidden text-zinc-200 text-xs transition-colors cursor-pointer"
            >
              <option value="all">Semua Generasi</option>
              {ALL_GENERATIONS.map((gen: Generation) => (
                <option key={gen} value={gen}>
                  {gen}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── TABEL DATA PESERTA RESPONSIF ── */}
      <div className="border border-zinc-800 bg-zinc-900/90 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950/80 text-zinc-400 font-medium">
                <th className="py-3.5 px-4 font-mono">Kode</th>
                <th className="py-3.5 px-4">Nama Lengkap</th>
                <th className="py-3.5 px-4">Generasi / Divisi</th>
                <th className="py-3.5 px-4">WhatsApp</th>
                <th className="py-3.5 px-4 text-center">Status Hadir</th>
                <th className="py-3.5 px-4 text-center">Konsumsi</th>
                <th className="py-3.5 px-4 text-center">Suvenir</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredParticipants.length > 0 ? (
                filteredParticipants.map((p) => {
                  const isLoadingHadir =
                    loadingRowId === `${p.id}-isCheckedIn`;
                  const isLoadingKonsumsi =
                    loadingRowId === `${p.id}-hasConsumed`;
                  const isLoadingSuvenir =
                    loadingRowId === `${p.id}-hasSouvenir`;

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-zinc-800/40 transition-colors"
                    >
                      {/* Kode Tiket */}
                      <td className="py-3 px-4 font-mono font-bold text-rose-400 whitespace-nowrap">
                        {p.ticketCode}
                      </td>

                      {/* Nama & Tag OTS */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-zinc-100">
                            {p.fullName}
                          </span>
                          {p.isOnTheSpot && (
                            <span className="px-1.5 py-0.5 bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded text-[9px] font-bold uppercase">
                              OTS
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Generasi & Divisi */}
                      <td className="py-3 px-4 whitespace-nowrap text-zinc-300">
                        <span className="font-medium text-zinc-100">
                          {p.generation}
                        </span>{" "}
                        <span className="text-zinc-600">•</span>{" "}
                        <span>{p.division}</span>
                      </td>

                      {/* WhatsApp */}
                      <td className="py-3 px-4 font-mono text-zinc-400 whitespace-nowrap">
                        {p.whatsapp ? `+${p.whatsapp}` : "-"}
                      </td>

                      {/* Toggle Hadir */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          disabled={isLoadingHadir}
                          onClick={() =>
                            handleToggle(p.id, "isCheckedIn", p.isCheckedIn)
                          }
                          className={`min-h-[36px] px-3 py-1 rounded text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 ${
                            p.isCheckedIn
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                              : "bg-zinc-950 text-zinc-400 border border-zinc-800 hover:border-zinc-700"
                          }`}
                        >
                          {isLoadingHadir ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          )}
                          <span>{p.isCheckedIn ? "Hadir" : "Belum"}</span>
                        </button>
                      </td>

                      {/* Toggle Konsumsi */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          disabled={isLoadingKonsumsi}
                          onClick={() =>
                            handleToggle(p.id, "hasConsumed", p.hasConsumed)
                          }
                          className={`min-h-[36px] px-3 py-1 rounded text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 ${
                            p.hasConsumed
                              ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                              : "bg-zinc-950 text-zinc-400 border border-zinc-800 hover:border-zinc-700"
                          }`}
                        >
                          {isLoadingKonsumsi ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Utensils className="h-3.5 w-3.5" />
                          )}
                          <span>{p.hasConsumed ? "Sudah" : "Belum"}</span>
                        </button>
                      </td>

                      {/* Toggle Suvenir */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          disabled={isLoadingSuvenir}
                          onClick={() =>
                            handleToggle(p.id, "hasSouvenir", p.hasSouvenir)
                          }
                          className={`min-h-[36px] px-3 py-1 rounded text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 ${
                            p.hasSouvenir
                              ? "bg-sky-500/15 text-sky-400 border border-sky-500/30"
                              : "bg-zinc-950 text-zinc-400 border border-zinc-800 hover:border-zinc-700"
                          }`}
                        >
                          {isLoadingSuvenir ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Gift className="h-3.5 w-3.5" />
                          )}
                          <span>{p.hasSouvenir ? "Sudah" : "Belum"}</span>
                        </button>
                      </td>

                      {/* Aksi */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {onSelectForControl && (
                            <button
                              type="button"
                              onClick={() => onSelectForControl(p)}
                              className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded text-xs transition-colors cursor-pointer"
                              title="Buka panel kontrol scanner untuk peserta ini"
                            >
                              Kontrol
                            </button>
                          )}
                          <Link
                            href={`/tiket/${p.ticketCode}`}
                            target="_blank"
                            className="p-1.5 text-zinc-400 hover:text-zinc-100 transition-colors"
                            title="Buka pratinjau E-Ticket"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="py-8 px-4 text-center text-zinc-500 font-mono text-xs"
                  >
                    Tidak ada peserta yang cocok dengan kriteria pencarian / filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
