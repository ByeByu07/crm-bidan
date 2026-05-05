import { NextRequest, NextResponse } from "next/server";
import { db } from "@repo/db";
import { drug } from "@repo/db/schema";
import { getActiveOrganizationId } from "@repo/auth/session";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const patchDrugSchema = z.object({
  name: z.string().min(1).optional(),
  category: z.string().optional().nullable(),
  dispense_unit: z.string().min(1).optional(),
  package_unit: z.string().min(1).optional(),
  units_per_package: z.number().int().positive().optional(),
  duration_per_dispense_unit: z.number().int().optional().nullable(),
  sell_price_per_dispense: z.number().positive().optional(),
  buy_price_per_package: z.number().optional().nullable(),
  is_active: z.boolean().optional(),
  notes: z.string().optional().nullable(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const orgId = await getActiveOrganizationId();
  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = patchDrugSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.dispense_unit !== undefined) updateData.dispenseUnit = data.dispense_unit;
  if (data.package_unit !== undefined) updateData.packageUnit = data.package_unit;
  if (data.units_per_package !== undefined) updateData.unitsPerPackage = data.units_per_package;
  if (data.duration_per_dispense_unit !== undefined)
    updateData.durationPerDispenseUnit = data.duration_per_dispense_unit;
  if (data.sell_price_per_dispense !== undefined)
    updateData.sellPricePerDispense = String(data.sell_price_per_dispense);
  if (data.buy_price_per_package !== undefined)
    updateData.buyPricePerPackage = data.buy_price_per_package ? String(data.buy_price_per_package) : null;
  if (data.is_active !== undefined) updateData.isActive = data.is_active;
  if (data.notes !== undefined) updateData.notes = data.notes;

  const [updated] = await db
    .update(drug)
    .set(updateData)
    .where(and(eq(drug.id, id), eq(drug.organizationId, orgId)))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ drug: updated });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const orgId = await getActiveOrganizationId();
  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const [deleted] = await db
    .delete(drug)
    .where(and(eq(drug.id, id), eq(drug.organizationId, orgId)))
    .returning();

  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ drug: deleted });
}
