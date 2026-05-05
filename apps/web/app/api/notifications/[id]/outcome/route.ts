import { NextRequest, NextResponse } from "next/server";
import { db } from "@repo/db";
import { notificationLog } from "@repo/db/schema";
import { getActiveOrganizationId } from "@repo/auth/session";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const outcomeSchema = z.object({
  outcome: z.enum(["bought", "ignored", "no_response"]),
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
  const parsed = outcomeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const [updated] = await db
    .update(notificationLog)
    .set({ outcome: parsed.data.outcome })
    .where(and(eq(notificationLog.id, id), eq(notificationLog.organizationId, orgId)))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
