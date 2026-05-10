import { NextRequest, NextResponse } from "next/server";
import { db } from "@repo/db";
import { notificationLog, saleItem, catalogItem, patient } from "@repo/db/schema";
import { getActiveOrganizationId, getSession } from "@repo/auth/session";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { buildWaMessage } from "@/lib/wa-message";
import { qstash } from "@/lib/qstash";

const rescheduleSchema = z.object({
  scheduled_date: z.string().min(1),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const orgId = await getActiveOrganizationId();
  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = rescheduleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const scheduledDate = new Date(parsed.data.scheduled_date);

  // Find the existing notification log to get sale_item_id and patient_id
  const [existing] = await db
    .select()
    .from(notificationLog)
    .where(and(eq(notificationLog.id, id), eq(notificationLog.organizationId, orgId)))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Check if a pending notification already exists for this sale_item
  const existingPending = await db
    .select()
    .from(notificationLog)
    .where(
      and(
        eq(notificationLog.saleItemId, existing.saleItemId),
        eq(notificationLog.organizationId, orgId),
        eq(notificationLog.status, "pending")
      )
    )
    .limit(1);

  if (existingPending.length > 0) {
    return NextResponse.json(
      { error: "Sudah ada notifikasi pending untuk item ini" },
      { status: 409 }
    );
  }

  // Validate max reschedule days
  const [si] = await db
    .select()
    .from(saleItem)
    .where(eq(saleItem.id, existing.saleItemId))
    .limit(1);

  if (!si) {
    return NextResponse.json({ error: "Sale item not found" }, { status: 404 });
  }

  const [ci] = await db
    .select()
    .from(catalogItem)
    .where(eq(catalogItem.id, si.catalogItemId))
    .limit(1);

  const maxDays = ci ? Math.max(14, ci.durationDays) : 14;
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + maxDays);

  if (scheduledDate.getTime() > maxDate.getTime()) {
    return NextResponse.json(
      { error: `Jadwal maksimal ${maxDays} hari dari sekarang` },
      { status: 400 }
    );
  }

  // Fetch patient name for fresh WA message
  const [pat] = await db
    .select()
    .from(patient)
    .where(eq(patient.id, existing.patientId))
    .limit(1);

  const waMessage = buildWaMessage(
    pat?.name ?? "",
    ci?.name ?? "item",
    scheduledDate,
  );

  // Create new notification log for the same sale_item
  const [newNotification] = await db
    .insert(notificationLog)
    .values({
      id: crypto.randomUUID(),
      saleItemId: existing.saleItemId,
      patientId: existing.patientId,
      organizationId: orgId,
      scheduledDate,
      status: "pending",
      waMessage,
    })
    .returning();

  // Enqueue push notification
  try {
    const session = await getSession();
    if (session) {
      await qstash.publishJSON({
        url: `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}/api/jobs/send-push`,
        body: {
          userId: session.user.id,
          title: "Jadwal Diperbarui",
          body: `Follow-up untuk ${pat?.name ?? "pasien"} dijadwalkan pada ${scheduledDate.toLocaleDateString("id-ID")}.`,
          data: { screen: "notifications", type: "rescheduled" },
        },
      });
    }
  } catch (err) {
    console.error("Failed to enqueue reschedule push:", err);
    // Don't fail the request if push enqueue fails
  }

  return NextResponse.json({ notification: newNotification }, { status: 201 });
}
