import { NextRequest, NextResponse } from "next/server";
import { db } from "@repo/db";
import { condition } from "@repo/db/schema";
import { getActiveOrganizationId } from "@repo/auth/session";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

const createConditionSchema = z.object({
  name: z.string().min(1),
});

export async function GET() {
  const orgId = await getActiveOrganizationId();
  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const conditions = await db
    .select()
    .from(condition)
    .where(eq(condition.organizationId, orgId))
    .orderBy(desc(condition.createdAt));

  return NextResponse.json({ conditions });
}

export async function POST(request: NextRequest) {
  const orgId = await getActiveOrganizationId();
  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createConditionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: typeof parsed.error.flatten === "function" ? parsed.error.flatten() : parsed.error.message },
      { status: 400 }
    );
  }

  const [newCondition] = await db
    .insert(condition)
    .values({
      id: crypto.randomUUID(),
      organizationId: orgId,
      name: parsed.data.name,
    })
    .returning();

  return NextResponse.json({ condition: newCondition }, { status: 201 });
}
