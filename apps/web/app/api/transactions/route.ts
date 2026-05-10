import { NextRequest, NextResponse } from "next/server";
import { db } from "@repo/db";
import { transaction, saleItem, catalogItem, notificationLog, patient } from "@repo/db/schema";
import { getActiveOrganizationId } from "@repo/auth/session";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import {
  calculateSubtotal,
  calculateDurationDays,
  calculateNextExpectedBuy,
} from "@repo/utils";
import { buildWaMessage } from "@/lib/wa-message";


const transactionItemSchema = z.object({
  catalog_item_id: z.string().min(1),
  quantity_dispense: z.number().int().positive(),
  price_per_dispense: z.number().positive(),
});

const createTransactionSchema = z.object({
  patient_id: z.string().min(1),
  purchase_date: z.string().min(1),
  patient_condition: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  items: z.array(transactionItemSchema).min(1),
});

export async function POST(request: NextRequest) {
  const orgId = await getActiveOrganizationId();
  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createTransactionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  // Verify patient belongs to org
  const [pat] = await db
    .select()
    .from(patient)
    .where(and(eq(patient.id, data.patient_id), eq(patient.organizationId, orgId)))
    .limit(1);

  if (!pat) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }

  const purchaseDate = new Date(data.purchase_date);
  let totalPrice = 0;

  // Calculate totals and enrich items (single pass, fetch catalog item names)
  const enrichedItems: Array<{
    catalogItemId: string;
    catalogItemName: string;
    quantityDispense: number;
    pricePerDispense: string;
    subtotal: string;
    durationDays: number;
    nextExpectedBuy: Date;
  }> = [];

  for (const item of data.items) {
    const [ci] = await db
      .select()
      .from(catalogItem)
      .where(and(eq(catalogItem.id, item.catalog_item_id), eq(catalogItem.organizationId, orgId)))
      .limit(1);

    if (!ci) {
      return NextResponse.json(
        { error: `Item not found: ${item.catalog_item_id}` },
        { status: 404 },
      );
    }

    const subtotal = calculateSubtotal(item.quantity_dispense, item.price_per_dispense);
    const durationDays = calculateDurationDays(
      item.quantity_dispense,
      ci.durationDays,
    );
    const nextExpectedBuy = calculateNextExpectedBuy(purchaseDate, durationDays);

    totalPrice += subtotal;

    enrichedItems.push({
      catalogItemId: item.catalog_item_id,
      catalogItemName: ci.name,
      quantityDispense: item.quantity_dispense,
      pricePerDispense: String(item.price_per_dispense),
      subtotal: String(subtotal),
      durationDays,
      nextExpectedBuy,
    });
  }

  const txId = crypto.randomUUID();

  await db.insert(transaction).values({
    id: txId,
    organizationId: orgId,
    patientId: data.patient_id,
    purchaseDate,
    patientCondition: data.patient_condition ?? null,
    totalPrice: String(totalPrice),
    notes: data.notes ?? null,
  });

  for (const item of enrichedItems) {
    const saleId = crypto.randomUUID();
    await db.insert(saleItem).values({
      id: saleId,
      transactionId: txId,
      catalogItemId: item.catalogItemId,
      quantityDispense: item.quantityDispense,
      pricePerDispense: item.pricePerDispense,
      subtotal: item.subtotal,
      durationDays: item.durationDays,
      nextExpectedBuy: item.nextExpectedBuy,
    });

    const waMessage = buildWaMessage(
      pat.name,
      item.catalogItemName,
      item.nextExpectedBuy,
    );

    await db.insert(notificationLog).values({
      id: crypto.randomUUID(),
      saleItemId: saleId,
      patientId: data.patient_id,
      organizationId: orgId,
      scheduledDate: item.nextExpectedBuy,
      status: "pending",
      waMessage,
    });
  }

  const [newTransaction] = await db
    .select()
    .from(transaction)
    .where(eq(transaction.id, txId))
    .limit(1);

  return NextResponse.json({ transaction: newTransaction }, { status: 201 });
}
