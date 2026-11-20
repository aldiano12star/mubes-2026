import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

export const PANITIA_COOKIE_NAME = "se_mubes_panitia_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 hari dalam detik

function getSecretKey(): Uint8Array {
  const secret =
    process.env.JWT_SECRET ||
    "mubes-saba-exploit-valorant-default-dev-secret-32-chars-min";
  return new TextEncoder().encode(secret);
}

export interface PanitiaSession {
  username: string;
}

/**
 * Membuat token JWT sesi panitia dan menyimpannya di HTTP-only cookie
 * Sesi bersifat stateless sehingga 1 akun dapat login bersamaan di banyak perangkat.
 */
export async function createPanitiaSession(username: string): Promise<void> {
  const token = await new SignJWT({ username, role: "panitia" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecretKey());

  const cookieStore = await cookies();
  cookieStore.set(PANITIA_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

/**
 * Membaca dan memverifikasi token sesi panitia dari HTTP-only cookie
 */
export async function getPanitiaSession(): Promise<PanitiaSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(PANITIA_COOKIE_NAME)?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, getSecretKey());
    if (typeof payload.username !== "string") {
      return null;
    }

    return { username: payload.username };
  } catch {
    return null;
  }
}

/**
 * Memeriksa keberadaan sesi panitia yang valid
 * Melempar error "UNAUTHORIZED" jika tidak terautentikasi
 */
export async function requirePanitiaSession(): Promise<PanitiaSession> {
  const session = await getPanitiaSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

/**
 * Menghapus cookie sesi panitia saat logout
 */
export async function destroyPanitiaSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(PANITIA_COOKIE_NAME);
}
