# AI Recommendation DB Cache (Option A)

## Context
Currently using client-side cache (12h staleTime via TanStack Query). 
For scale (>100 notifications/day), we need DB persistence to reduce API costs and improve load times.

## Todo
- [ ] Add `ai_recommendation` table to `packages/db/src/schema.ts`:
  ```ts
  export const aiRecommendation = pgTable("ai_recommendation", {
    id: text("id").primaryKey(),
    patientId: text("patient_id").notNull(),
    notificationLogId: text("notification_log_id"),
    content: text("content").notNull(),
    modelUsed: text("model_used").default("deepseek/deepseek-v4-flash"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  }, (table) => ({
    patientIdx: index("ai_recommendation_patient_idx").on(table.patientId),
    createdIdx: index("ai_recommendation_created_idx").on(table.createdAt),
  }));
  ```
- [ ] Create Drizzle migration (`npm run db:g` from `packages/db`)
- [ ] Add `AIRecommendation` interface to `packages/types/src/dashboard.ts`
- [ ] Update `/api/ai/recommendation` to check DB first (24h TTL: `createdAt > now() - interval '1 day'`)
- [ ] Implement cache invalidation on new transaction (delete old recommendations for patient)
- [ ] Update `useAiRecommendation` hook to prefer DB cache over client cache
- [ ] Add cleanup cron job to delete recommendations older than 30 days

## Notes
- This touches `packages/db` (Agent 2 boundary) — coordinate with schema owner
- Estimated API savings: ~50 calls/day at current scale, ~500+ at scale
- DB read latency: ~20ms vs AI API latency: ~500-2000ms
