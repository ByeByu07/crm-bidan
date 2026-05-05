import { NextResponse } from "next/server";
import { db } from "@repo/db";
import { notificationLog, patient, drug, saleItem } from "@repo/db/schema";
import { getActiveOrganizationId } from "@repo/auth/session";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import type { NotificationQueue, NotificationLogItem } from "@repo/types";
import { startOfToday, addDays, isOverdue } from "@repo/utils";

export async function GET() {
  const orgId = await getActiveOrganizationId();
  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = startOfToday();
  const weekEnd = addDays(today, 7);

  const logs = await db
    .select()
    .from(notificationLog)
    .where(eq(notificationLog.organizationId, orgId));

  const patients = await db.select().from(patient).where(eq(patient.organizationId, orgId));
  const drugsList = await db.select().from(drug).where(eq(drug.organizationId, orgId));
  const saleItems = await db.select().from(saleItem);

  const patientMap = new Map(patients.map((p) => [p.id, p]));
  const drugMap = new Map(drugsList.map((d) => [d.id, d]));
  const saleItemMap = new Map(saleItems.map((s) => [s.id, s]));

  const enriched = logs.map((log) => {
    const pat = patientMap.get(log.patientId);
    const si = saleItemMap.get(log.saleItemId);
    const d = si ? drugMap.get(si.drugId) : undefined;
    return {
      ...log,
      patientName: pat?.name ?? "",
      whatsappNumber: pat?.whatsappNumber ?? "",
      drugName: d?.name ?? "",
    } as NotificationLogItem;
  });

  const todayCount = enriched.filter((l) => {
    const sd = new Date(l.scheduledDate);
    return (l.status as string) === "pending" && sd.getTime() >= today.getTime() && sd.getTime() < addDays(today, 1).getTime();
  }).length;

  const overdueCount = enriched.filter((l) => (l.status as string) === "pending" && isOverdue(l.scheduledDate)).length;

  const thisWeekCount = enriched.filter((l) => {
    const sd = new Date(l.scheduledDate);
    return (l.status as string) === "pending" && sd.getTime() >= today.getTime() && sd.getTime() <= weekEnd.getTime();
  }).length;

  const scheduled = enriched
    .filter((l) => (l.status as string) === "pending" && !isOverdue(l.scheduledDate))
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
