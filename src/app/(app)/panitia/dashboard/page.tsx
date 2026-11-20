import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getPanitiaSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PanitiaWorkspace } from "@/components/panitia/PanitiaWorkspace";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Dashboard Panitia — Mubes Saba ExploIT 2026",
  description:
    "Tactical Command Center & Real-Time Operational Workspace Musyawarah Besar Saba ExploIT 2026",
};

export default async function PanitiaDashboardPage() {
  // 1. Verifikasi Sesi JWT Panitia di Server (Redirect ke login jika tidak sah)
  const session = await getPanitiaSession();
  if (!session) {
    redirect("/panitia/login");
  }

  // 2. Muat seluruh data peserta dan pengaturan acara dari Neon PostgreSQL
  const [participants, settings] = await Promise.all([
    prisma.participant.findMany({
      orderBy: { ticketSequence: "asc" },
    }),
    prisma.eventSettings.findUnique({
      where: { id: "default" },
    }),
  ]);

  return (
    <PanitiaWorkspace
      initialParticipants={participants}
      initialSettings={settings}
      panitiaUsername={session.username}
    />
  );
}
