import type { Metadata, Viewport } from "next";
import {
  Anton,
  Barlow_Condensed,
  Plus_Jakarta_Sans,
  JetBrains_Mono,
} from "next/font/google";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ToastContainer } from "@/components/ui/Toast";
import "./globals.css";

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-display",
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
  variable: "--font-condensed",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-sans",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500", "700"],
  display: "swap",
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: "Mubes Saba ExploIT 2026 — Protocol: VALORANT",
  description:
    "Undangan Resmi Musyawarah Besar Saba ExploIT SMA Negeri 1 Bantul • Selasa, 29 Desember 2026 di Ruang Yudistira. Konfirmasi kehadiranmu & dapatkan E-Ticket QR via WhatsApp!",
  openGraph: {
    title: "MUBES SABA EXPLOIT 2026 — PROTOCOL: VALORANT",
    description:
      "Selasa, 29 Desember 2026 • 09.00 WIB – Selesai • Ruang Yudistira, SMAN 1 Bantul. Klik untuk konfirmasi kehadiran & ambil E-Ticket!",
    type: "website",
    locale: "id_ID",
    siteName: "Saba ExploIT SMAN 1 Bantul",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f1923",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`dark ${anton.variable} ${barlowCondensed.variable} ${plusJakartaSans.variable} ${jetBrainsMono.variable}`}
    >
      <body className="min-h-screen font-sans bg-surface text-ink antialiased flex flex-col selection:bg-brand selection:text-white">
        <ThemeProvider>
          {children}
          <ToastContainer />
        </ThemeProvider>
      </body>
    </html>
  );
}
