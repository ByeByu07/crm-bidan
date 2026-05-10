# 2026-05-10-expo-push-notifications-qstash

Implementasi Expo Push Notifications dengan Upstash QStash untuk BidanCRM.

## Ringkasan

Menambahkan push notification ke mobile app (Expo WebView) menggunakan Upstash QStash sebagai queue + scheduler. Notifikasi dikirim ke bidan saat:
1. Follow-up dijadwalkan ulang (reschedule)
2. Notifikasi pending jatuh tempo hari ini (daily cron 07:00 WIB)

## Arsitektur

```
QStash Schedule (00:00 UTC = 07:00 WIB)
  → POST /api/jobs/daily-notifications
    → Query pending notifications hari ini
    → Publish ke QStash: POST /api/jobs/send-push
      → Verify QStash signature
      → Lookup Expo token user
      → Kirim ke Expo Push API
```

## Dependensi

- `@upstash/qstash` — QStash client
- `axios` — HTTP client untuk Expo API

## Environment Variables

### Required (Manual)

```env
# Database
DATABASE_URL=postgresql://...

# Better Auth
BETTER_AUTH_SECRET=oqGioXixcwGiUrCmFNofUrgbdtSyl89N
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_TRUSTED_ORIGINS=http://localhost:3000

# Resend (Email)
RESEND_API_KEY=<YOUR_RESEND_API_KEY>
RESEND_FROM_EMAIL=noreply@bidan-crm.vercel.app

# AI Gateway (Recommendations)
AI_GATEWAY_API_KEY=<YOUR_AI_GATEWAY_API_KEY>

# Upstash QStash (Push Notifications)
QSTASH_TOKEN=<YOUR_QSTASH_TOKEN>
QSTASH_CURRENT_SIGNING_KEY=<YOUR_QSTASH_CURRENT_SIGNING_KEY>
QSTASH_NEXT_SIGNING_KEY=<YOUR_QSTASH_NEXT_SIGNING_KEY>
```

### Auto-Set by Vercel (No need to add manually)

| Variable | Description |
|----------|-------------|
| `VERCEL_PROJECT_PRODUCTION_URL` | Custom domain: `crm-bidan.bayu-ai.dev` |
| `VERCEL_URL` | Deploy URL: `crm-bidan-bayu-ai-dev.vercel.app` |
| `VERCEL_ENV` | `production`, `preview`, or `development` |
| `NODE_ENV` | `production` or `development` |

## Schema

- [x] `packages/db/src/schema.ts` — Tambah `user_push_token` table
- [x] `packages/db/drizzle/0001_clever_forge.sql` — Generate migration

## API Routes

- [x] `apps/web/app/api/push-token/route.ts` — Register/upsert Expo token
- [x] `apps/web/app/api/jobs/send-push/route.ts` — QStash worker, kirim push via Expo
- [x] `apps/web/app/api/jobs/daily-notifications/route.ts` — Daily scan + enqueue

## Service Layer

- [x] `apps/web/lib/qstash.ts` — QStash client singleton
- [x] `apps/web/lib/push-service.ts` — Expo push sender (axios)

## Frontend

- [x] `apps/web/components/dashboard/NotificationCard.tsx` — Fix outcome bug (Tidak Jadi / Tidak Dihubungi)
- [x] `apps/web/app/(dashboard)/notifications/page.tsx` — Fix outcome saat Hentikan Follow-Up
- [x] `apps/web/app/layout.tsx` — Tambah `PushTokenProvider`
- [x] `apps/web/providers/push-token-provider.tsx` — `onExpoPushTokenReceived` handler

## Integration

- [x] `apps/web/app/api/notifications/[id]/reschedule/route.ts` — Enqueue push setelah reschedule

## QStash Schedule Setup

- [~] Script tersedia: `apps/web/scripts/setup-qstash-schedule.ts`
  - Schedule: `0 0 * * *` (00:00 UTC = 07:00 WIB)
  - Target: `POST {APP_URL}/api/jobs/daily-notifications`
  - **Belum di-run** — jalankan sekali dengan: `npx tsx scripts/setup-qstash-schedule.ts`

## Bug Fix: NotificationCard Outcome

**Masalah:** Saat ini tombol "Tidak Jadi" dan "Tidak Dihubungi" sama-sama memanggil `onReschedule()` tanpa set `outcome` pada notifikasi lama. Notifikasi lama menggantung di `sentPending`.

**Solusi:**
- `NotificationCard` sekarang passing `defaultOutcome` ke `onReschedule(id, defaultOutcome)`
- `NotificationsPage` tracking `rescheduleDefaultOutcome` state
- Saat "Hentikan Follow-Up" di-click:
  - Dari "Tidak Jadi" → `outcome = "ignored"`
  - Dari "Tidak Dihubungi" → `outcome = "no_response"`

## Verification

- [x] `npx tsc --noEmit` passes
- [x] `npm run build` passes
- [x] All routes registered correctly (see build output)

## Next Steps (Manual)

1. **Run migration ke Neon:**
   ```bash
   cd packages/db && npm run db:m
   ```

2. **Setup QStash Schedule (sekali saja):**
   ```bash
   cd apps/web
   npx tsx scripts/setup-qstash-schedule.ts
   ```
   Atau via curl:
   ```bash
   curl -X POST https://qstash-us-east-1.upstash.io/v2/schedules \
     -H "Authorization: Bearer $QSTASH_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "destination": "https://yourapp.com/api/jobs/daily-notifications",
       "cron": "0 0 * * *"
     }'
   ```

3. **Tambah env vars ke Vercel:**
   ```
QSTASH_TOKEN=<YOUR_QSTASH_TOKEN>
   QSTASH_CURRENT_SIGNING_KEY=sig_7cGde4C3K2ccyfLiV2sL7dbakx1z
   QSTASH_NEXT_SIGNING_KEY=sig_5seqAwA3FqkfTCVMoQ4oGT3FKAsR
# Vercel auto-sets this
VERCEL_PROJECT_PRODUCTION_URL=crm-bidan.bayu-ai.dev
   ```

## Notes

- QStash URL: https://qstash-us-east-1.upstash.io
- Max messages per Expo request: 100 (sudah di-handle dengan chunking)
- Invalid tokens (`DeviceNotRegistered`) akan dihapus otomatis
- Push message menggunakan bahasa Indonesia generic (bukan spesifik "obat")
