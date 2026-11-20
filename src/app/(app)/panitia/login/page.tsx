import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getPanitiaSession } from "@/lib/auth";
import { PanitiaLoginForm } from "@/components/panitia/PanitiaLoginForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Login Panitia — Mubes Saba ExploIT 2026",
  description: "Autentikasi Workspace Internal Panitia Musyawarah Besar Saba ExploIT 2026",
};

export default async function PanitiaLoginPage() {
  const session = await getPanitiaSession();

  // Jika sudah memiliki sesi aktif, langsung alihkan ke dashboard panitia
  if (session) {
    redirect("/panitia/dashboard");
  }

  return <PanitiaLoginForm />;
}
