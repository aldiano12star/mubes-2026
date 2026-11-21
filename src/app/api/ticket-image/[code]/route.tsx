import { ImageResponse } from "next/og";
import fs from "fs/promises";
import path from "path";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { EVENT_DEFAULTS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  // 1. Next.js 16: Await async params
  const { code } = await params;
  const normalizedCode = decodeURIComponent(code).trim().toUpperCase();

  if (!normalizedCode) {
    return new Response("Invalid ticket code", { status: 400 });
  }

  // 2. Kueri data peserta dan pengaturan acara dari Neon PostgreSQL
  const [participant, settings] = await Promise.all([
    prisma.participant.findUnique({
      where: { ticketCode: normalizedCode },
    }),
    prisma.eventSettings.findUnique({
      where: { id: "default" },
    }),
  ]);

  if (!participant) {
    return new Response("Ticket not found", { status: 404 });
  }

  const eventSubtitle =
    settings?.eventSubtitle ?? EVENT_DEFAULTS.eventSubtitle;
  const eventDateDisplay =
    settings?.eventDateDisplay ?? EVENT_DEFAULTS.eventDateDisplay;
  const eventTimeDisplay =
    settings?.eventTimeDisplay ?? EVENT_DEFAULTS.eventTimeDisplay;
  const eventLocation =
    settings?.eventLocation ?? EVENT_DEFAULTS.eventLocation;
  const entryFeeLabel =
    settings?.entryFeeLabel ?? EVENT_DEFAULTS.entryFeeLabel;
  const entryFeeAmount =
    settings?.entryFeeAmount ?? EVENT_DEFAULTS.entryFeeAmount;

  // 3. Generate QR Code kontras tinggi (hanya berisi kode tiket pendek agar modul besar & cepat di-scan)
  let qrDataUrl = "";
  try {
    qrDataUrl = await QRCode.toDataURL(participant.ticketCode, {
      width: 280,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "M",
    });
  } catch (err) {
    console.error("[Ticket Image API] Gagal membuat QR Code:", err);
    return new Response("Failed to generate QR Code", { status: 500 });
  }

  // 4. Muat aset gambar secara aman via fs/promises (Logo Saba ExploIT & Map Splash)
  let logoDataUrl: string | null = null;
  try {
    const logoPath = path.join(
      process.cwd(),
      "public",
      "images",
      "logo-saba-exploit.png"
    );
    const logoBuffer = await fs.readFile(logoPath);
    logoDataUrl = `data:image/png;base64,${logoBuffer.toString("base64")}`;
  } catch {
    logoDataUrl = null;
  }

  let mapDataUrl: string | null = null;
  try {
    const mapPath = path.join(
      process.cwd(),
      "public",
      "images",
      "valorant",
      "map-ascent-splash.png"
    );
    const mapBuffer = await fs.readFile(mapPath);
    mapDataUrl = `data:image/png;base64,${mapBuffer.toString("base64")}`;
  } catch {
    mapDataUrl = null;
  }

  // 5. Konfigurasi headers respon
  const url = new URL(request.url);
  const isDownload = url.searchParams.get("download") === "1";

  const headers = new Headers();
  headers.set("Cache-Control", "no-store, max-age=0");
  if (isDownload) {
    headers.set(
      "Content-Disposition",
      `attachment; filename="E-Ticket-${participant.ticketCode}.png"`
    );
  }

  // 6. Render tata letak kartu taktis 900 × 1500 px (VALORANT Tactical Boarding Pass Universal)
  return new ImageResponse(
    (
      <div
        style={{
          width: "900px",
          height: "1500px",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#0F1923",
          padding: "32px",
          fontFamily: "sans-serif",
          boxSizing: "border-box",
        }}
      >
        {/* Frame Kartu Utama Taktis */}
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            backgroundColor: "#0A1118",
            border: "2px solid #243545",
            borderRadius: "16px",
            position: "relative",
            overflow: "hidden",
            boxSizing: "border-box",
          }}
        >
          {/* Garis Aksen Ganda Atas: Merah & Cyan Neon */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "8px",
              display: "flex",
              zIndex: 30,
            }}
          >
            <div
              style={{
                width: "520px",
                height: "8px",
                backgroundColor: "#FF4655",
              }}
            />
            <div
              style={{
                width: "316px",
                height: "8px",
                backgroundColor: "#00E5FF",
              }}
            />
          </div>

          {/* ── 1. TOP HEADER IDENTITAS MUBES & BADGE HTM ── */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#111A24",
              borderBottom: "1px solid #243545",
              padding: "24px 36px 20px 36px",
              marginTop: "8px",
              zIndex: 20,
            }}
          >
            {/* Logo & Identitas Mubes */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
              }}
            >
              {logoDataUrl ? (
                <img
                  src={logoDataUrl}
                  alt="Logo Saba ExploIT"
                  width={52}
                  height={52}
                  style={{
                    display: "flex",
                    objectFit: "contain",
                  }}
                />
              ) : (
                <div
                  style={{
                    display: "flex",
                    width: "52px",
                    height: "52px",
                    backgroundColor: "#FF4655",
                    color: "#FFFFFF",
                    fontWeight: "bold",
                    fontSize: "22px",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "6px",
                  }}
                >
                  SE
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    fontSize: "24px",
                    fontWeight: 900,
                    color: "#ECE8E1",
                    letterSpacing: "2px",
                  }}
                >
                  MUBES 2026
                </div>
                <div
                  style={{
                    display: "flex",
                    fontSize: "13px",
                    color: "#FF4655",
                    fontWeight: "bold",
                    letterSpacing: "2px",
                    marginTop: "2px",
                  }}
                >
                  {eventSubtitle.toUpperCase()}
                </div>
              </div>
            </div>

            {/* Sisi Kanan: Level Badge & HTM Badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "8px 18px",
                  backgroundColor: "#1A2634",
                  border: "2px solid #00E5FF",
                  borderRadius: "4px",
                  color: "#00E5FF",
                  fontWeight: 900,
                  fontSize: "14px",
                  letterSpacing: "2px",
                }}
              >
                MUBES 26
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "8px 18px",
                  border: "1px solid rgba(0, 229, 255, 0.4)",
                  backgroundColor: "rgba(0, 229, 255, 0.1)",
                  color: "#00E5FF",
                  fontWeight: 900,
                  fontSize: "14px",
                  letterSpacing: "1px",
                }}
              >
                {entryFeeLabel.toUpperCase()} • {entryFeeAmount}
              </div>
            </div>
          </div>

          {/* ── 2. VALORANT TACTICAL BOARDING BANNER (UNIVERSAL — TANPA KARAKTER AGENT) ── */}
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "250px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              overflow: "hidden",
              backgroundColor: "#0C1620",
              borderBottom: "1px solid #243545",
            }}
          >
            {/* Background Map Ascent Splash dengan Opacity Halus */}
            {mapDataUrl && (
              <img
                src={mapDataUrl}
                alt="Tactical Map Background"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  opacity: 0.16,
                }}
              />
            )}

            {/* Overlay Gradien Gelap Atas & Bawah */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage:
                  "linear-gradient(to bottom, rgba(12, 22, 32, 0.7) 0%, rgba(10, 17, 24, 0.85) 100%)",
              }}
            />

            {/* Konten Tactical Pass Tengah */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10,
                gap: "8px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <div
                  style={{
                    width: "24px",
                    height: "2px",
                    backgroundColor: "#FF4655",
                  }}
                />
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 900,
                    letterSpacing: "3px",
                    color: "#FF4655",
                    fontFamily: "monospace",
                  }}
                >
                  VALORANT TACTICAL BOARDING PASS
                </span>
                <div
                  style={{
                    width: "24px",
                    height: "2px",
                    backgroundColor: "#FF4655",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  fontSize: "32px",
                  fontWeight: 900,
                  color: "#ECE8E1",
                  letterSpacing: "4px",
                  textTransform: "uppercase",
                }}
              >
                OFFICIAL PASS HOLDER
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "13px",
                  fontWeight: "bold",
                  color: "#8B97A4",
                  letterSpacing: "2px",
                }}
              >
                <span>SABA EXPLOIT</span>
                <span>•</span>
                <span>SMA NEGERI 1 BANTUL</span>
                <span>•</span>
                <span style={{ color: "#00E5FF" }}>GEN 1 S/D GEN 21</span>
              </div>
            </div>
          </div>

          {/* ── 3. CLASSIC VALORANT PLAYER NAMEPLATE & TITLE STRIP ── */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              zIndex: 20,
            }}
          >
            {/* Baris Nama (Nameplate Krem Bersih) */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                backgroundColor: "#ECE8E1",
                padding: "18px 24px",
                color: "#0F1923",
                fontSize: "44px",
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "2px",
                boxShadow: "0 4px 14px rgba(0,0,0,0.4)",
              }}
            >
              {participant.fullName}
            </div>

            {/* Pita Gelar (Player Title Strip) */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                backgroundColor: "#16222F",
                borderTop: "2px solid #FF4655",
                borderBottom: "1px solid #243545",
                padding: "14px 36px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  fontSize: "19px",
                  color: "#ECE8E1",
                  fontWeight: "bold",
                  letterSpacing: "1px",
                }}
              >
                <span style={{ color: "#FF4655" }}>
                  {participant.generation.toUpperCase()}
                </span>
                <span style={{ color: "#5C6977" }}>•</span>
                <span>{participant.division.toUpperCase()}</span>
              </div>

              {participant.isOnTheSpot && (
                <div
                  style={{
                    display: "flex",
                    padding: "6px 14px",
                    backgroundColor: "#F59E0B",
                    color: "#0F1923",
                    fontSize: "13px",
                    fontWeight: 900,
                    borderRadius: "4px",
                    letterSpacing: "1px",
                  }}
                >
                  ON-THE-SPOT
                </div>
              )}
            </div>

            {/* Status Bar (READY / VERIFIED) */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                padding: "14px 24px",
                backgroundColor: participant.isCheckedIn
                  ? "rgba(16, 185, 129, 0.15)"
                  : "rgba(0, 229, 255, 0.12)",
                borderBottom: participant.isCheckedIn
                  ? "2px solid #10B981"
                  : "2px solid #00E5FF",
                color: participant.isCheckedIn ? "#10B981" : "#00E5FF",
                fontSize: "16px",
                fontWeight: 900,
                letterSpacing: "3px",
                fontFamily: "monospace",
              }}
            >
              {participant.isCheckedIn
                ? "TERVERIFIKASI HADIR (CHECKED IN)"
                : "READY FOR CHECK-IN"}
            </div>
          </div>

          {/* ── 4. PERFORASI STUB TIKET DENGAN CUTOUTS KIRI & KANAN ── */}
          <div
            style={{
              position: "relative",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "12px 0",
            }}
          >
            {/* Cutout Kiri */}
            <div
              style={{
                position: "absolute",
                left: "-16px",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                backgroundColor: "#0F1923",
                borderRight: "2px solid #243545",
              }}
            />
            {/* Garis Perforasi Putus-putus */}
            <div
              style={{
                width: "100%",
                borderTop: "2px dashed #2A3B4C",
                margin: "0 28px",
              }}
            />
            {/* Cutout Kanan */}
            <div
              style={{
                position: "absolute",
                right: "-16px",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                backgroundColor: "#0F1923",
                borderLeft: "2px solid #243545",
              }}
            />
          </div>

          {/* ── 5. QR VERIFICATION DOCK (SOLID WHITE #FFFFFF) ── */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px 36px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#FFFFFF",
                borderRadius: "20px",
                padding: "24px 32px",
                boxShadow: "0 16px 36px rgba(0, 0, 0, 0.5)",
                border: "3px solid #ECE8E1",
              }}
            >
              {/* Gambar QR Code 280 × 280 px */}
              <img
                src={qrDataUrl}
                alt={`QR Code ${participant.ticketCode}`}
                width={280}
                height={280}
                style={{
                  display: "flex",
                }}
              />

              {/* Kode Tiket Monospace Besar */}
              <div
                style={{
                  display: "flex",
                  fontSize: "40px",
                  fontWeight: 900,
                  fontFamily: "monospace",
                  color: "#0F1923",
                  letterSpacing: "4px",
                  marginTop: "8px",
                }}
              >
                {participant.ticketCode}
              </div>

              {/* Petunjuk Operasional Meja Registrasi */}
              <div
                style={{
                  display: "flex",
                  fontSize: "12px",
                  fontWeight: "bold",
                  color: "#5C6977",
                  letterSpacing: "2px",
                  marginTop: "4px",
                }}
              >
                TUNJUKKAN PADA MEJA REGISTRASI RUANG YUDISTIRA
              </div>
            </div>
          </div>

          {/* ── 6. FOOTER INFORMASI ACARA SESUAI NOTULENSI ── */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              backgroundColor: "#111A24",
              borderTop: "1px solid #243545",
              padding: "22px 36px",
            }}
          >
            {/* Waktu & Lokasi Resmi */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#ECE8E1",
                }}
              >
                {eventDateDisplay} • {eventTimeDisplay}
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: "14px",
                  color: "#00E5FF",
                  fontWeight: "bold",
                }}
              >
                {eventLocation}
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: "12px",
                  color: "#8B97A4",
                }}
              >
                Jl. KHA Wakhid Hasyim 99, Bantul
              </div>
            </div>

            {/* Subtema & Protocol */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: "4px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: "12px",
                  fontFamily: "monospace",
                  color: "#5C6977",
                  letterSpacing: "1px",
                }}
              >
                SABA EXPLOIT • SECURITY VERIFIED
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: "13px",
                  fontFamily: "monospace",
                  color: "#FF4655",
                  fontWeight: "bold",
                  letterSpacing: "1px",
                }}
              >
                PROTOCOL: VALORANT
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 900,
      height: 1500,
      headers,
    }
  );
}
