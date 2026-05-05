import { NextResponse } from "next/server";
import { db } from "@repo/db";
import { transaction, saleItem, drug, patient } from "@repo/db/schema";
import { getActiveOrganizationId } from "@repo/auth/session";
import { eq, and, desc } from "drizzle-orm";
import type { PatientTransactionHistory } from "@repo/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const orgId = await getActiveOrganizationId();
  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Verify patient belongs to org
  const [pat] = await db
    .select()
    .from(patient)
    .where(and(eq(patient.id, id), eq(patient.organizationId, orgId)))
    .limit(1);

  if (!pat) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Fetch latest 3 transactions for this patient
  const txs = await db
    .select()
    .from(transaction)
    .where(and(eq(transaction.patientId, id), eq(transaction.organizationId, orgId)))
    .orderBy(desc(transaction.purchaseDate))
    .limit(3);

  if (txs.length === 0) {
    return NextResponse.json({ transactions: [] });
  }

  // Fetch all sale items for these transactions
  const allSaleItems: (typeof saleItem.$inferSelect)[] = [];
  for (const tx of txs) {
    const items = await db
      .select()
      .from(saleItem)
      .where(eq(saleItem.transactionId, tx.id));
    allSaleItems.push(...items);
  }

  // Fetch all referenced drugs
  const drugIds = [...new Set(allSaleItems.map((i) => i.drugId))];
  const allDrugs: (typeof drug.$inferSelect)[] = [];
  for (const dId of drugIds) {
    const d = await db.select().from(drug).where(eq(drug.id, dId)).limit(1);
    if (d[0]) allDrugs.push(d[0]);
  }

  const drugMap = new Map(allDrugs.map((d) => [d.id, d]));

  const enriched: PatientTransactionHistory[] = txs.map((tx) => {
    const txItems = allSaleItems.filter((i) => i.transactionId === tx.id);
    return {
      transactionId: tx.id,
      purchaseDate: tx.purchaseDate,
      patientCondition: tx.patientCondition,
      totalPrice: Number(tx.totalPrice),
      notes: tx.notes,
      items: txItems.map((item) => {
        const d = drugMap.get(item.drugId);
        return {
          drugName: d?.name ?? "",
          quantityDispense: item.quantityDispense,
          pricePerDispense: Number(item.pricePerDispense),
          subtotal: Number(item.subtotal),
          durationDays: item.durationDays,
        };
      }),
    };
  });

  return NextResponse.json({ transactions: enriched });
}
