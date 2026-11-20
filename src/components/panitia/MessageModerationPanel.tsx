"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Participant } from "@prisma/client";
import {
  MessageSquare,
  Search,
  Eye,
  EyeOff,
  CheckCircle2,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "@/components/ui/Toast";
import { toggleMessageVisibilityAction } from "@/actions/panitia.actions";

interface MessageModerationPanelProps {
  participants: Participant[];
}

type VisibilityFilter = "all" | "visible" | "hidden";

export function MessageModerationPanel({
  participants,
}: MessageModerationPanelProps) {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [visibilityFilter, setVisibilityFilter] =
    useState<VisibilityFilter>("all");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // ── HUKUM DERIVED STATE: Filter pesan via useMemo ──
  const messageParticipants = useMemo(() => {
    return participants
      .filter((p) => p.message && p.message.trim().length > 0)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [participants]);

  const filteredMessages = useMemo(() => {
    return messageParticipants.filter((p) => {
      // Filter teks pencarian (Nama atau Isi Pesan)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = p.fullName.toLowerCase().includes(q);
        const matchMsg = p.message?.toLowerCase().includes(q);
        if (!matchName && !matchMsg) return false;
      }

      // Filter status visibilitas
      if (visibilityFilter === "visible" && p.isMessageHidden) return false;
      if (visibilityFilter === "hidden" && !p.isMessageHidden) return false;

      return true;
    });
  }, [messageParticipants, searchQuery, visibilityFilter]);

  const handleToggleVisibility = async (participantId: string) => {
    setTogglingId(participantId);

    try {
      const response = await toggleMessageVisibilityAction(participantId);

      if (!response.success) {
        toast.error(response.error);
        return;
      }

      toast.success(response.message);
      router.refresh();
    } catch (err) {
      console.error("[Message Visibility Error]:", err);
      toast.error("Gagal mengubah status visibilitas pesan.");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── HEADER MODERASI & FILTER ── */}
      <div className="border border-zinc-800 bg-zinc-900/90 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-zinc-300" />
            <h2 className="font-semibold text-base sm:text-lg text-zinc-100">
              Moderasi Transmisi Pesan ({filteredMessages.length} dari {messageParticipants.length})
            </h2>
          </div>
          <span className="font-mono text-xs text-zinc-400 bg-zinc-950 px-3 py-1 rounded-md border border-zinc-800 self-start sm:self-auto">
            Wall of Messages Control
          </span>
        </div>

        {/* Input Pencarian & Filter Dropdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 pt-2 border-t border-zinc-800/80">
          <div className="lg:col-span-8 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama pengirim atau kata dalam pesan..."
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

          <div className="lg:col-span-4">
            <select
              value={visibilityFilter}
              onChange={(e) =>
                setVisibilityFilter(e.target.value as VisibilityFilter)
              }
              className="w-full min-h-[44px] px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg hover:border-zinc-700 focus:border-rose-500 focus:outline-hidden text-zinc-200 text-xs transition-colors cursor-pointer"
            >
              <option value="all">Semua Status Visibilitas</option>
              <option value="visible">Tampil di Publik</option>
              <option value="hidden">Disembunyikan Panitia</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── DAFTAR KARTU PESAN DENGAN AKSI MODERASI ── */}
      {filteredMessages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMessages.map((p) => {
            const isToggling = togglingId === p.id;

            return (
              <div
                key={p.id}
                className={`border rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-4 transition-colors ${
                  p.isMessageHidden
                    ? "bg-zinc-950/60 border-zinc-800/60 opacity-80"
                    : "bg-zinc-900/90 border-zinc-800"
                }`}
              >
                {/* Header Pesan: Identitas Pengirim & Badge Anonim */}
                <div className="space-y-1.5 border-b border-zinc-800/80 pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="font-mono text-xs text-rose-400 font-bold shrink-0">
                        {p.ticketCode}
                      </span>
                      <span className="font-semibold text-base text-zinc-100 truncate">
                        {p.fullName}
                      </span>
                    </div>

                    {p.isAnonymous && (
                      <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded text-[10px] font-medium shrink-0">
                        Anonim di Publik
                      </span>
                    )}
                  </div>

                  {/* Metadata Anti-Flex-Wrap Law */}
                  <div className="min-w-0 flex-1 flex flex-row items-center gap-1.5 whitespace-nowrap truncate text-xs text-zinc-400">
                    <span className="text-zinc-200 font-medium">{p.generation}</span>
                    <span className="text-zinc-600">•</span>
                    <span className="truncate">{p.division}</span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-zinc-500 font-mono tabular-nums">
                      {new Intl.DateTimeFormat("id-ID", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      }).format(new Date(p.createdAt))}
                    </span>
                  </div>
                </div>

                {/* Konten Pesan */}
                <div className="flex-1 py-1">
                  <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed italic bg-zinc-950 p-3 rounded-lg border border-zinc-800/80">
                    &ldquo;{p.message}&rdquo;
                  </p>
                </div>

                {/* Footer Pesan: Status & Tombol Sembunyikan/Tampilkan */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-zinc-800/80">
                  <div className="flex items-center gap-1.5 text-xs">
                    {!p.isMessageHidden ? (
                      <span className="text-emerald-400 flex items-center gap-1.5 font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                        <span>Tampil di Publik</span>
                      </span>
                    ) : (
                      <span className="text-zinc-500 flex items-center gap-1.5">
                        <EyeOff className="h-3.5 w-3.5 shrink-0" />
                        <span>Disembunyikan</span>
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={isToggling}
                    onClick={() => handleToggleVisibility(p.id)}
                    className={`min-h-[44px] px-3.5 py-2 border rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 ${
                      !p.isMessageHidden
                        ? "bg-zinc-950 hover:bg-rose-500/10 border-zinc-800 hover:border-rose-500/30 text-zinc-300 hover:text-rose-400"
                        : "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                    }`}
                  >
                    {isToggling ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
                        <span>Memproses...</span>
                      </>
                    ) : !p.isMessageHidden ? (
                      <>
                        <EyeOff className="h-3.5 w-3.5 shrink-0" />
                        <span>Sembunyikan dari Publik</span>
                      </>
                    ) : (
                      <>
                        <Eye className="h-3.5 w-3.5 shrink-0" />
                        <span>Tampilkan di Publik</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 text-center text-zinc-500 text-xs border border-zinc-800 bg-zinc-900/90 rounded-xl">
          Tidak ada pesan yang cocok dengan filter moderasi.
        </div>
      )}
    </div>
  );
}
