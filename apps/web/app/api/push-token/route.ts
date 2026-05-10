import { NextRequest, NextResponse } from "next/server";
import { db } from "@repo/db";
import { userPushToken } from "@repo/db/schema";
import { auth } from "@repo/auth/server";
import { eq, and } from "drizzle-orm";

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { token } = await request.json();

  if (!token || !token.startsWith("ExponentPushToken[")) {
    return NextResponse.json(
      { error: "Invalid Expo push token" },
      { status: 400 }
    );
  }

  // Upsert: delete old token for this user+token combo if exists, then insert
  const existing = await db
    .select()
    .from(userPushToken)
    .where(
      and(
        eq(userPushToken.userId, session.user.id),
        eq(userPushToken.expoPushToken, token)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(userPushToken)
      .set({ updatedAt: new Date() })
      .where(eq(userPushToken.id, existing[0]!.id));
  } else {
    await db.insert(userPushToken).values({
      id: crypto.randomUUID(),
      userId: session.user.id,
      expoPushToken: token,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  return NextResponse.json({ success: true });
}
