/**
 * One-time script to create QStash schedule for daily notifications.
 * Run: npx tsx scripts/setup-qstash-schedule.ts
 */
import { Client } from "@upstash/qstash";

const qstash = new Client({
  token: process.env.QSTASH_TOKEN!,
});

async function main() {
  const appUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000";

  const schedule = await qstash.schedules.create({
    destination: `${appUrl}/api/jobs/daily-notifications`,
    cron: "0 0 * * *", // 00:00 UTC = 07:00 WIB
  });

  console.log("Schedule created:", schedule.scheduleId);
}

main().catch(console.error);
