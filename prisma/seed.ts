import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const defaultRundown = [
    {
      time: "09.00 – 09.30 WIB",
      title: "Open Gate & Registrasi",
      description:
        "Registrasi peserta di meja Humas, pemindaian E-Ticket QR, dan persiapan acara.",
    },
    {
      time: "09.30 – 09.55 WIB",
      title: "Pembukaan & Sambutan",
      description:
        "Pembukaan oleh MC, menyanyikan lagu Indonesia Raya, serta sambutan Ketua Panitia, Presiden Saba ExploIT, dan Pembimbing.",
    },
    {
      time: "09.55 – 10.35 WIB",
      title: "Laporan Proker & Sidang AD/ART",
      description:
        "Penyampaian laporan program kerja, keanggotaan, serta pembahasan AD/ART organisasi.",
    },
    {
      time: "10.35 – 11.55 WIB",
      title: "Perkenalan Anggota & Sharing Session",
      description:
        "Sesi perkenalan anggota dilanjutkan tanya jawab dan kilas balik lintas generasi.",
    },
    {
      time: "11.55 – 12.45 WIB",
      title: "ISHOMA",
      description:
        "Istirahat, sholat, dan makan bersama seluruh peserta dan alumni.",
    },
    {
      time: "12.45 – 13.45 WIB",
      title: "Games & Pembagian Hadiah",
      description:
        "Dua permainan interaktif MUBES, penyampaian kesan-pesan pemenang, dan penyerahan hadiah.",
    },
    {
      time: "13.45 – 13.55 WIB",
      title: "Penutup & Foto Bersama",
      description:
        "Penutupan resmi MUBES 2026 dan sesi dokumentasi bersama seluruh generasi.",
    },
  ];

  await prisma.eventSettings.upsert({
    where: { id: "default" },
    update: {
      eventTitle: "MUSYAWARAH BESAR SABA EXPLOIT",
      eventSubtitle: "ONE VISION, TIMELESS MEMORIES",
      eventDateIso: "2026-12-29T09:00:00+07:00",
      eventDateDisplay: "Selasa, 29 Desember 2026",
      eventTimeDisplay: "09.00 WIB – Selesai",
      eventLocation: "SMA Negeri 1 Bantul (Ruang Yudistira)",
      entryFeeLabel: "RADIANT PASS",
      entryFeeAmount: "Rp 20.000",
      entryFeeNote: "HTM Peserta • Termasuk Konsumsi & Merchandise",
      rundownJson: defaultRundown,
      contactName: "Humas Saba ExploIT",
      contactWhatsapp: "6281234567890",
      isRegistrationOpen: true,
    },
    create: {
      id: "default",
      eventTitle: "MUSYAWARAH BESAR SABA EXPLOIT",
      eventSubtitle: "ONE VISION, TIMELESS MEMORIES",
      eventDateIso: "2026-12-29T09:00:00+07:00",
      eventDateDisplay: "Selasa, 29 Desember 2026",
      eventTimeDisplay: "09.00 WIB – Selesai",
      eventLocation: "SMA Negeri 1 Bantul (Ruang Yudistira)",
      entryFeeLabel: "RADIANT PASS",
      entryFeeAmount: "Rp 20.000",
      entryFeeNote: "HTM Peserta • Termasuk Konsumsi & Merchandise",
      rundownJson: defaultRundown,
      contactName: "Humas Saba ExploIT",
      contactWhatsapp: "6281234567890",
      isRegistrationOpen: true,
    },
  });

  console.log("Seed EventSettings Mubes Saba ExploIT berhasil diperbarui.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
