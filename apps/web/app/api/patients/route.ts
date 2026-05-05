import { NextRequest, NextResponse } from "next/server";
import { db } from "@repo/db";
import { patient } from "@repo/db/schema";
import { getActiveOrganizationId } from "@repo/auth/session";
import { ilike, eq, and, desc } from "drizzle-orm";
import { z } from "zod";

const createPatientSchema = z.object({
  name: z.string().min(1),
  whatsapp_number: z.string().optional(),
  birth_date: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function GET(request: NextRequest) {
  const orgId = await getActiveOrganizationId();
  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";

  const patients = await db
    .select()
    .from(patient)
    .where(and(eq(patient.organizationId, orgId), ilike(patient.name, `%${q}%`)))
    .orderBy(desc(patient.createdAt));

  return NextResponse.json({ patients });
}

export async function POST(request: NextRequest) {
  const orgId = await getActiveOrganizationId();
  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createPatientSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { name, whatsapp_number, birth_date, location, notes } = parsed.data;

  const [newPatient] = await db
    .insert(patient)
    .values({
      id: crypto.randomUUID(),
      organizationId: orgId,
      name,
      whatsappNumber: whatsapp_number ?? null,
      birthDate: birth_date ?? null,
      location: location ?? null,
      notes: notes ?? null,
    })
    .returning();

  return NextResponse.json({ patient: newPatient }, { status: 201 });
}
