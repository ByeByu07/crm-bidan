import { NextResponse } from "next/server";
import { db } from "@repo/db";
import { transaction, saleItem, catalogItem, patient } from "@repo/db/schema";
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

  // Fetch all referenced catalog items
  const catalogItemIds = [...new Set(allSaleItems.map((i) => i.catalogItemId))];
  const allItems: (typeof catalogItem.$inferSelect)[] = [];
  for (const ciId of catalogItemIds) {
    const ci = await db.select().from(catalogItem).where(eq(catalogItem.id, ciId)).limit(1);
    if (ci[0]) allItems.push(ci[0]);
  }

  const itemMap = new Map(allItems.map((ci) => [ci.id, ci]));

  const enriched: PatientTransactionHistory[] = txs.map((tx) => {
    const txItems = allSaleItems.filter((i) => i.transactionId === tx.id);
    return {
      transactionId: tx.id,
      purchaseDate: tx.purchaseDate,
      patientCondition: tx.patientCondition,
      totalPrice: Number(tx.totalPrice),
      notes: tx.notes,
      items: txItems.map((item) => {
        const ci = itemMap.get(item.catalogItemId);
        return {
          catalogItemName: ci?.name ?? "",
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
