import { NextResponse } from "next/server";
import { db } from "@repo/db";
import { notificationLog, patient, saleItem, catalogItem } from "@repo/db/schema";
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

  // Fetch notification logs with patient and catalog item info
  const rows = await db
    .select()
    .from(notificationLog)
    .leftJoin(patient, eq(notificationLog.patientId, patient.id))
    .leftJoin(saleItem, eq(notificationLog.saleItemId, saleItem.id))
    .leftJoin(catalogItem, eq(saleItem.catalogItemId, catalogItem.id))
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
    catalogItemName: r.catalog_item?.name ?? "",
    catalogItemDurationDays: r.catalog_item?.durationDays ?? 14,
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
