import { NextRequest, NextResponse } from "next/server";
import { db } from "@repo/db";
import { transaction, saleItem, drug, notificationLog, patient } from "@repo/db/schema";
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
  drug_id: z.string().min(1),
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

  // Calculate totals and enrich items
  const enrichedItems: Array<{
    drugId: string;
    quantityDispense: number;
    pricePerDispense: string;
    subtotal: string;
    durationDays: number;
    nextExpectedBuy: Date;
  }> = [];

  for (const item of data.items) {
    const [d] = await db
      .select()
      .from(drug)
      .where(and(eq(drug.id, item.drug_id), eq(drug.organizationId, orgId)))
      .limit(1);

    if (!d) {
      return NextResponse.json(
        { error: `Drug not found: ${item.drug_id}` },
        { status: 404 },
      );
    }

    const subtotal = calculateSubtotal(item.quantity_dispense, item.price_per_dispense);
    const durationDays = calculateDurationDays(
      item.quantity_dispense,
      d.durationPerDispenseUnit ?? 1,
    );
    const nextExpectedBuy = calculateNextExpectedBuy(purchaseDate, durationDays);

    totalPrice += subtotal;

    enrichedItems.push({
      drugId: item.drug_id,
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
      drugId: item.drugId,
      quantityDispense: item.quantityDispense,
      pricePerDispense: item.pricePerDispense,
      subtotal: item.subtotal,
      durationDays: item.durationDays,
      nextExpectedBuy: item.nextExpectedBuy,
    });

    // Fetch drug name for message
    const [d] = await db.select().from(drug).where(eq(drug.id, item.drugId)).limit(1);

    const waMessage = buildWaMessage(pat.name, d?.name ?? "obat", item.nextExpectedBuy);

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
