"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "@/components/ui/Toast";
import { loginPanitiaAction } from "@/actions/auth.actions";

export function PanitiaLoginForm() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const response = await loginPanitiaAction({
        username,
        password,
      });

      if (!response.success) {
        setErrorMessage(response.error);
        toast.error(response.error);
        setIsLoading(false);
        return;
      }

      toast.success(response.message);
      router.push("/panitia/dashboard");
      router.refresh();
    } catch (err) {
      console.error("[Login Form Error]:", err);
      const msg = "Terjadi kegagalan jaringan saat otentikasi. Silakan coba lagi.";
      setErrorMessage(msg);
      toast.error(msg);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Kartu Formulir Login Modern SaaS Admin */}
        <div className="border border-zinc-800 bg-zinc-900/90 rounded-xl p-6 sm:p-8 space-y-6 shadow-xl backdrop-blur-sm">
          {/* Header Identitas */}
          <div className="flex items-center gap-3.5 border-b border-zinc-800 pb-5">
            <div className="relative h-11 w-11 shrink-0">
              <Image
                src="/images/logo-saba-exploit.png"
                alt="Logo Saba ExploIT"
                fill
                sizes="44px"
                className="object-contain"
                priority
              />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="font-semibold text-lg text-zinc-100 truncate">
                Panel Panitia Mubes 2026
              </h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                Saba ExploIT • 1 Akun Multi-Device
              </p>
            </div>
          </div>

          {/* Banner Peringatan Error Inline */}
          {errorMessage && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-start gap-2.5 text-xs text-rose-400 leading-relaxed">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form Login */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Field Username */}
            <div className="space-y-1.5">
              <label
                htmlFor="username"
                className="block text-xs font-medium text-zinc-300"
              >
                Username Panitia
              </label>
              <div className="relative">
                <input
                  id="username"
                  type="text"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username panitia"
                  className="w-full min-h-[44px] pl-4 pr-10 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg hover:border-zinc-700 focus:border-rose-500 focus:outline-hidden text-zinc-100 text-sm transition-colors placeholder:text-zinc-500"
                />
                <User className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
              </div>
            </div>

            {/* Field Password dengan Toggle Eye */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-medium text-zinc-300"
              >
                Password Panitia
              </label>
              <div className="relative flex items-center">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password panitia"
                  className="w-full min-h-[44px] pl-4 pr-12 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg hover:border-zinc-700 focus:border-rose-500 focus:outline-hidden text-zinc-100 text-sm transition-colors placeholder:text-zinc-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Sembunyikan password" : "Lihat password"}
                  className="absolute right-1 min-h-[44px] min-w-[44px] flex items-center justify-center text-zinc-500 hover:text-zinc-200 transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 shrink-0" />
                  ) : (
                    <Eye className="h-4 w-4 shrink-0" />
                  )}
                </button>
              </div>
            </div>

            {/* Keterangan Multi-Device */}
            <div className="p-3 bg-zinc-950/70 border border-zinc-800/80 rounded-lg text-xs text-zinc-400 leading-relaxed flex items-start gap-2.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Akun ini dapat digunakan bersamaan oleh seluruh panitia di meja registrasi dan laptop operator.
              </span>
            </div>

            {/* Tombol Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full min-h-[44px] py-2.5 px-4 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:bg-rose-600/50 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed shadow-xs mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                  <span>Memverifikasi Akses...</span>
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 shrink-0" />
                  <span>Masuk ke Panel Panitia</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Tombol Kembali ke Halaman Publik */}
        <div className="flex justify-center">
          <Link
            href="/"
            className="min-h-[44px] px-4 py-2 inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
            <span>Kembali ke Halaman Undangan</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
