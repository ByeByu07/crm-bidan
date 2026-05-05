# BidanCRM — Parallel Agent Execution Plan

## Project Overview

- **Monorepo:** Turborepo with npm workspaces
- **App:** `apps/web` (Next.js 15 App Router)
- **Database:** Neon PostgreSQL via Drizzle ORM
- **Auth:** better-auth with organization plugin + Resend
- **UI:** shadcn/ui with Midnight Bloom theme
- **State:** TanStack Query v5

## Execution Phases

### Phase 1 — Foundation (Parallel Safe)

Agents 1-4 run simultaneously. Zero file overlap.

| Agent       | Scope       | Owned Paths                                                                               |
| ----------- | ----------- | ----------------------------------------------------------------------------------------- |
| **Agent 1** | Foundation  | `packages/types/**`, `packages/utils/**`, rename `packages/better-auth` → `packages/auth` |
| **Agent 2** | Database    | `packages/db/**` (exclusive)                                                              |
| **Agent 3** | Auth Config | `packages/auth/src/**` (exclusive)                                                        |
| **Agent 4** | UI + Theme  | `packages/ui/**` (exclusive)                                                              |

### Phase 2 — API + Services (Parallel Safe)

| Agent       | Scope           | Owned Paths                                                                            |
| ----------- | --------------- | -------------------------------------------------------------------------------------- |
| **Agent 5** | Web API + Hooks | `apps/web/app/api/**`, `apps/web/lib/**`, `apps/web/providers/**`, `apps/web/hooks/**` |

### Phase 3 — Frontend Pages (Sequential, last)

| Agent       | Scope     | Owned Paths                                                                                 |
| ----------- | --------- | ------------------------------------------------------------------------------------------- |
| **Agent 6** | Web Pages | `apps/web/app/(auth)/**`, `apps/web/app/(dashboard)/**`, `apps/web/components/dashboard/**` |

---

## Agent 1 — Foundation (packages/types, packages/utils, auth rename)

### Tasks

1. Create `packages/types/`
   - `package.json` (name: `@repo/types`, private, type: module)
   - `tsconfig.json` extends `@repo/typescript-config/base`
   - `src/index.ts` re-export
   - `src/auth.ts` — auth-related types (SessionUser, Organization, etc.)
   - `src/dashboard.ts` — all domain types per PRD:
     - `Patient`, `PatientCondition`, `Drug`, `Transaction`, `SaleItem`, `NotificationLog`
     - `SalesPeriod`, `DashboardSalesData`, `NotificationPayload`, `PatientFeatures`
2. Create `packages/utils/`
   - `package.json` (name: `@repo/utils`, private, type: module)
   - `tsconfig.json`
   - `src/index.ts` re-export
   - `src/date.ts` — date-fns wrappers for WIB, addDays, formatDate
   - `src/format.ts` — currency IDR formatter, phone E.164 formatter
   - `src/calc.ts` — `calculateSubtotal`, `calculateDurationDays`, `calculateNextExpectedBuy`, `calculateConsumptionRate`, `calculateChangePercent`
3. Rename `packages/better-auth/` → `packages/auth/`
   - Update folder name
   - Update `package.json` name from `@repo/better-auth` → `@repo/auth`
   - Update any internal imports
4. Update root `package.json` workspaces if needed
5. Update `apps/web/package.json` dependency from `@repo/better-auth` → `@repo/auth`

> **Note:** If `packages/better-auth` cannot be renamed due to file locks, create `packages/auth` as a new folder and manually delete `packages/better-auth` later when unlocked.

### Boundary Rules

- **DO NOT** touch `packages/db/**`, `packages/ui/**`, `apps/web/**` (except one dep rename in package.json)
- **DO NOT** implement auth logic (Agent 3 does that)

---

## Agent 2 — Database Schema (packages/db)

### Tasks

1. **Completely rewrite** `packages/db/src/schema.ts`
   - Drop ALL old SMS tables: `smsProviders`, `providerPricing`, `campaigns`, `providerCampaigns`, `userCampaigns`, `smsMessages`, `creditTransactions`, `paymentTransactions`, `smsBatches`, `providerConfigs`, `apikey`
   - Keep better-auth core tables: `user`, `session`, `account`, `verification`
   - Add better-auth organization tables: `organization`, `member`, `invitation`
   - Add PRD domain tables: `patient`, `patient_condition`, `drug`, `transaction`, `sale_item`, `notification_log`
   - All domain tables MUST include `organization_id` text FK
2. Update `packages/db/src/index.ts` to export new schema
3. Create `packages/db/drizzle.config.ts` if missing
4. Ensure relations are defined for all tables

### Schema Tables (PRD v1.0)

| Table               | Key Columns                                                                                                                                                                                   |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `user`              | id, name, email, emailVerified, image, role, banned, banReason, banExpires, createdAt, updatedAt                                                                                              |
| `session`           | id, expiresAt, token, userId, createdAt, updatedAt, ipAddress, userAgent, impersonatedBy                                                                                                      |
| `account`           | id, accountId, providerId, userId, accessToken, refreshToken, idToken, accessTokenExpiresAt, refreshTokenExpiresAt, scope, password, createdAt, updatedAt                                     |
| `verification`      | id, identifier, value, expiresAt, createdAt, updatedAt                                                                                                                                        |
| `organization`      | id, name, slug, logo, metadata, createdAt                                                                                                                                                     |
| `member`            | id, organizationId, userId, role, createdAt                                                                                                                                                   |
| `invitation`        | id, organizationId, email, role, status, expiresAt, inviterId, createdAt                                                                                                                      |
| `patient`           | id, organization_id, name, whatsapp_number, birth_date, location, notes, created_at                                                                                                           |
| `patient_condition` | id, patient_id, condition, start_date, end_date, notes                                                                                                                                        |
| `drug`              | id, organization_id, name, category, dispense_unit, package_unit, units_per_package, duration_per_dispense_unit, sell_price_per_dispense, buy_price_per_package, is_active, notes, created_at |
| `transaction`       | id, organization_id, patient_id, purchase_date, patient_condition, total_price, notes, created_at                                                                                             |
| `sale_item`         | id, transaction_id, drug_id, quantity_dispense, price_per_dispense, subtotal, duration_days, next_expected_buy, actual_next_buy, consumption_rate                                             |
| `notification_log`  | id, sale_item_id, patient_id, organization_id, scheduled_date, status, sent_at, outcome, wa_message, created_at                                                                               |

### Boundary Rules

- **DO NOT** touch `packages/auth/**`, `packages/ui/**`, `apps/web/**`
- **DO NOT** write migration files yet (wait for schema finalization)

---

## Agent 3 — Auth Configuration (packages/auth)

### Tasks

1. Rewrite `packages/auth/src/auth.ts`
   - Use `betterAuth()` with:
     - `database: drizzleAdapter(db, { provider: "pg", schema })`
     - `emailAndPassword: { enabled: true, autoSignIn: true }`
     - `emailVerification` with Resend
     - `organization` plugin (better-auth built-in)
     - Post-signup hook: auto-create organization using clinic_name
   - Remove old SMS fields (`creditBalance`, `webhookUrl`, `apiKey`, `admin` plugins)
   - Proper `trustedOrigins` for Vercel + localhost:3000
   - `secret` from `process.env.BETTER_AUTH_SECRET`
2. Rewrite `packages/auth/src/auth-client.ts`
   - Use `createAuthClient` from `better-auth/react`
   - Include `organizationClient()` plugin
   - Base URL auto-detect (production vs localhost:3000)
3. Create `packages/auth/src/middleware.ts`
   - Export `getSession()` helper for API routes
   - Export `requireAuth()` helper that redirects to /signin
   - Export `getActiveOrganizationId()` from session

### Boundary Rules

- **DO NOT** touch `packages/db/src/schema.ts` (use types only, rely on Agent 2's final schema)
- **DO NOT** touch UI or pages

---

## Agent 4 — UI Package + Theme (packages/ui)

### Tasks

1. Apply **Midnight Bloom** theme

   ```bash
   npx shadcn@latest add https://tweakcn.com/r/themes/midnight-bloom.json
   ```

   - Update `packages/ui/src/styles/globals.css` with new CSS variables

2. Install required shadcn components:
   - button, input, label, select, dialog, dropdown-menu, table, card, badge, avatar, tabs, calendar, popover, command, textarea, switch, sonner, sheet, scroll-area
3. Install `recharts` for charts
4. Update `packages/ui/package.json` exports to cover new components/hooks
5. Add chart primitives if needed (e.g., `chart-container.tsx`)

### Boundary Rules

- **DO NOT** touch `packages/db/**`, `packages/auth/**`, `apps/web/**`
- Only modify `packages/ui/**`

---

## Agent 5 — Web API + Services (apps/web)

### Tasks

1. Install deps in `apps/web`:
   ```bash
   npm install @tanstack/react-query zod resend recharts
   ```
2. Create `apps/web/providers/query-provider.tsx`
   - TanStack Query client with staleTime defaults
3. Create `apps/web/lib/notification-service.ts`
   - `NotificationService` interface
   - `waDeepLinkService` MVP implementation (wa.me deep link)
4. Create `apps/web/lib/prediction-service.ts`
   - `PredictionService` interface
   - `ruleBasedPredictor` MVP implementation
5. Create `apps/web/lib/wa-message.ts`
   - `buildWaMessage(patientName, drugName, nextExpectedBuy)` template
6. Create `apps/web/lib/feature-extractor.ts`
   - Stub function `extractFeatures(patientId, drugId, orgId)` returning `PatientFeatures`
7. Create API routes per PRD Section 7:
   - `app/api/auth/[...all]/route.ts` — better-auth handler
   - `app/api/patients/route.ts` — GET (search), POST (create)
   - `app/api/drugs/route.ts` — GET (list), POST (create)
   - `app/api/drugs/[id]/route.ts` — PATCH (update)
   - `app/api/transactions/route.ts` — POST (create transaction + sale_items + notif_logs)
   - `app/api/dashboard/sales/route.ts` — GET (revenue aggregates)
   - `app/api/dashboard/notifications/route.ts` — GET (notification queue)
   - `app/api/notifications/[id]/send/route.ts` — PATCH (mark sent)
   - `app/api/notifications/[id]/outcome/route.ts` — PATCH (set outcome)
   - `app/api/profile/route.ts` — GET, PATCH
8. Create hooks in `apps/web/hooks/`:
   - `useSales(period)`, `useNotifications()`, `useDrugs()`, `usePatients(search)`, `useCreateTransaction()`, `useSendNotification()`, `useSetOutcome()`

### API Route Contracts

| Method | Route                                    | Body                                                                    | Response                                                           |
| ------ | ---------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------ |
| GET    | `/api/patients?q=`                       | —                                                                       | `{ patients: Patient[] }`                                          |
| POST   | `/api/patients`                          | `{ name, whatsapp_number, birth_date?, location?, notes? }`             | `{ patient: Patient }`                                             |
| GET    | `/api/drugs`                             | —                                                                       | `{ drugs: Drug[] }`                                                |
| POST   | `/api/drugs`                             | Drug form fields                                                        | `{ drug: Drug }`                                                   |
| PATCH  | `/api/drugs/[id]`                        | Partial Drug                                                            | `{ drug: Drug }`                                                   |
| POST   | `/api/transactions`                      | `{ patient_id, purchase_date, patient_condition, notes, items: [...] }` | `{ transaction: Transaction }`                                     |
| GET    | `/api/dashboard/sales?period=1m\|3m\|6m` | —                                                                       | `{ revenue, comparison, transactions, activePatients, chartData }` |
| GET    | `/api/dashboard/notifications`           | —                                                                       | `{ today, overdue, thisWeek, notifications: NotificationLog[] }`   |
| PATCH  | `/api/notifications/[id]/send`           | —                                                                       | `{ success }`                                                      |
| PATCH  | `/api/notifications/[id]/outcome`        | `{ outcome }`                                                           | `{ success }`                                                      |
| GET    | `/api/profile`                           | —                                                                       | `{ name, email, clinic_name, location }`                           |
| PATCH  | `/api/profile`                           | `{ clinic_name, location }`                                             | `{ success }`                                                      |

### Boundary Rules

- **DO NOT** touch `packages/**`
- **DO NOT** create page components (Agent 6 does that)
- Only create API routes, service stubs, providers, and hooks

---

## Agent 6 — Web Frontend Pages (apps/web)

### Tasks

1. Create `(auth)/` group pages:
   - `signin/page.tsx` — Email + password form
   - `signup/page.tsx` — Name, clinic name, email, password, confirm password
   - `forgot-password/page.tsx` — Email input
   - `reset-password/page.tsx` — Token + new password
2. Create `(dashboard)/layout.tsx`
   - Persistent bottom nav (5 tabs: Penjualan, Transaksi, Notifikasi, Obat, Profil)
   - Active tab highlight with Midnight Bloom accent
   - Use Next.js `usePathname()`
3. Create dashboard pages:
   - `sales/page.tsx` — Metric cards (2x2), bar chart, top products, time filter tabs
   - `transactions/new/page.tsx` — Transaction form with patient/drug comboboxes, auto-calc
   - `notifications/page.tsx` — Summary pills, notification lists, Kirim WA button, outcome buttons
   - `drugs/page.tsx` — Drug catalog list, filter chips, FAB, drug form modal
   - `profile/page.tsx` — Personal info, clinic info, logout
4. Create dashboard components:
   - `BottomNav`, `MetricCard`, `SalesChart`, `TransactionForm`, `DrugCombobox`, `PatientCombobox`, `NotificationCard`, `DrugCard`, `QuickAddPatientModal`

### Boundary Rules

- **DO NOT** touch `app/api/**`, `lib/**` (except reading), `packages/**`
- Only import from `@repo/ui`, `@repo/auth`, and use hooks from Agent 5

---

## Dependency Graph

```
Agent 1 (Foundation)
    │
    ├──→ Agent 3 can start (needs types, auth rename)
    │
Agent 2 (DB Schema)
    │
    ├──→ Agent 3 needs final schema shape
    │
Agent 3 (Auth Config)
    │
    ├──→ Agent 5 needs auth session helpers
    │
Agent 4 (UI + Theme)
    │
    ├──→ Agent 6 needs UI components
    │
Agent 5 (API + Hooks)
    │
    ├──→ Agent 6 needs hooks and API contracts
    │
Agent 6 (Pages) ← LAST
```

---

## Environment Variables Needed

Create `.env.local` in `apps/web/`:

```env
# Database
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require

# Better Auth
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_TRUSTED_ORIGINS=http://localhost:3000

# Resend
RESEND_API_KEY=re_xxxxxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com

# (Phase 2) Vertex AI
VERTEX_AI_ENDPOINT=https://...
```

---

## Verification Checklist

- [ ] `npm install` succeeds from root
- [ ] `turbo run check-types` passes
- [ ] `turbo run build` passes
- [ ] `apps/web` dev server starts on :3000
- [ ] Auth signin/signup pages render
- [ ] Dashboard layout with bottom nav renders
- [ ] All API routes respond correctly
- [ ] Database schema generates without errors (`npm run db:g` from packages/db)

---

## Notes for Agents

1. **No overlapping file edits.** If two agents need the same file, the later-phase agent creates it.
2. **Use `@repo/*` imports** for internal packages.
3. **Follow PRD naming conventions** for tables, routes, and enums.
4. **organization_id filtering** — all domain queries MUST filter by `organization_id` from session. Never accept org ID from client params.
5. **MVP only** — Do not implement Phase 2 features (WA Business API, Vertex AI, Cron jobs). Only create stubs/interfaces.
