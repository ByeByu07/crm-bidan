import { NextRequest, NextResponse } from "next/server";
import { db } from "@repo/db";
import { user, organization, member } from "@repo/db/schema";
import { getSession } from "@repo/auth/session";
import { eq } from "drizzle-orm";
import { z } from "zod";

const patchProfileSchema = z.object({
  clinic_name: z.string().optional(),
  location: z.string().optional().nullable(),
});

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [u] = await db.select().from(user).where(eq(user.id, session.user.id)).limit(1);
  if (!u) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Get first organization the user belongs to
  const memberships = await db
    .select()
    .from(member)
    .where(eq(member.userId, u.id))
    .limit(1);

  let orgName: string | null = null;
  let orgLocation: string | null = null;

  if (memberships.length > 0) {
    const [org] = await db
      .select()
      .from(organization)
      .where(eq(organization.id, memberships[0]!.organizationId))
      .limit(1);
    if (org) {
      orgName = org.name;
      try {
        const meta = org.metadata ? JSON.parse(org.metadata) : {};
        orgLocation = meta.location ?? null;
      } catch {
        orgLocation = null;
      }
    }
  }

  return NextResponse.json({
    name: u.name,
    email: u.email,
    clinic_name: orgName ?? "",
    location: orgLocation ?? "",
  });
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = patchProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { clinic_name, location } = parsed.data;

  // Update organization name and metadata
  const memberships = await db
    .select()
    .from(member)
    .where(eq(member.userId, session.user.id))
    .limit(1);

  if (memberships.length > 0 && clinic_name !== undefined) {
    const orgId = memberships[0]!.organizationId;
    const [org] = await db.select().from(organization).where(eq(organization.id, orgId)).limit(1);
    let metadata = {};
    try {
      metadata = org?.metadata ? JSON.parse(org.metadata) : {};
    } catch {
      metadata = {};
    }

    await db
      .update(organization)
      .set({
        name: clinic_name,
        metadata: JSON.stringify({ ...metadata, location: location ?? undefined }),
      })
      .where(eq(organization.id, orgId));
  }

  return NextResponse.json({ success: true });
}
