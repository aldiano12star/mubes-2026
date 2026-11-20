"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Shield, Radio, Sparkles } from "lucide-react";

export interface PublicMessageItem {
  id: string;
  fullName: string;
  division: string;
  generation: string;
  message: string | null;
  isAnonymous: boolean;
  createdAt: string | Date;
}

interface WallOfMessagesProps {
  messages: PublicMessageItem[];
}

export function WallOfMessages({ messages }: WallOfMessagesProps) {
  const [selectedGen, setSelectedGen] = useState<string>("Semua");

  // Periksa apakah ada pesan dari alumni generasi 1 sampai 13
  const hasSeniorAlumni = useMemo(() => {
    return messages.some((m) => {
      const match = m.generation.match(/\d+/);
      if (!match) return false;
      const num = parseInt(match[0], 10);
      return num >= 1 && num <= 13;
    });
  }, [messages]);

  const filterTabs = useMemo(() => {
    const defaultTabs = [
      "Semua",
      "Gen 21",
      "Gen 18",
      "Gen 17",
      "Gen 16",
      "Gen 15",
      "Gen 14",
    ];
    if (hasSeniorAlumni) {
      defaultTabs.push("Alumni Senior (Gen 1–13)");
    }
    return defaultTabs;
  }, [hasSeniorAlumni]);

  // Derived state murni tanpa duplikasi ke useState terpisah (Hukum Derived State)
  // Perlindungan Anonimitas Total: Pesan dengan isAnonymous === true HANYA muncul di tab "Semua",
  // agar identitas generasi pengirim tidak bocor melalui filter tab spesifik.
  const filteredMessages = useMemo(() => {
    if (selectedGen === "Semua") {
      return messages;
    }
    if (selectedGen === "Alumni Senior (Gen 1–13)") {
      return messages.filter((item) => {
        if (item.isAnonymous) return false;
        const match = item.generation.match(/\d+/);
        if (!match) return false;
        const num = parseInt(match[0], 10);
        return num >= 1 && num <= 13;
      });
    }
    return messages.filter(
      (item) => !item.isAnonymous && item.generation === selectedGen
    );
  }, [messages, selectedGen]);

  const formatDate = (dateInput: string | Date) => {
    try {
      const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
      return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(d);
    } catch {
      return "";
    }
  };

  return (
    <section
      id="messages-section"
      className="relative bg-[#111A24] text-white py-16 sm:py-24 scroll-mt-20 border-t border-edge/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Editorial Section Header */}
        <div className="flex items-center gap-3">
          <span className="w-8 h-[2px] bg-[#FF4655]" />
          <span className="font-condensed font-bold text-xs tracking-[0.22em] text-[#FF4655] uppercase">
            CROSS-GEN TACTICAL COMMS • WALL OF MESSAGES
          </span>
          <span className="h-px flex-1 bg-edge/60" />
        </div>

        <div className="border border-edge bg-[#14202C]/90 p-6 sm:p-10 valo-chamfer space-y-8 shadow-2xl">
          {/* Header Seksi */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-edge/80 pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Radio className="h-5 w-5 text-brand" />
                <h2 className="font-display font-bold uppercase text-2xl sm:text-3xl text-white tracking-wide">
                  TRANSMISI PESAN & NOSTALGIA
                </h2>
              </div>
              <p className="font-sans text-xs sm:text-sm text-ink-muted">
                Pesan dan harapan dari rekan-rekan anggota aktif serta alumni Saba ExploIT lintas generasi.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-xs text-ink-subtle bg-[#0F1923] px-3.5 py-2 border border-edge">
              <span>TOTAL TRANSMISI:</span>
              <span className="text-brand font-bold tabular-nums">
                {messages.length}
              </span>
            </div>
          </div>

          {/* Tab Filter Generasi */}
          <div className="space-y-2">
            <span className="font-condensed font-bold text-[11px] tracking-[0.2em] text-ink-subtle uppercase block">
              FILTER GENERASI PESAN
            </span>
            <div
              role="tablist"
              aria-label="Filter Wall of Messages"
              className="flex flex-wrap items-center gap-2"
            >
              {filterTabs.map((tab) => {
                const isActive = selectedGen === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setSelectedGen(tab)}
                    className={`min-h-[44px] px-4 py-2 text-xs font-condensed uppercase tracking-wider valo-chamfer-sm border transition-colors cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? "bg-brand text-white border-brand font-bold shadow-xs"
                        : "bg-[#0F1923] border-edge text-ink-muted hover:text-white hover:border-edge-strong"
                    }`}
                  >
                    <span>{tab}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Daftar Pesan Grid dengan Framer Motion Layout Animation */}
          {filteredMessages.length > 0 ? (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              <AnimatePresence mode="popLayout">
                {filteredMessages.map((item) => {
                  const displayName = item.isAnonymous
                    ? "AGENT RAHASIA"
                    : item.fullName;
                  const isGen21 = item.generation === "Gen 21";

                  return (
                    <motion.div
                      layout
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25 }}
                      className={`border border-edge bg-[#0F1923]/90 p-5 flex flex-col justify-between space-y-4 hover:border-edge-strong transition-colors ${
                        item.isAnonymous
                          ? "border-l-4 border-l-[#00E5FF]"
                          : isGen21
                          ? "border-l-4 border-l-[#FF4655]"
                          : "border-l-4 border-l-[#ECE8E1]"
                      }`}
                    >
                      {/* Bagian Atas: Metadata Identitas (Anti-Flex-Wrap Protection) */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2 border-b border-edge/60 pb-2.5">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              {item.isAnonymous ? (
                                <Shield className="h-4 w-4 text-[#00E5FF] shrink-0" />
                              ) : (
                                <span className={`h-2 w-2 rounded-full shrink-0 ${isGen21 ? "bg-[#FF4655]" : "bg-[#ECE8E1]"}`} />
                              )}
                              <span className="font-condensed font-bold uppercase text-sm sm:text-base text-white tracking-wide truncate block">
                                {displayName}
                              </span>
                            </div>
                          </div>
                          <span className="font-mono text-[10px] text-ink-subtle shrink-0 tabular-nums">
                            {formatDate(item.createdAt)}
                          </span>
                        </div>

                        {/* Baris Metadata Horizontal (Anti-Flex-Wrap Law & Anonimitas Total) */}
                        {item.isAnonymous ? (
                          <div className="min-w-0 flex-1 flex flex-row items-center gap-2 whitespace-nowrap truncate font-mono text-[11px] text-[#00E5FF]">
                            <span className="font-semibold uppercase tracking-wider">
                              IDENTITAS DIRAHASIAKAN
                            </span>
                            <span className="text-ink-subtle">•</span>
                            <span className="text-ink-subtle tracking-widest">
                              CLASSIFIED
                            </span>
                          </div>
                        ) : (
                          <div className="min-w-0 flex-1 flex flex-row items-center gap-2 whitespace-nowrap truncate font-mono text-[11px] text-ink-muted">
                            <span className={`font-semibold shrink-0 ${isGen21 ? "text-brand" : "text-[#ECE8E1]"}`}>
                              {item.generation}
                            </span>
                            <span className="text-ink-subtle shrink-0">•</span>
                            <span className="truncate">{item.division}</span>
                          </div>
                        )}
                      </div>

                      {/* Isi Pesan */}
                      <div className="flex-1">
                        <p className="font-sans text-xs sm:text-sm text-ink-muted leading-relaxed italic">
                          &ldquo;{item.message}&rdquo;
                        </p>
                      </div>

                      {/* Footer Kartu Pesan */}
                      <div className="border-t border-edge/40 pt-2 flex items-center justify-between font-mono text-[10px] text-ink-subtle">
                        <span>BROADCAST VERIFIED</span>
                        <MessageSquare className="h-3 w-3 text-ink-subtle" />
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="border border-edge/70 bg-[#0F1923]/60 p-8 text-center space-y-3">
              <div className="flex justify-center">
                <Sparkles className="h-8 w-8 text-ink-subtle" />
              </div>
              <h3 className="font-display font-bold uppercase text-base text-white tracking-wide">
                BELUM ADA TRANSMISI PESAN
              </h3>
              <p className="font-sans text-xs text-ink-muted max-w-md mx-auto leading-relaxed">
                Belum ada pesan yang disiarkan untuk filter{" "}
                <strong className="text-brand">{selectedGen}</strong>. Jadilah yang pertama mengirimkan pesan & harapan melalui formulir di atas!
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
