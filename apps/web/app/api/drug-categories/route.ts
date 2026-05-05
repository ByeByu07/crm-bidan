import { NextRequest, NextResponse } from "next/server";
import { db } from "@repo/db";
import { drugCategory } from "@repo/db/schema";
import { getActiveOrganizationId } from "@repo/auth/session";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

const createDrugCategorySchema = z.object({
  name: z.string().min(1),
});

export async function GET() {
  const orgId = await getActiveOrganizationId();
  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const categories = await db
    .select()
    .from(drugCategory)
    .where(eq(drugCategory.organizationId, orgId))
    .orderBy(desc(drugCategory.createdAt));

  return NextResponse.json({ categories });
}

export async function POST(request: NextRequest) {
  const orgId = await getActiveOrganizationId();
  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createDrugCategorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: typeof parsed.error.flatten === "function" ? parsed.error.flatten() : parsed.error.message },
      { status: 400 }
    );
  }

  const [newCategory] = await db
    .insert(drugCategory)
    .values({
      id: crypto.randomUUID(),
      organizationId: orgId,
      name: parsed.data.name,
    })
    .returning();

  return NextResponse.json({ category: newCategory }, { status: 201 });
}
