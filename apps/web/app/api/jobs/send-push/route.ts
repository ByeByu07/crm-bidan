import { NextRequest, NextResponse } from "next/server";
import { Receiver } from "@upstash/qstash";
import { sendPushToUser } from "@/lib/push-service";

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
      url: `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}/api/jobs/send-push`,
    });

    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(body) as {
    userId: string;
    title: string;
    body: string;
    data?: Record<string, unknown>;
  };

  try {
    const result = await sendPushToUser(
      payload.userId,
      payload.title,
      payload.body,
      payload.data
    );
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    console.error("Push send failed:", err);
    return NextResponse.json(
      { error: "Failed to send push" },
      { status: 500 }
    );
  }
}
