import { NextRequest, NextResponse } from "next/server";
import { streamText } from "ai";
import { db } from "@repo/db";
import { transaction, saleItem, drug, patient } from "@repo/db/schema";
import { getActiveOrganizationId } from "@repo/auth/session";
import { eq, and, desc } from "drizzle-orm";

export async function POST(request: NextRequest) {
  const orgId = await getActiveOrganizationId();
  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const patientId = body.patientId as string | undefined;

  if (!patientId) {
    return NextResponse.json({ error: "patientId required" }, { status: 400 });
  }

  // Verify patient belongs to org
  const [pat] = await db
    .select()
    .from(patient)
    .where(and(eq(patient.id, patientId), eq(patient.organizationId, orgId)))
    .limit(1);

  if (!pat) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Fetch latest 3 transactions for this patient
  const txs = await db
    .select()
    .from(transaction)
    .where(
      and(
        eq(transaction.patientId, patientId),
        eq(transaction.organizationId, orgId)
      )
    )
    .orderBy(desc(transaction.purchaseDate))
    .limit(3);

  // Fetch sale items
  const allSaleItems: (typeof saleItem.$inferSelect)[] = [];
  for (const tx of txs) {
    const items = await db
      .select()
      .from(saleItem)
      .where(eq(saleItem.transactionId, tx.id));
    allSaleItems.push(...items);
  }

  // Fetch drugs
  const drugIds = [...new Set(allSaleItems.map((i) => i.drugId))];
  const allDrugs: (typeof drug.$inferSelect)[] = [];
  for (const dId of drugIds) {
    const d = await db.select().from(drug).where(eq(drug.id, dId)).limit(1);
    if (d[0]) allDrugs.push(d[0]);
  }
  const drugMap = new Map(allDrugs.map((d) => [d.id, d]));

  // Format purchase history
  const historyLines = txs.map((tx) => {
    const items = allSaleItems.filter((i) => i.transactionId === tx.id);
    const itemStr = items
      .map((item) => {
        const d = drugMap.get(item.drugId);
        return `${d?.name ?? "Obat"} x${item.quantityDispense}`;
      })
      .join(", ");
    return `- ${tx.purchaseDate.toLocaleDateString("id-ID")}: ${itemStr} (Rp${Number(tx.totalPrice).toLocaleString("id-ID")})`;
  });

  const prompt = `Kamu adalah asisten AI untuk bidan di klinik desa Indonesia.

Data Pasien: ${pat.name}
${pat.location ? `Lokasi: ${pat.location}` : ""}
${pat.birthDate ? `Usia: ${calculateAge(pat.birthDate)} tahun` : ""}

Riwayat Pembelian Terakhir:
${historyLines.length > 0 ? historyLines.join("\n") : "- Belum ada riwayat pembelian"}

Berdasarkan riwayat pembelian di atas, berikan rekomendasi **obat apa yang paling cocok ditawarkan** saat follow-up hari ini.

Jawaban wajib sangat singkat (maksimal 60 kata) dengan format markdown:
- **Rekomendasi Obat:** [1-2 obat spesifik yang bisa ditawarkan] — [alasan singkat]
- **Tawarkan Juga:** [obat pelengkap lain jika relevan, atau "Tidak ada"]

Contoh: "**Rekomendasi Obat:** Vitamin B12 — pasien rutin beli tiap bulan, stok mungkin habis. **Tawarkan Juga:** Asam Folat untuk dukung kehamilan."

Bahasa Indonesia santai, profesional, mudah dipahami bidan.`;

  const result = streamText({
    model: "deepseek/deepseek-v4-flash",
    prompt,
    providerOptions: {
      gateway: {
        tags: ["bidan-crm", "patient-insight"],
      },
    },
  });

  return result.toTextStreamResponse();
}

function calculateAge(birthDate: string | Date): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}
