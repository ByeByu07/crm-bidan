import { NextRequest, NextResponse } from "next/server";
import { Receiver } from "@upstash/qstash";
import { db } from "@repo/db";
import { notificationLog, patient, member, organization } from "@repo/db/schema";
import { eq, and, gte, lt, isNull } from "drizzle-orm";
import { qstash } from "@/lib/qstash";
import { startOfToday, addDays } from "@repo/utils";

const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
});

export async function POST(request: NextRequest) {
  // Verify QStash signature
  const signature = request.headers.get("upstash-signature") ?? "";
  const body = await request.text();

  try {
    const isValid = await receiver.verify({
      body,
      signature,
      url: `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}/api/jobs/daily-notifications`,
    });

    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const today = startOfToday();
  const tomorrow = addDays(today, 1);

  try {
    // Find all pending notifications scheduled for today
    const rows = await db
      .select({
        orgId: notificationLog.organizationId,
        patientName: patient.name,
      })
      .from(notificationLog)
      .leftJoin(patient, eq(notificationLog.patientId, patient.id))
      .where(
        and(
          eq(notificationLog.status, "pending"),
          gte(notificationLog.scheduledDate, today),
          lt(notificationLog.scheduledDate, tomorrow),
          isNull(notificationLog.outcome)
        )
      );

    // Group by organization
    const orgMap = new Map<string, number>();
    for (const row of rows) {
      orgMap.set(row.orgId, (orgMap.get(row.orgId) ?? 0) + 1);
    }

    // Find owner for each org and enqueue push
    const results: Array<{ userId: string; count: number; status: string }> = [];

    for (const [orgId, count] of orgMap.entries()) {
      // Find the owner of this org
      const [owner] = await db
        .select({ userId: member.userId })
        .from(member)
        .where(
          and(
            eq(member.organizationId, orgId),
            eq(member.role, "owner")
          )
        )
        .limit(1);

      if (!owner) continue;

      const userId = owner.userId;

      try {
        await qstash.publishJSON({
          url: `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}/api/jobs/send-push`,
          body: {
            userId,
            title: "Tindak Lanjut Hari Ini",
            body: `Ada ${count} tindak lanjut yang perlu dilakukan hari ini.`,
            data: { screen: "notifications", type: "daily_due" },
          },
        });
        results.push({ userId, count, status: "queued" });
      } catch (err) {
        console.error(`Failed to enqueue push for org ${orgId}:`, err);
        results.push({ userId, count, status: "failed" });
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (err) {
    console.error("Daily notifications job failed:", err);
    return NextResponse.json(
      { error: "Job failed" },
      { status: 500 }
    );
  }
}
