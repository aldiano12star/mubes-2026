"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import type { Participant } from "@prisma/client";
import { UserPlus, Loader2, AlertCircle, Info } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { toast } from "@/components/ui/Toast";
import { createOnTheSpotAction } from "@/actions/panitia.actions";
import {
  DIVISIONS,
  ALL_GENERATIONS,
  GENERATION_LABELS,
  type Division,
  type Generation,
} from "@/lib/constants";

interface OnTheSpotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (participant: Participant) => void;
}

export function OnTheSpotModal({
  isOpen,
  onClose,
  onCreated,
}: OnTheSpotModalProps) {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [division, setDivision] = useState<Division | "">("");
  const [generation, setGeneration] = useState<Generation | "">("");
  const [whatsapp, setWhatsapp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetForm = () => {
    setFullName("");
    setDivision("");
    setGeneration("");
    setWhatsapp("");
    setErrorMessage(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!division) {
      const msg = "Silakan pilih salah satu divisi peserta.";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    if (!generation) {
      const msg = "Silakan pilih generasi peserta.";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await createOnTheSpotAction({
        fullName,
        division,
        generation,
        whatsapp,
      });

      if (!response.success) {
        setErrorMessage(response.error);
        toast.error(response.error);
        setIsSubmitting(false);
        return;
      }

      toast.success(response.message);
      onCreated(response.data);
      handleClose();
      router.refresh();
    } catch (err) {
      console.error("[OTS Modal Error]:", err);
      const msg = "Terjadi kesalahan saat memproses pendaftaran OTS.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        <div className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-rose-500" />
          <span className="font-semibold text-lg text-zinc-100">
            Registrasi On-The-Spot (OTS)
          </span>
        </div>
      }
      description="Pendaftaran cepat tamu di meja registrasi hari-H. Peserta OTS otomatis berstatus Hadir."
      className="md:max-w-xl bg-zinc-900 border border-zinc-800 text-zinc-100"
    >
      <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[75vh]">
        {errorMessage && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-400 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1. Nama Lengkap */}
        <div className="space-y-1.5">
          <label
            htmlFor="otsFullName"
            className="block text-xs font-medium text-zinc-300"
          >
            Nama Lengkap <span className="text-rose-500">*</span>
          </label>
          <input
            id="otsFullName"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nama lengkap atau nama panggilan resmi"
            className="w-full min-h-[44px] px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg hover:border-zinc-700 focus:border-rose-500 focus:outline-hidden text-zinc-100 text-sm transition-colors placeholder:text-zinc-500"
          />
        </div>

        {/* 2. Pilihan Divisi */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-zinc-300">
            Divisi <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {DIVISIONS.map((div) => {
              const isSelected = division === div;
              return (
                <button
                  key={div}
                  type="button"
                  onClick={() => setDivision(div)}
                  className={`min-h-[44px] px-3 py-2 text-xs rounded-lg border transition-all text-left flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? "bg-rose-600 text-white border-rose-600 font-medium shadow-xs"
                      : "bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700"
                  }`}
                >
                  <span className="truncate">{div}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Pilihan Generasi */}
        <div className="space-y-1.5">
          <label
            htmlFor="otsGen"
            className="block text-xs font-medium text-zinc-300"
          >
            Generasi <span className="text-rose-500">*</span>
          </label>
          <select
            id="otsGen"
            value={generation}
            onChange={(e) => setGeneration(e.target.value as Generation)}
            className="w-full min-h-[44px] px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg hover:border-zinc-700 focus:border-rose-500 focus:outline-hidden text-zinc-100 text-sm transition-colors cursor-pointer"
          >
            <option value="" disabled>
              -- Pilih Generasi --
            </option>
            {ALL_GENERATIONS.map((gen: Generation) => (
              <option key={gen} value={gen}>
                {gen} ({GENERATION_LABELS[gen] || "Alumni"})
              </option>
            ))}
          </select>
        </div>

        {/* 4. Nomor WhatsApp */}
        <div className="space-y-1.5">
          <label
            htmlFor="otsWhatsapp"
            className="block text-xs font-medium text-zinc-300"
          >
            Nomor WhatsApp (Opsional)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-sm text-zinc-500">
              +62
            </span>
            <input
              id="otsWhatsapp"
              type="tel"
              value={whatsapp}
              onChange={(e) => {
                const cleaned = e.target.value.replace(/\D/g, "");
                setWhatsapp(cleaned);
              }}
              placeholder="81234567890"
              className="w-full min-h-[44px] pl-14 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg hover:border-zinc-700 focus:border-rose-500 focus:outline-hidden text-zinc-100 font-mono text-sm transition-colors placeholder:text-zinc-600"
            />
          </div>
          <span className="text-[11px] text-zinc-500 block">
            Format: awalan 8xx tanpa angka 0 atau 62 di depan.
          </span>
        </div>

        {/* Informasi Otomatisasi */}
        <div className="p-3 bg-zinc-950/70 border border-zinc-800 rounded-lg text-xs text-zinc-400 flex items-start gap-2.5">
          <Info className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>
            Peserta yang didaftarkan melalui form OTS ini akan langsung tercatat sebagai <strong>Hadir (Checked-In)</strong> pada sistem.
          </span>
        </div>

        {/* Tombol Aksi */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
          <button
            type="button"
            onClick={handleClose}
            className="min-h-[44px] px-4 py-2 border border-zinc-800 hover:border-zinc-700 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="min-h-[44px] px-5 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:bg-rose-600/50 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed shadow-xs"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                <span>Mendaftarkan OTS...</span>
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 shrink-0" />
                <span>Daftarkan & Check-In Sekarang</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
