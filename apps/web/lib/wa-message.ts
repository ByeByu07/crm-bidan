export function buildWaMessage(
  patientName: string,
  drugName: string,
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

  return `Halo ${patientName}, ini pengingat dari klinik. Obat ${drugName} Anda diperkirakan habis sekitar tanggal ${dateStr}. Jika perlu pembelian ulang, silakan balas pesan ini atau datang ke klinik. Terima kasih!`;
}
