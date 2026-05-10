import axios from "axios";
import { db } from "@repo/db";
import { userPushToken } from "@repo/db/schema";
import { eq } from "drizzle-orm";

export interface PushMessage {
  to: string;
  sound?: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export async function sendPushToUser(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<{ sent: number; failed: number }> {
  const tokens = await db
    .select()
    .from(userPushToken)
    .where(eq(userPushToken.userId, userId));

  if (tokens.length === 0) {
    return { sent: 0, failed: 0 };
  }

  const messages: PushMessage[] = tokens.map((t) => ({
    to: t.expoPushToken,
    sound: "default",
    title,
    body,
    data: data ?? {},
  }));

  const chunkSize = 100;
  let sent = 0;
  let failed = 0;
  const invalidTokens: string[] = [];

  for (let i = 0; i < messages.length; i += chunkSize) {
    const chunk = messages.slice(i, i + chunkSize);
    try {
      const res = await axios.post(
        "https://exp.host/--/api/v2/push/send",
        chunk,
        {
          headers: {
            Accept: "application/json",
            "Accept-Encoding": "gzip, deflate",
            "Content-Type": "application/json",
          },
        }
      );

      const results = res.data.data as Array<{
        status: "ok" | "error";
        details?: { error?: string };
      }>;

      results.forEach((result, idx) => {
        if (result.status === "ok") {
          sent++;
        } else {
          failed++;
          if (
            result.details?.error === "DeviceNotRegistered" ||
            result.details?.error === "InvalidCredentials"
          ) {
            invalidTokens.push(chunk[idx]!.to);
          }
        }
      });
    } catch (err) {
      console.error("Expo push send failed:", err);
      failed += chunk.length;
    }
  }

  // Clean up invalid tokens
  for (const token of invalidTokens) {
    await db.delete(userPushToken).where(eq(userPushToken.expoPushToken, token));
  }

  return { sent, failed };
}
