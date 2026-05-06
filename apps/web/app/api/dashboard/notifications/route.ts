import { NextResponse } from "next/server";
import { db } from "@repo/db";
import { notificationLog, patient } from "@repo/db/schema";
import { getActiveOrganizationId } from "@repo/auth/session";
import { eq, and, or, gte, isNull } from "drizzle-orm";
import type { NotificationQueue, NotificationLogItem } from "@repo/types";
import { startOfToday, addDays, isOverdue } from "@repo/utils";

export async function GET() {
  const orgId = await getActiveOrganizationId();
  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = startOfToday();
  const weekEnd = addDays(today, 7);

  // Fetch only notification logs we actually need:
  // - All pending (for scheduled list + counts)
  // - All sent without outcome (for sentPending list)
  // - All sent today (for completedToday list)
  // Join patients in the same query to avoid N+1 / memory bloat.
  const rows = await db
    .select()
    .from(notificationLog)
    .leftJoin(patient, eq(notificationLog.patientId, patient.id))
    .where(
      and(
        eq(notificationLog.organizationId, orgId),
        or(
          eq(notificationLog.status, "pending"),
          and(eq(notificationLog.status, "sent"), isNull(notificationLog.outcome)),
          and(eq(notificationLog.status, "sent"), gte(notificationLog.sentAt, today))
        )
      )
    );

  const enriched: NotificationLogItem[] = rows.map((r) => ({
    ...r.notification_log,
    patientName: r.patient?.name ?? "",
    whatsappNumber: r.patient?.whatsappNumber ?? "",
  } as NotificationLogItem));

  const todayCount = enriched.filter((l) => {
    const sd = new Date(l.scheduledDate);
    return l.status === "pending" && sd.getTime() >= today.getTime() && sd.getTime() < addDays(today, 1).getTime();
  }).length;

  const overdueCount = enriched.filter((l) => l.status === "pending" && isOverdue(l.scheduledDate)).length;

  const thisWeekCount = enriched.filter((l) => {
    const sd = new Date(l.scheduledDate);
    return l.status === "pending" && sd.getTime() >= today.getTime() && sd.getTime() <= weekEnd.getTime();
  }).length;

  const scheduled = enriched
    .filter((l) => {
      const sd = new Date(l.scheduledDate);
      return l.status === "pending"
        && sd.getTime() >= today.getTime()
        && sd.getTime() < addDays(today, 1).getTime();
    })
    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());

  const sentPending = enriched
    .filter((l) => l.status === "sent" && !l.outcome)
    .sort((a, b) => new Date(a.sentAt ?? a.scheduledDate).getTime() - new Date(b.sentAt ?? b.scheduledDate).getTime());

  const completedToday = enriched.filter((l) => {
    if (!l.sentAt) return false;
    const sent = new Date(l.sentAt);
    return sent.getTime() >= today.getTime() && sent.getTime() < addDays(today, 1).getTime();
  });

  const result: NotificationQueue = {
    today: todayCount,
    overdue: overdueCount,
    thisWeek: thisWeekCount,
    scheduled,
    sentPending,
    completedToday,
  };

  return NextResponse.json(result);
}
