import { NextRequest, NextResponse } from "next/server";
import { db } from "@repo/db";
import { catalogItem } from "@repo/db/schema";
import { getActiveOrganizationId } from "@repo/auth/session";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const patchCatalogItemSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum(["product", "service"]).optional(),
  category: z.string().optional().nullable(),
  unit: z.string().min(1).optional(),
  sell_price: z.number().positive().optional(),
  cost_price: z.number().optional().nullable(),
  duration_days: z.number().int().positive().optional(),
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
  const parsed = patchCatalogItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.type !== undefined) updateData.type = data.type;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.unit !== undefined) updateData.unit = data.unit;
  if (data.sell_price !== undefined) updateData.sellPrice = String(data.sell_price);
  if (data.cost_price !== undefined) updateData.costPrice = data.cost_price ? String(data.cost_price) : null;
  if (data.duration_days !== undefined) updateData.durationDays = data.duration_days;
  if (data.is_active !== undefined) updateData.isActive = data.is_active;
  if (data.notes !== undefined) updateData.notes = data.notes;

  const [updated] = await db
    .update(catalogItem)
    .set(updateData)
    .where(and(eq(catalogItem.id, id), eq(catalogItem.organizationId, orgId)))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ item: updated });
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
    .delete(catalogItem)
    .where(and(eq(catalogItem.id, id), eq(catalogItem.organizationId, orgId)))
    .returning();

  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ item: deleted });
}
