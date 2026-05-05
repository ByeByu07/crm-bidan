import { NextRequest, NextResponse } from "next/server";
import { db } from "@repo/db";
import { drug } from "@repo/db/schema";
import { getActiveOrganizationId } from "@repo/auth/session";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";

const createDrugSchema = z.object({
  name: z.string().min(1),
  category: z.string().optional().nullable(),
  dispense_unit: z.string().min(1),
  package_unit: z.string().min(1),
  units_per_package: z.number().int().positive(),
  duration_per_dispense_unit: z.number().int().optional().nullable(),
  sell_price_per_dispense: z.number().positive(),
  buy_price_per_package: z.number().optional().nullable(),
  is_active: z.boolean().default(true),
  notes: z.string().optional().nullable(),
});

export async function GET() {
  const orgId = await getActiveOrganizationId();
  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const drugs = await db
    .select()
    .from(drug)
    .where(eq(drug.organizationId, orgId))
    .orderBy(desc(drug.createdAt));

  return NextResponse.json({ drugs });
}

export async function POST(request: NextRequest) {
  const orgId = await getActiveOrganizationId();
  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createDrugSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  const [newDrug] = await db
    .insert(drug)
    .values({
      id: crypto.randomUUID(),
      organizationId: orgId,
      name: data.name,
      category: data.category ?? null,
      dispenseUnit: data.dispense_unit,
      packageUnit: data.package_unit,
      unitsPerPackage: data.units_per_package,
      durationPerDispenseUnit: data.duration_per_dispense_unit ?? null,
      sellPricePerDispense: String(data.sell_price_per_dispense),
      buyPricePerPackage: data.buy_price_per_package ? String(data.buy_price_per_package) : null,
      isActive: data.is_active ?? true,
      notes: data.notes ?? null,
    })
    .returning();

  return NextResponse.json({ drug: newDrug }, { status: 201 });
}
