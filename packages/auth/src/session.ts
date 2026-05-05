import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./server";
import { db } from "@repo/db";
import { member } from "@repo/db/schema";
import { eq } from "drizzle-orm";

export async function getSession() {
  return await auth.api.getSession({
    headers: await headers(),
  });
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    redirect("/signin");
  }
  return session;
}

export async function getActiveOrganizationId(): Promise<string | null> {
  const session = await getSession();
  if (!session) return null;

  const activeId = (session as Record<string, unknown>)?.activeOrganizationId as string | undefined;
  if (activeId) return activeId;

  // Fallback: pick the user's first organization
  const memberships = await db
    .select()
    .from(member)
    .where(eq(member.userId, session.user.id))
    .limit(1);

  return memberships[0]?.organizationId ?? null;
}
