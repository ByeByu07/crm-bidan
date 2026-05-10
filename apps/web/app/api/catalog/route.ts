import { NextRequest, NextResponse } from "next/server";
import { db } from "@repo/db";
import { catalogItem } from "@repo/db/schema";
import { getActiveOrganizationId } from "@repo/auth/session";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

const createCatalogItemSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["product", "service"]),
  category: z.string().optional().nullable(),
  unit: z.string().min(1),
  sell_price: z.number().positive(),
  cost_price: z.number().optional().nullable(),
  duration_days: z.number().int().positive(),
  is_active: z.boolean().default(true),
  notes: z.string().optional().nullable(),
});

export async function GET() {
  const orgId = await getActiveOrganizationId();
  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await db
    .select()
    .from(catalogItem)
    .where(eq(catalogItem.organizationId, orgId))
    .orderBy(desc(catalogItem.createdAt));

  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const orgId = await getActiveOrganizationId();
  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createCatalogItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  const [newItem] = await db
    .insert(catalogItem)
    .values({
      id: crypto.randomUUID(),
      organizationId: orgId,
      name: data.name,
      type: data.type,
      category: data.category ?? null,
      unit: data.unit,
      sellPrice: String(data.sell_price),
      costPrice: data.cost_price ? String(data.cost_price) : null,
      durationDays: data.duration_days,
      isActive: data.is_active ?? true,
      notes: data.notes ?? null,
    })
    .returning();

  return NextResponse.json({ item: newItem }, { status: 201 });
}
