import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import { EVENT_DEFAULTS } from "@/lib/constants";
import { IntroCurtain } from "@/components/public/IntroCurtain";
import { HeroBriefing } from "@/components/public/HeroBriefing";
import { WeaponSweepDivider } from "@/components/public/WeaponSweepDivider";
import {
  EventBriefingSection,
  type RundownItem,
} from "@/components/public/EventBriefingSection";
import { RsvpForm } from "@/components/public/RsvpForm";
import {
  WallOfMessages,
  type PublicMessageItem,
} from "@/components/public/WallOfMessages";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PublicHomePage() {
  // 1. Ambil EventSettings dari Neon PostgreSQL (dengan fallback aman ke EVENT_DEFAULTS)
  const settings = await prisma.eventSettings.findUnique({
    where: { id: "default" },
  });

  // 2. Ambil pesan-pesan publik yang tidak disembunyikan oleh panitia
  const participantsWithMessages = await prisma.participant.findMany({
    where: {
      isMessageHidden: false,
      NOT: [{ message: null }, { message: "" }],
    },
    select: {
      id: true,
      fullName: true,
      division: true,
      generation: true,
      message: true,
      isAnonymous: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Filter pesan yang bukan string kosong dan serialisasikan tanggal
  const validMessages: PublicMessageItem[] = participantsWithMessages
    .filter((p) => p.message && p.message.trim().length > 0)
    .map((p) => ({
      id: p.id,
      fullName: p.fullName,
      division: p.division,
      generation: p.generation,
      message: p.message,
      isAnonymous: p.isAnonymous,
      createdAt: p.createdAt.toISOString(),
    }));

  let rundown: RundownItem[] | undefined = undefined;
  if (Array.isArray(settings?.rundownJson)) {
    rundown = settings.rundownJson as unknown as RundownItem[];
  }

  // 3. Deteksi fisik keberadaan foto dan denah sekolah di server
  const venueDir = path.join(process.cwd(), "public", "images", "venue");
  const schoolPhotoFile = path.join(venueDir, "school-photo.jpg");
  const schoolBlueprintFile = path.join(venueDir, "school-blueprint.png");

  const hasSchoolPhoto = fs.existsSync(schoolPhotoFile);
  const hasSchoolBlueprint = fs.existsSync(schoolBlueprintFile);

  const schoolPhotoSrc = hasSchoolPhoto
    ? "/images/venue/school-photo.jpg"
    : "/images/valorant/map-ascent-splash.png";
  const schoolBlueprintSrc = hasSchoolBlueprint
    ? "/images/venue/school-blueprint.png"
    : null;

  return (
    <>
      {/* ── TACTICAL CURTAIN REVEAL (SEKALI PER SESI BROWSER) ── */}
      <IntroCurtain />

      <div className="w-full flex flex-col">
        {/* ── SEKSI 1: HERO (THE AGENT SELECT STAGE) ── */}
        <HeroBriefing
          eventTitle={settings?.eventTitle ?? EVENT_DEFAULTS.eventTitle}
          eventSubtitle={settings?.eventSubtitle ?? EVENT_DEFAULTS.eventSubtitle}
          eventDateIso={settings?.eventDateIso ?? EVENT_DEFAULTS.eventDateIso}
          eventDateDisplay={
            settings?.eventDateDisplay ?? EVENT_DEFAULTS.eventDateDisplay
          }
          eventTimeDisplay={
            settings?.eventTimeDisplay ?? EVENT_DEFAULTS.eventTimeDisplay
          }
          eventLocation={
            settings?.eventLocation ?? EVENT_DEFAULTS.eventLocation
          }
          entryFeeLabel={settings?.entryFeeLabel ?? EVENT_DEFAULTS.entryFeeLabel}
          entryFeeAmount={settings?.entryFeeAmount ?? EVENT_DEFAULTS.entryFeeAmount}
          entryFeeNote={settings?.entryFeeNote ?? EVENT_DEFAULTS.entryFeeNote}
        />

        {/* ── TRANSISI 1 -> 2: KINETIC MARQUEE & SCRUBBED VANDAL SWEEP ── */}
        <WeaponSweepDivider />

        {/* ── SEKSI 2: EDITORIAL RUNDOWN & TACTICAL MAP VENUE ── */}
        <EventBriefingSection
          rundown={rundown}
          eventLocation={settings?.eventLocation ?? EVENT_DEFAULTS.eventLocation}
          eventDateDisplay={settings?.eventDateDisplay ?? EVENT_DEFAULTS.eventDateDisplay}
          eventTimeDisplay={settings?.eventTimeDisplay ?? EVENT_DEFAULTS.eventTimeDisplay}
          contactName={settings?.contactName ?? EVENT_DEFAULTS.contactName}
          contactWhatsapp={
            settings?.contactWhatsapp ?? EVENT_DEFAULTS.contactWhatsapp
          }
          schoolPhotoSrc={schoolPhotoSrc}
          schoolBlueprintSrc={schoolBlueprintSrc}
        />

        {/* ── SEKSI 3: FORMULIR KONFIRMASI KEHADIRAN (RSVP LOCK IN) ── */}
        <RsvpForm
          isRegistrationOpen={settings?.isRegistrationOpen ?? true}
          entryFeeLabel={settings?.entryFeeLabel ?? EVENT_DEFAULTS.entryFeeLabel}
          entryFeeAmount={settings?.entryFeeAmount ?? EVENT_DEFAULTS.entryFeeAmount}
        />

        {/* ── SEKSI 4: CROSS-GEN TACTICAL COMMS (WALL OF MESSAGES) ── */}
        <WallOfMessages messages={validMessages} />
      </div>
    </>
  );
}
