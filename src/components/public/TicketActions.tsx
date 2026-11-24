"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  Download,
  Copy,
  Check,
  Send,
  Loader2,
  Clock,
  ArrowLeft,
} from "lucide-react";
import { toast } from "@/components/ui/Toast";
import { resendTicketWhatsappAction } from "@/actions/registration.actions";

interface TicketActionsProps {
  ticketCode: string;
  hasWhatsapp: boolean;
}

export function TicketActions({ ticketCode, hasWhatsapp }: TicketActionsProps) {
  const [copied, setCopied] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const handleCopyLink = async () => {
    try {
      if (typeof window !== "undefined") {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        toast.success("Tautan E-Ticket berhasil disalin ke clipboard!");
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      toast.error("Gagal menyalin tautan. Silakan salin URL dari bilah peramban.");
    }
  };

  const handleResendWhatsapp = async () => {
    if (cooldown > 0 || isResending) return;

    setIsResending(true);
    try {
      const response = await resendTicketWhatsappAction(ticketCode);

      if (response.success) {
        toast.success(response.message);
        setCooldown(60);
      } else {
        toast.error(response.error);
        const match = response.error.match(/(\d+)\s*detik/i);
        if (match && match[1]) {
          const seconds = parseInt(match[1], 10);
          if (!isNaN(seconds) && seconds > 0) {
            setCooldown(seconds);
          }
        }
      }
    } catch (err) {
      console.error("[Resend Ticket Error]:", err);
      toast.error("Gagal menghubungi server. Silakan coba beberapa saat lagi.");
    } finally {
      setIsResending(false);
    }
  };

  const downloadUrl = `/api/ticket-image/${ticketCode}?download=1`;
  const downloadFileName = `E-Ticket-${ticketCode}.png`;

  return (
    <div className="space-y-6 pt-2">
      {/* Tombol-tombol Aksi Utama */}
      <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3">
        {/* 1. Tombol Unduh E-Ticket (Aksi Primer) */}
        <motion.a
          href={downloadUrl}
          download={downloadFileName}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 420, damping: 28 }}
          className="w-full sm:w-auto min-h-[44px] px-6 py-3 valo-chamfer bg-brand hover:bg-brand-hover text-brand-ink font-display font-bold text-sm tracking-widest uppercase inline-flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
        >
          <Download className="h-4 w-4 shrink-0" />
          <span>UNDUH E-TICKET</span>
        </motion.a>

        {/* 2. Tombol Salin Tautan Tiket */}
        <motion.button
          type="button"
          onClick={handleCopyLink}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 420, damping: 28 }}
          className="w-full sm:w-auto min-h-[44px] px-5 py-3 border border-edge hover:border-edge-strong bg-card hover:bg-card-elevated text-ink font-mono text-xs uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-status-ok shrink-0" />
              <span>TAUTAN TERSALIN</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 text-ink-muted shrink-0" />
              <span>SALIN TAUTAN TIKET</span>
            </>
          )}
        </motion.button>

        {/* 3. Tombol Kirim Ulang ke WhatsApp */}
        {hasWhatsapp && (
          <motion.button
            type="button"
            disabled={cooldown > 0 || isResending}
            onClick={handleResendWhatsapp}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 420, damping: 28 }}
            className="w-full sm:w-auto min-h-[44px] px-5 py-3 border border-edge hover:border-edge-strong bg-card hover:bg-card-elevated disabled:opacity-50 disabled:cursor-not-allowed text-ink font-mono text-xs uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {isResending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin shrink-0 text-brand" />
                <span>MENGIRIMKAN...</span>
              </>
            ) : cooldown > 0 ? (
              <>
                <Clock className="h-4 w-4 text-status-warn shrink-0" />
                <span className="tabular-nums">
                  KIRIM ULANG ({cooldown}S)
                </span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4 text-brand shrink-0" />
                <span>KIRIM ULANG KE WHATSAPP</span>
              </>
            )}
          </motion.button>
        )}
      </div>

      {/* Navigasi Kembali ke Beranda */}
      <div className="flex justify-center pt-2">
        <Link
          href="/"
          className="min-h-[44px] px-4 py-2 inline-flex items-center gap-2 font-mono text-xs tracking-wider text-ink-muted hover:text-ink transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
          <span>KEMBALI KE HALAMAN UTAMA</span>
        </Link>
      </div>
    </div>
  );
}
