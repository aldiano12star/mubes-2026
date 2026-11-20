"use server";

import { redirect } from "next/navigation";
import {
  createPanitiaSession,
  destroyPanitiaSession,
} from "@/lib/auth";
import {
  panitiaLoginSchema,
  type ActionResponse,
} from "@/lib/validations";

/**
 * Server Action: Login 1 Akun Panitia Bersama (Multi-Device)
 * - Validasi Zod
 * - Verifikasi kredensial terhadap environment server (PANITIA_USERNAME & PANITIA_PASSWORD)
 * - Menerbitkan stateless signed JWT cookie (se_mubes_panitia_session)
 */
export async function loginPanitiaAction(
  rawInput: unknown
): Promise<ActionResponse<null>> {
  // 1. Validasi input dengan Zod
  const parsed = panitiaLoginSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: "Username dan password wajib diisi.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { username, password } = parsed.data;

  // 2. Ambil kredensial resmi dari environment server
  const expectedUsername = process.env.PANITIA_USERNAME?.trim();
  const expectedPassword = process.env.PANITIA_PASSWORD?.trim();

  if (!expectedUsername || !expectedPassword) {
    console.error(
      "[Auth Action] PANITIA_USERNAME atau PANITIA_PASSWORD belum dikonfigurasi di .env"
    );
    return {
      success: false,
      error:
        "Konfigurasi kredensial panitia di server belum siap. Hubungi administrator teknis.",
    };
  }

  // 3. Verifikasi kecocokan username dan password
  if (username !== expectedUsername || password !== expectedPassword) {
    return {
      success: false,
      error: "Username atau password panitia salah. Silakan periksa kembali.",
    };
  }

  // 4. Terbitkan sesi JWT stateless cookie
  try {
    await createPanitiaSession(username);
    return {
      success: true,
      message: "Autentikasi berhasil. Mengalihkan ke Command Center...",
      data: null,
    };
  } catch (error) {
    console.error("[Auth Action Error] Gagal membuat sesi:", error);
    return {
      success: false,
      error: "Terjadi kesalahan saat memproses sesi. Silakan coba lagi.",
    };
  }
}

/**
 * Server Action: Logout Panitia
 * - Menghapus cookie sesi panitia
 * - Mengalihkan pengguna ke halaman login
 */
export async function logoutPanitiaAction(): Promise<void> {
  await destroyPanitiaSession();
  redirect("/panitia/login");
}
