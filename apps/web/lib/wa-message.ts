export function buildWaMessage(
  patientName: string,
  itemName: string,
  nextExpectedBuy: Date | string,
): string {
  const dateStr =
    typeof nextExpectedBuy === "string"
      ? nextExpectedBuy
      : nextExpectedBuy.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });

  return `Halo ${patientName}, ini pengingat dari klinik untuk ${itemName} Anda. Jadwal follow-up pada tanggal ${dateStr}. Silakan balas atau datang ke klinik. Terima kasih!`;
}
