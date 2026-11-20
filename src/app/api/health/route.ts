import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await prisma.eventSettings.findUnique({
      where: { id: "default" },
    });

    const participantCount = await prisma.participant.count();

    return NextResponse.json({
      status: "ok",
      database: "connected",
      provider: "Neon Serverless PostgreSQL",
      branch: process.env.NEON_BRANCH || "production",
      data: {
        eventTitle: settings?.eventTitle,
        eventDate: settings?.eventDateDisplay,
        eventLocation: settings?.eventLocation,
        participantCount,
      },
    });
  } catch (error) {
    console.error("Database connection check failed:", error);
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown database error",
      },
      { status: 500 }
    );
  }
}
