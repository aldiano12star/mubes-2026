"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Participant } from "@prisma/client";
import { Html5Qrcode, type CameraDevice } from "html5-qrcode";
import {
  Camera,
  CameraOff,
  Search,
  CheckCircle2,
  Utensils,
  Gift,
  X,
  Loader2,
  Shield,
  User,
  AlertCircle,
  ExternalLink,
  SwitchCamera,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "@/components/ui/Toast";
import {
  scanQrCheckInAction,
  toggleParticipantStatusAction,
} from "@/actions/panitia.actions";

interface QrScannerPanelProps {
  participants: Participant[];
  activeParticipant: Participant | null;
  onSelectParticipant: (participant: Participant | null) => void;
}

export function QrScannerPanel({
  participants,
  activeParticipant,
  onSelectParticipant,
}: QrScannerPanelProps) {
  const router = useRouter();

  // State Scanner Kamera
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isInitializingCamera, setIsInitializingCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // State Multi-Kamera
  const [availableCameras, setAvailableCameras] = useState<CameraDevice[]>([]);
  const [selectedCameraIndex, setSelectedCameraIndex] = useState(0);

  // State Input File Cadangan (Kamera Sistem / Foto)
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State Pencarian Manual
  const [searchQuery, setSearchQuery] = useState("");

  // State Loading Toggle Status
  const [loadingField, setLoadingField] = useState<string | null>(null);

  // Ref untuk scanner dan anti double-scan cooldown (3 detik)
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScannedRef = useRef<{ code: string; time: number }>({
    code: "",
    time: 0,
  });

  // ── SENSORIK BEEP AUDIO & GETARAN ──
  const playTacticalBeep = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // AudioContext ditolak peramban
    }

    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(100);
      } catch {
        // Abaikan
      }
    }
  };

  // ── PENCARIAN MANUAL DENGAN USEMEMO ──
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    return participants
      .filter((p) => {
        const matchName = p.fullName.toLowerCase().includes(q);
        const matchCode = p.ticketCode.toLowerCase().includes(q);
        const matchWa = p.whatsapp?.includes(q);
        return matchName || matchCode || matchWa;
      })
      .slice(0, 6);
  }, [participants, searchQuery]);

  // ── HANDLER SCAN SUKSES ──
  const handleScanSuccess = async (decodedText: string) => {
    const raw = decodedText?.trim().toUpperCase();
    if (!raw) return;

    // Cooldown 3 Detik untuk QR yang sama
    const now = Date.now();
    if (
      lastScannedRef.current.code === raw &&
      now - lastScannedRef.current.time < 3000
    ) {
      return;
    }
    lastScannedRef.current = { code: raw, time: now };

    playTacticalBeep();

    try {
      const res = await scanQrCheckInAction(raw);
      if (res.success) {
        toast.success(res.message);
        onSelectParticipant(res.data);
        router.refresh();
      } else {
        toast.error(res.error);
      }
    } catch (err) {
      console.error("[Scanner Scan Error]:", err);
      toast.error("Gagal memproses pemindaian.");
    }
  };

  // ── DETEKSI DAFTAR KAMERA PERANGKAT ──
  const detectCameras = async (): Promise<CameraDevice[]> => {
    try {
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length > 0) {
        setAvailableCameras(devices);
        return devices;
      }
    } catch (err) {
      console.warn("[Detect Cameras Warning]:", err);
    }
    return [];
  };

  // ── START SCANNER KAMERA ──
  const startCamera = async (targetIndex?: number) => {
    setCameraError(null);
    setIsInitializingCamera(true);

    try {
      // Stop scanner aktif sebelumnya bila ada
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            await scannerRef.current.stop();
          }
          await scannerRef.current.clear();
        } catch {
          // Abaikan
        }
      }

      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;

      // Ambil daftar kamera
      const devices =
        availableCameras.length > 0
          ? availableCameras
          : await detectCameras();

      let cameraConfig: string | { facingMode: string } = {
        facingMode: "environment",
      };

      let camIndex = 0;
      if (devices.length > 0) {
        if (typeof targetIndex === "number" && devices[targetIndex]) {
          camIndex = targetIndex;
        } else {
          // Prioritaskan kamera belakang / environment
          const backCamIdx = devices.findIndex((c) =>
            /back|rear|environment|belakang/i.test(c.label)
          );
          camIndex = backCamIdx !== -1 ? backCamIdx : 0;
        }
        setSelectedCameraIndex(camIndex);
        cameraConfig = devices[camIndex].id;
      }

      // qrbox dinamis berdasarkan lebar kontainer
      const qrboxConfig = (viewfinderWidth: number, viewfinderHeight: number) => {
        const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
        const boxSize = Math.min(
          240,
          Math.max(180, Math.floor(minEdge * 0.68))
        );
        return { width: boxSize, height: boxSize };
      };

      await html5QrCode.start(
        cameraConfig,
        {
          fps: 10,
          qrbox: qrboxConfig,
          aspectRatio: 1.0,
        },
        handleScanSuccess,
        () => {
          // Frame tanpa QR
        }
      );

      setIsCameraActive(true);
    } catch (err: unknown) {
      console.error("[Start Camera Error]:", err);
      let errorMsg = "Gagal mengakses kamera.";
      if (err instanceof Error) {
        if (
          err.name === "NotAllowedError" ||
          err.message.includes("Permission")
        ) {
          errorMsg =
            "Izin akses kamera ditolak. Silakan izinkan akses kamera di peramban.";
        } else if (
          err.name === "NotFoundError" ||
          err.message.includes("device")
        ) {
          errorMsg = "Perangkat kamera tidak ditemukan pada HP/komputer ini.";
        }
      }
      setCameraError(errorMsg);
      toast.error(errorMsg);
      setIsCameraActive(false);
    } finally {
      setIsInitializingCamera(false);
    }
  };

  // ── STOP SCANNER KAMERA ──
  const stopCamera = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      } catch (err) {
        console.error("[Stop Camera Error]:", err);
      }
    }
    setIsCameraActive(false);
  };

  // ── GANTI KAMERA (DEPAN / BELAKANG) ──
  const handleSwitchCamera = async () => {
    if (availableCameras.length <= 1 || isInitializingCamera) return;
    const nextIndex = (selectedCameraIndex + 1) % availableCameras.length;
    await stopCamera();
    await startCamera(nextIndex);
  };

  // ── SCAN DARI FOTO / KAMERA SISTEM (CADANGAN TANPA LIVE STREAM) ──
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    try {
      let scanner = scannerRef.current;
      if (!scanner) {
        scanner = new Html5Qrcode("qr-reader");
        scannerRef.current = scanner;
      }

      const decodedText = await scanner.scanFile(file, true);
      if (decodedText) {
        await handleScanSuccess(decodedText);
      }
    } catch (err) {
      console.error("[Scan File Error]:", err);
      toast.error(
        "QR Code tidak terdeteksi pada gambar. Pastikan foto jelas dan memiliki pencahayaan cukup."
      );
    } finally {
      setIsProcessingFile(false);
      if (e.target) {
        e.target.value = "";
      }
    }
  };

  // Cleanup saat unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            scannerRef.current.stop().catch(() => {});
          }
          scannerRef.current.clear();
        } catch {
          // Abaikan
        }
      }
    };
  }, []);

  // ── TOGGLE STATUS KONTROL PESERTA ──
  const handleToggleStatus = async (
    field: "isCheckedIn" | "hasConsumed" | "hasSouvenir"
  ) => {
    if (!activeParticipant) return;
    setLoadingField(field);

    const currentValue = activeParticipant[field];
    const updatedLocally: Participant = {
      ...activeParticipant,
      [field]: !currentValue,
    };
    onSelectParticipant(updatedLocally);

    try {
      const response = await toggleParticipantStatusAction({
        participantId: activeParticipant.id,
        field,
        value: !currentValue,
      });

      if (!response.success) {
        onSelectParticipant(activeParticipant);
        toast.error(response.error);
        return;
      }

      toast.success(response.message);
      onSelectParticipant(response.data);
      router.refresh();
    } catch (err) {
      console.error("[Toggle Status Error]:", err);
      onSelectParticipant(activeParticipant);
      toast.error("Gagal memperbarui status ke server.");
    } finally {
      setLoadingField(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── 1. PENCARIAN MANUAL CEPAT (JALUR DARURAT) ── */}
      <div className="border border-zinc-800 bg-zinc-900/90 rounded-xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <label
            htmlFor="manualSearch"
            className="text-xs font-medium text-zinc-300 flex items-center gap-1.5"
          >
            <Search className="h-4 w-4 text-zinc-400" />
            <span>Pencarian Cepat Meja Registrasi</span>
          </label>
          <span className="font-mono text-xs text-zinc-500">
            Nama / Kode Tiket
          </span>
        </div>

        <div className="relative">
          <input
            id="manualSearch"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ketik nama peserta atau nomor tiket (contoh: 014 / Raka)..."
            className="w-full min-h-[44px] pl-4 pr-10 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg hover:border-zinc-700 focus:border-rose-500 focus:outline-hidden text-zinc-100 text-sm transition-colors placeholder:text-zinc-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-zinc-400 hover:text-zinc-100 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Hasil Pencarian Dropdown Cepat */}
        {searchResults.length > 0 && (
          <div className="border border-zinc-800 bg-zinc-950 rounded-lg divide-y divide-zinc-800/80 max-h-56 overflow-y-auto">
            {searchResults.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectParticipant(item);
                  setSearchQuery("");
                }}
                className="w-full min-h-[44px] p-3 text-left flex items-center justify-between gap-3 hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-rose-400">
                      {item.ticketCode}
                    </span>
                    <span className="font-semibold text-sm text-zinc-100 truncate">
                      {item.fullName}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1 flex flex-row items-center gap-2 whitespace-nowrap truncate text-xs text-zinc-400 mt-0.5">
                    <span>{item.generation}</span>
                    <span className="text-zinc-600">•</span>
                    <span className="truncate">{item.division}</span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {item.isCheckedIn ? (
                    <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded text-xs font-medium">
                      Hadir
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-zinc-900 text-zinc-400 border border-zinc-800 rounded text-xs">
                      Belum Hadir
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── 2. MODUL SCANNER KAMERA ── */}
        <div className="lg:col-span-6 border border-zinc-800 bg-zinc-900/90 rounded-xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-zinc-300" />
              <h2 className="font-semibold text-base text-zinc-100">
                Pemindai QR Kamera HP
              </h2>
            </div>

            {isCameraActive ? (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/15 px-2.5 py-1 rounded-md border border-emerald-500/30">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Kamera Aktif</span>
              </span>
            ) : (
              <span className="text-xs text-zinc-400 bg-zinc-950 px-2.5 py-1 rounded-md border border-zinc-800">
                Standby
              </span>
            )}
          </div>

          {/* Kotak Bidik Scanner (Kontainer #qr-reader SELALU ada di DOM) */}
          <div className="relative w-full max-w-sm mx-auto aspect-square rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 flex flex-col items-center justify-center">
            {/* Target Kontainer HTML5 QR Code SELALU terpasang di DOM */}
            <div
              id="qr-reader"
              className="w-full h-full min-h-[280px]"
            />

            {/* Overlay Standby saat kamera belum diaktifkan */}
            {!isCameraActive && !isInitializingCamera && (
              <div className="absolute inset-0 z-10 bg-zinc-950/95 flex flex-col items-center justify-center p-6 text-center space-y-3">
                <Camera className="h-10 w-10 text-zinc-600 mx-auto" />
                <p className="text-xs text-zinc-400 leading-relaxed max-w-xs">
                  Tekan tombol di bawah untuk mengaktifkan kamera scanner atau pilih opsi foto.
                </p>
              </div>
            )}

            {/* Overlay Loading saat inisialisasi kamera */}
            {isInitializingCamera && (
              <div className="absolute inset-0 z-20 bg-zinc-950/90 flex flex-col items-center justify-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
                <span className="text-xs text-zinc-300">
                  Menghubungkan kamera...
                </span>
              </div>
            )}

            {/* Overlay Loading saat memproses file foto */}
            {isProcessingFile && (
              <div className="absolute inset-0 z-20 bg-zinc-950/90 flex flex-col items-center justify-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-[#00E5FF]" />
                <span className="text-xs text-zinc-300">
                  Memindai QR Code dari foto...
                </span>
              </div>
            )}
          </div>

          {cameraError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-400 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{cameraError}</span>
            </div>
          )}

          {/* Tombol Kontrol Kamera & Cadangan Foto */}
          <div className="space-y-2.5 pt-1">
            {!isCameraActive ? (
              <button
                type="button"
                onClick={() => startCamera()}
                disabled={isInitializingCamera || isProcessingFile}
                className="w-full min-h-[44px] py-2.5 px-4 bg-rose-600 hover:bg-rose-500 disabled:bg-rose-600/50 text-white font-medium text-sm rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Camera className="h-4 w-4 shrink-0" />
                <span>Aktifkan Kamera Scanner</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {availableCameras.length > 1 && (
                  <button
                    type="button"
                    onClick={handleSwitchCamera}
                    disabled={isInitializingCamera}
                    className="min-h-[44px] py-2.5 px-3 border border-zinc-800 hover:border-zinc-700 bg-zinc-950 hover:bg-zinc-800 text-zinc-200 font-medium text-xs sm:text-sm rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <SwitchCamera className="h-4 w-4 shrink-0" />
                    <span>Ganti Kamera</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={stopCamera}
                  className={`min-h-[44px] py-2.5 px-3 border border-zinc-800 hover:border-zinc-700 bg-zinc-950 hover:bg-zinc-800 text-zinc-200 font-medium text-xs sm:text-sm rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                    availableCameras.length <= 1 ? "col-span-2" : ""
                  }`}
                >
                  <CameraOff className="h-4 w-4 shrink-0" />
                  <span>Hentikan Kamera</span>
                </button>
              </div>
            )}

            {/* Input Tersembunyi untuk Pemindaian dari Galeri / Kamera Bawaan HP */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileUpload}
            />

            {/* Tombol Cadangan Scan dari Foto / Kamera Sistem */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessingFile}
              className="w-full min-h-[44px] py-2.5 px-4 border border-zinc-800 hover:border-zinc-700 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 font-medium text-xs sm:text-sm rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <ImageIcon className="h-4 w-4 shrink-0" />
              <span>Scan dari Foto / Kamera Sistem</span>
            </button>
          </div>
        </div>

        {/* ── 3. DETAIL & KONTROL PESERTA (1-SCAN MULTI-ACTION) ── */}
        <div className="lg:col-span-6 border border-zinc-800 bg-zinc-900/90 rounded-xl p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-zinc-300" />
              <h2 className="font-semibold text-base text-zinc-100">
                Detail & Kontrol Peserta
              </h2>
            </div>

            {activeParticipant && (
              <button
                type="button"
                onClick={() => onSelectParticipant(null)}
                className="text-zinc-400 hover:text-zinc-100 text-xs flex items-center gap-1 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
                <span>Tutup</span>
              </button>
            )}
          </div>

          {activeParticipant ? (
            <div className="space-y-5">
              {/* Identitas Peserta Terpilih */}
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-rose-400 font-bold">
                    {activeParticipant.ticketCode}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {activeParticipant.isOnTheSpot && (
                      <span className="px-2 py-0.5 bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded text-[10px] font-bold uppercase">
                        OTS
                      </span>
                    )}
                    <Link
                      href={`/tiket/${activeParticipant.ticketCode}`}
                      target="_blank"
                      className="text-zinc-400 hover:text-zinc-100 p-1"
                      title="Buka pratinjau E-Ticket"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>

                <div className="font-semibold text-xl text-zinc-100">
                  {activeParticipant.fullName}
                </div>

                {/* Metadata Anti-Flex-Wrap Law */}
                <div className="min-w-0 flex-1 flex flex-row items-center gap-2 whitespace-nowrap truncate text-xs text-zinc-400">
                  <span className="text-zinc-200 font-medium">
                    {activeParticipant.generation}
                  </span>
                  <span className="text-zinc-600">•</span>
                  <span className="truncate">{activeParticipant.division}</span>
                  {activeParticipant.whatsapp && (
                    <>
                      <span className="text-zinc-600">•</span>
                      <span className="font-mono tabular-nums text-zinc-400">
                        +{activeParticipant.whatsapp}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* 3 Tombol Sentuh Besar (Multi-Action Toggle) */}
              <div className="space-y-2.5">
                <span className="text-xs font-medium text-zinc-400 uppercase block">
                  Status Operasional Peserta (Klik untuk Mengubah)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* 1. Tombol HADIR */}
                  <button
                    type="button"
                    disabled={loadingField !== null}
                    onClick={() => handleToggleStatus("isCheckedIn")}
                    className={`min-h-[48px] p-3 border rounded-lg transition-all flex flex-col items-center justify-center gap-1 cursor-pointer disabled:opacity-50 ${
                      activeParticipant.isCheckedIn
                        ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 font-semibold"
                        : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span className="text-xs uppercase font-medium">
                        Hadir
                      </span>
                    </div>
                    <span className="text-[10px]">
                      {activeParticipant.isCheckedIn ? "Tercatat" : "Belum"}
                    </span>
                  </button>

                  {/* 2. Tombol KONSUMSI */}
                  <button
                    type="button"
                    disabled={loadingField !== null}
                    onClick={() => handleToggleStatus("hasConsumed")}
                    className={`min-h-[48px] p-3 border rounded-lg transition-all flex flex-col items-center justify-center gap-1 cursor-pointer disabled:opacity-50 ${
                      activeParticipant.hasConsumed
                        ? "bg-amber-500/15 border-amber-500/30 text-amber-400 font-semibold"
                        : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Utensils className="h-4 w-4 shrink-0" />
                      <span className="text-xs uppercase font-medium">
                        Konsumsi
                      </span>
                    </div>
                    <span className="text-[10px]">
                      {activeParticipant.hasConsumed ? "Diserahkan" : "Belum"}
                    </span>
                  </button>

                  {/* 3. Tombol SUVENIR */}
                  <button
                    type="button"
                    disabled={loadingField !== null}
                    onClick={() => handleToggleStatus("hasSouvenir")}
                    className={`min-h-[48px] p-3 border rounded-lg transition-all flex flex-col items-center justify-center gap-1 cursor-pointer disabled:opacity-50 ${
                      activeParticipant.hasSouvenir
                        ? "bg-sky-500/15 border-sky-500/30 text-sky-400 font-semibold"
                        : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Gift className="h-4 w-4 shrink-0" />
                      <span className="text-xs uppercase font-medium">
                        Suvenir
                      </span>
                    </div>
                    <span className="text-[10px]">
                      {activeParticipant.hasSouvenir ? "Diserahkan" : "Belum"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Log Waktu Operasional */}
              <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-mono text-zinc-400 space-y-1">
                <div className="flex justify-between">
                  <span>Check-In:</span>
                  <span className="text-zinc-200">
                    {activeParticipant.checkedInAt
                      ? new Date(activeParticipant.checkedInAt).toLocaleTimeString("id-ID")
                      : "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Konsumsi:</span>
                  <span className="text-zinc-200">
                    {activeParticipant.consumedAt
                      ? new Date(activeParticipant.consumedAt).toLocaleTimeString("id-ID")
                      : "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Suvenir:</span>
                  <span className="text-zinc-200">
                    {activeParticipant.souvenirAt
                      ? new Date(activeParticipant.souvenirAt).toLocaleTimeString("id-ID")
                      : "-"}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center space-y-3 bg-zinc-950/60 border border-dashed border-zinc-800 rounded-lg">
              <User className="h-10 w-10 text-zinc-600 mx-auto" />
              <p className="font-medium text-sm text-zinc-200">
                Belum Ada Peserta Dipilih
              </p>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
                Pindai QR Code via kamera di samping atau gunakan kolom pencarian di atas untuk membuka kartu kontrol peserta.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
