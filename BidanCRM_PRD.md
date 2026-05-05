**BidanCRM**

Product Requirements Document

*MVP v1.0 · May 2025*

*Nurse & Bidan CRM with XGBoost-Ready Notification Engine*

**1. Product Overview**

BidanCRM is a mobile-first web application for Indonesian midwives (bidan) and nurses to manage patient purchase history, automate drug restocking notifications via WhatsApp, and collect behavioral data that will power an XGBoost-based purchase prediction model in future iterations.

The system is designed with a clear separation between MVP functionality (rule-based) and future ML/WA integration (model-based), ensuring the codebase is plug-and-play for both upgrades.

**1.1 Problem Statement**

- Bidans manually track when patients need to restock drugs --- leading to missed follow-ups and lost revenue.

- No structured system exists to record patient purchase history in a small klinik context.

- Patient drop-off is hard to detect early without behavioral analytics.

**1.2 Solution**

- A 5-page mobile-first dashboard (4 core pages + profile) with bottom navigation.

- Rule-based WhatsApp notification trigger (day drug runs out).

- Data collection layer that passively builds training data for XGBoost in 6-12 months.

- Clean API design that allows plugging in WA Business API and XGBoost prediction endpoint without breaking changes.

**1.3 Users**

| **User**      | **Role**                            | **Access**                                          |
|---------------|-------------------------------------|-----------------------------------------------------|
| Bidan / Nurse | App owner, manages all data         | Full access via web app                             |
| Patient       | End user, receives WA notifications | No app login --- identified by WhatsApp number only |

**2. Tech Stack**

**2.1 MVP Stack (Now)**

| **Layer**             | **Technology**                   | **Purpose**                                         |
|-----------------------|----------------------------------|-----------------------------------------------------|
| Monorepo              | Turborepo                        | Manage apps and shared packages                     |
| Frontend              | Next.js 15 (App Router)          | Web app --- SSR + API routes                        |
| Deployment            | Vercel                           | Hosting + edge functions                            |
| UI                    | shadcn/ui + Midnight Bloom theme | Component library                                   |
| State / Data Fetching | TanStack Query v5                | Server state, caching, mutations                    |
| Auth                  | better-auth                      | Email/password + organization plugin                |
| ORM                   | Drizzle ORM                      | Type-safe database queries                          |
| Database              | Neon (PostgreSQL)                | Serverless Postgres                                 |
| Email                 | Resend                           | Auth emails (verification, reset password)          |
| WA (MVP)              | wa.me deep link                  | Manual trigger --- opens WA with pre-filled message |

**2.2 Phase 2 Stack (+3 Months)**

| **Addition**    | **Technology**                   | **Purpose**                             |
|-----------------|----------------------------------|-----------------------------------------|
| WhatsApp API    | WA Business API (Cloud API)      | Automated chatbot messaging to patients |
| ML Prediction   | Google Cloud Vertex AI (XGBoost) | Purchase likelihood prediction endpoint |
| Background Jobs | Vercel Cron + Queue              | Daily notification scheduling           |

**2.3 Turborepo Monorepo Structure**

> bidancrm/
>
> apps/
>
> web/ → Next.js app (frontend + API routes)
>
> packages/
>
> db/ → Drizzle schema, migrations, db client
>
> auth/ → better-auth config, shared auth utils
>
> ui/ → shared shadcn components
>
> types/ → shared TypeScript types
>
> utils/ → shared helpers (date, format, calc)

**3. Authentication**

**3.1 Provider**

Better-auth with:

- Email + password strategy

- Organization plugin --- on signup, a default organization is automatically created for the bidan (1 bidan = 1 org for MVP). Designed to support multi-staff (inviting assistant bidan) in Phase 2 without schema changes.

- Drizzle adapter for Neon/PostgreSQL

- Resend for transactional emails (verification, reset password)

**3.2 Auth Pages**

| **Page**        | **Route**        | **Description**                                      |
|-----------------|------------------|------------------------------------------------------|
| Sign In         | /signin          | Email + password login form                          |
| Sign Up         | /signup          | Name, clinic name, email, password, confirm password |
| Forgot Password | /forgot-password | Enter email → receive reset link via Resend          |
| Reset Password  | /reset-password  | Token from email → new password form                 |

**3.3 Sign Up Flow & Auto-Organization**

1.  User fills signup form (name, clinic name, email, password).

2.  better-auth creates user record.

3.  Post-signup hook automatically creates an organization named after clinic_name.

4.  User is set as owner of the organization.

5.  All subsequent data (patients, drugs, transactions) is scoped to organization_id.

6.  Verification email is sent via Resend. User must verify before accessing dashboard.

**3.4 Session & Route Protection**

- All /dashboard/\* routes are protected --- redirect to /signin if no session.

- Session includes organization_id --- all DB queries automatically filter by org.

- Auth config lives in packages/auth/index.ts and is imported by the web app.

**4. Database Schema**

**4.1 Schema Overview**

All tables include organization_id (from better-auth organization plugin) so data is always scoped per bidan clinic. Managed via Drizzle ORM in packages/db.

**4.2 Tables**

**4.2.1 patient**

| **Column**      | **Type**     | **Notes**                                          |
|-----------------|--------------|----------------------------------------------------|
| id              | uuid PK      | default gen_random_uuid()                          |
| organization_id | text FK      | Scopes patient to bidan org --- from better-auth   |
| name            | varchar(255) | Full name                                          |
| whatsapp_number | varchar(20)  | UNIQUE per org --- patient identifier, used for WA |
| birth_date      | date         | Optional --- used as age feature for XGBoost       |
| location        | varchar(255) | Kota / kecamatan                                   |
| notes           | text         | Bidan free notes                                   |
| created_at      | timestamp    | default now()                                      |

**4.2.2 patient_condition**

Tracks condition changes over time. No separate page --- written automatically on each transaction.

| **Column** | **Type** | **Notes**                                    |
|------------|----------|----------------------------------------------|
| id         | uuid PK  |                                              |
| patient_id | uuid FK  | → patient.id                                 |
| condition  | enum     | ibu_hamil \| ibu_menyusui \| umum \| lainnya |
| start_date | date     | When condition began                         |
| end_date   | date     | NULL = currently active                      |
| notes      | text     | e.g. \"hamil 7 bulan\"                       |

*Logic: on transaction save, check if selected condition differs from the last active patient_condition row. If different → set end_date on old row, insert new row. If same → do nothing.*

**4.2.3 drug**

Two-level unit system: bidan buys in package_unit (e.g. box), sells in dispense_unit (e.g. tablet).

| **Column**                 | **Type**      | **Notes**                                                     |
|----------------------------|---------------|---------------------------------------------------------------|
| id                         | uuid PK       |                                                               |
| organization_id            | text FK       | Scoped per bidan                                              |
| name                       | varchar(255)  | e.g. Vitamin D, Folic Acid                                    |
| category                   | enum          | vitamin \| suplemen \| KB \| obat \| lainnya                  |
| dispense_unit              | enum          | tablet \| kapsul \| botol \| ampul \| strip \| sachet \| tube |
| package_unit               | enum          | box \| strip \| botol \| blister \| dus                       |
| units_per_package          | integer       | e.g. 30 tablets per box                                       |
| duration_per_dispense_unit | integer       | Days of supply per 1 dispense unit. e.g. 1 tablet = 1 day     |
| sell_price_per_dispense    | decimal(12,2) | Price charged to patient per tablet/botol/etc                 |
| buy_price_per_package      | decimal(12,2) | Cost to bidan per box/strip/etc (for margin calc)             |
| is_active                  | boolean       | default true --- soft delete                                  |
| notes                      | text          | Optional extra info                                           |
| created_at                 | timestamp     | default now()                                                 |

*Derived formula (computed at transaction save):*

> duration_days = quantity_dispense × duration_per_dispense_unit
>
> next_expected_buy = purchase_date + duration_days

**4.2.4 transaction**

One row per patient visit. The receipt header.

| **Column**        | **Type**      | **Notes**                                                            |
|-------------------|---------------|----------------------------------------------------------------------|
| id                | uuid PK       |                                                                      |
| organization_id   | text FK       |                                                                      |
| patient_id        | uuid FK       | → patient.id                                                         |
| purchase_date     | date          | Default today --- bidan can adjust                                   |
| patient_condition | enum          | Snapshot at visit time: ibu_hamil \| ibu_menyusui \| umum \| lainnya |
| total_price       | decimal(12,2) | Auto-calculated: sum of sale_item.subtotal                           |
| notes             | text          | Optional bidan note                                                  |
| created_at        | timestamp     |                                                                      |

**4.2.5 sale_item**

One row per drug per transaction. Drives the entire notification engine.

| **Column**         | **Type**      | **Notes**                                             |
|--------------------|---------------|-------------------------------------------------------|
| id                 | uuid PK       |                                                       |
| transaction_id     | uuid FK       | → transaction.id                                      |
| drug_id            | uuid FK       | → drug.id                                             |
| quantity_dispense  | integer       | Units sold to patient (e.g. 30 tablets)               |
| price_per_dispense | decimal(12,2) | Snapshot of sell price at time of sale                |
| subtotal           | decimal(12,2) | Auto: quantity_dispense × price_per_dispense          |
| duration_days      | integer       | Auto: quantity_dispense × duration_per_dispense_unit  |
| next_expected_buy  | date          | Auto: purchase_date + duration_days                   |
| actual_next_buy    | date          | Filled when patient buys same drug again              |
| consumption_rate   | decimal(5,2)  | Auto: actual_days / duration_days --- XGBoost feature |

**4.2.6 notification_log**

One row per sale_item per notification cycle. Becomes XGBoost training data.

| **Column**      | **Type**  | **Notes**                                                         |
|-----------------|-----------|-------------------------------------------------------------------|
| id              | uuid PK   |                                                                   |
| sale_item_id    | uuid FK   | → sale_item.id                                                    |
| patient_id      | uuid FK   | → patient.id                                                      |
| organization_id | text FK   |                                                                   |
| scheduled_date  | date      | Auto: = sale_item.next_expected_buy                               |
| status          | enum      | scheduled \| sent \| failed \| skipped                            |
| sent_at         | timestamp | When WA was actually opened/triggered                             |
| outcome         | enum      | NULL \| bought \| ignored \| no_response --- future XGBoost label |
| wa_message      | text      | Pre-filled WA message snapshot                                    |
| created_at      | timestamp |                                                                   |

**5. Application Pages**

**5.1 App Shell & Navigation**

The app uses a persistent bottom navigation bar (5 items) rendered inside a shared layout at /dashboard/layout.tsx. All dashboard pages are children of this layout.

| **Tab** | **Icon**  | **Route**                   | **Label**  |
|---------|-----------|-----------------------------|------------|
| 1       | BarChart2 | /dashboard/sales            | Penjualan  |
| 2       | Receipt   | /dashboard/transactions/new | Transaksi  |
| 3       | Bell      | /dashboard/notifications    | Notifikasi |
| 4       | Pill      | /dashboard/drugs            | Obat       |
| 5       | User      | /dashboard/profile          | Profil     |

Active tab is highlighted using the Midnight Bloom theme accent color. Navigation state is driven by Next.js usePathname().

**5.2 Page 1 --- Sales & Revenue (/dashboard/sales)**

**Purpose**

Give bidan a monthly overview of revenue, transactions, and top-selling drugs with month-over-month comparison.

**Components**

- Time filter tabs: Bulan ini \| 3 Bulan \| 6 Bulan (default: Bulan ini)

- 4 metric cards in a 2×2 grid: Revenue bulan ini, vs last month (%), Transaction count, Active patients

- Bar chart: Monthly revenue for the selected period with % change annotation per bar

- Top products list: Drug name + revenue contribution + units sold

**Data & Queries**

> GET /api/dashboard/sales?period=1m\|3m\|6m

Server-side query aggregates from transaction and sale_item tables, filtered by organization_id and date range. Results cached by TanStack Query with 5 min stale time.

**Month-over-month Logic**

> change_pct = ((current_month - previous_month) / previous_month) \* 100

Displayed as +18% (green) or -5% (red) next to each metric card and each bar.

**5.3 Page 2 --- New Transaction (/dashboard/transactions/new)**

**Purpose**

Primary data entry page. Bidan records every patient purchase here. All downstream data (notification schedule, condition history, ML features) flows from this single form.

**Form Sections & Fields**

| **Section**  | **Fields**                                                                                                                                          | **Validation** |
|--------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|----------------|
| Patient      | Search by name or WA number --- combobox with autocomplete. If not found, inline \"Tambah Pasien Baru\" quick-create modal (name + WA required)     | Required       |
| Condition    | Select: Ibu hamil \| Ibu menyusui \| Umum \| Lainnya. Pre-filled from last known condition                                                          | Required       |
| Tanggal Beli | Date picker --- default today, can backdate                                                                                                         | Required       |
| Obat dibeli  | Drug multi-select via combobox. Each selected drug shows: qty input, price (auto from catalog), duration (auto), next_expected_buy (auto-displayed) | Min 1 drug     |
| Catatan      | Optional free text note                                                                                                                             | Optional       |

**Auto-Calculations (client-side, real-time)**

- subtotal per drug = quantity × sell_price_per_dispense

- duration_days = quantity × duration_per_dispense_unit

- next_expected_buy = purchase_date + duration_days (displayed below each drug line)

- total_price = sum of all subtotals

**On Save --- Server Actions**

7.  Validate all fields.

8.  INSERT into transaction table.

9.  For each drug: INSERT into sale_item with all auto-calculated fields.

10. For each sale_item: INSERT into notification_log (status: scheduled, scheduled_date: next_expected_buy, wa_message: pre-built string).

11. Check patient_condition: if condition changed vs last active → close old row (set end_date), insert new row.

12. For all previous sale_items of same patient+drug with actual_next_buy IS NULL: set actual_next_buy = today, calculate consumption_rate.

13. Invalidate TanStack Query caches for sales, notifications.

14. Redirect to /dashboard/transactions/new with success toast.

**Quick-Add Patient Modal**

If patient not found in search, bidan can fill a minimal form inline: name + WhatsApp number (required), birth_date + location (optional). Submits and auto-selects the new patient in the main form.

**5.4 Page 3 --- Notifications (/dashboard/notifications)**

**Purpose**

Show bidan which patients need to be contacted today, who is overdue, and collect outcome feedback. This page is the core of the notification feedback loop and XGBoost data collection.

**Sections**

- Summary bar: 3 metric pills --- Hari ini (count), Terlambat (count, red), Minggu ini (count)

- Belum dikirim list --- patients where scheduled_date \<= today AND status = scheduled

- Sudah dikirim --- outcome pending list (status = sent, outcome IS NULL)

- Selesai hari ini --- completed (outcome filled)

**Notification Card --- State Machine**

Each card moves through states:

> scheduled → \[Kirim WA clicked\] → sent → \[outcome selected\] → done

**\"Kirim WA\" Button --- MVP Behavior**

Opens wa.me deep link in new tab with pre-filled message (from notification_log.wa_message). Simultaneously, a server action updates notification_log: status = sent, sent_at = now(). Patient receives the message via standard WhatsApp.

*Phase 2 replacement: same server action will call WA Business API instead of opening wa.me --- no UI changes needed.*

**Outcome Feedback (after WA sent)**

After clicking Kirim WA, the card expands to show 3 outcome buttons:

| **Button**    | **Label**     | **DB Update**         | **Note**                                                              |
|---------------|---------------|-----------------------|-----------------------------------------------------------------------|
| Pasien beli   | Pasien beli   | outcome = bought      | Shortcut --- system also auto-sets this when new transaction recorded |
| Tidak beli    | Tidak beli    | outcome = ignored     | Patient declined or not interested                                    |
| Tidak respons | Tidak respons | outcome = no_response | Re-schedules a follow-up notification for +1 day                      |

*Auto-bought detection: when bidan records a new transaction, the system looks for any pending notification_log rows for that patient+drug and auto-sets outcome = bought without requiring manual click.*

**Rule-Based Trigger Query**

> SELECT nl.\*, p.name, p.whatsapp_number, d.name as drug_name
>
> FROM notification_log nl
>
> JOIN sale_item si ON si.id = nl.sale_item_id
>
> JOIN patient p ON p.id = nl.patient_id
>
> JOIN transaction t ON t.id = si.transaction_id
>
> JOIN drug d ON d.id = si.drug_id
>
> WHERE nl.organization_id = :org_id
>
> AND nl.scheduled_date \<= CURRENT_DATE
>
> AND nl.status = \'scheduled\'
>
> AND si.actual_next_buy IS NULL
>
> ORDER BY nl.scheduled_date ASC

**5.5 Page 4 --- Drug Catalog (/dashboard/drugs)**

**Purpose**

Bidan manages their drug product catalog. Each drug entry drives pricing, duration calculation, and notification scheduling across the entire app.

**List View**

- Search input --- filter by name or category

- Filter chips --- All \| Vitamin \| Suplemen \| KB \| Obat \| Lainnya

- Drug card per item showing: name, category badge, dispense_unit, duration, sell price, active/inactive status

- FAB (Floating Action Button) --- \"Tambah Obat\" → opens drug form

**Drug Form --- Fields**

| **Field**                           | **Input Type** | **Notes**                                                      |
|-------------------------------------|----------------|----------------------------------------------------------------|
| Name                                | Text input     | e.g. Vitamin D                                                 |
| Category                            | Select         | vitamin \| suplemen \| KB \| obat \| lainnya                   |
| Satuan jual (dispense_unit)         | Select         | tablet \| kapsul \| botol \| ampul \| strip \| sachet \| tube  |
| Satuan beli (package_unit)          | Select         | box \| strip \| botol \| blister \| dus                        |
| Isi per kemasan (units_per_package) | Number         | e.g. 30 → \"1 box = 30 tablet\"                                |
| Durasi per satuan jual              | Number         | Days per 1 dispense unit --- e.g. 1 = \"1 tablet lasts 1 day\" |
| Harga jual per satuan               | Currency input | Price charged to patient per tablet/botol                      |
| Harga beli per kemasan              | Currency input | Bidan purchase cost --- used for margin tracking               |
| Catatan                             | Textarea       | Optional notes                                                 |
| Status                              | Toggle         | Active / Inactive (soft delete)                                |

*Helper preview shown below form in real-time:*

> \"Jika pasien beli 30 tablet → durasi 30 hari → notifikasi pada hari ke-30\"

**5.6 Page 5 --- Profile (/dashboard/profile)**

**Sections**

- Personal info: name, email (read-only), change password button

- Clinic info: clinic_name, location --- editable

- Danger zone: logout button

*Phase 2 addition: invite staff member to organization (multi-bidan support).*

**6. Code Architecture & Scalability Design**

**6.1 Folder Structure (apps/web)**

> apps/web/
>
> app/
>
> (auth)/
>
> signin/page.tsx
>
> signup/page.tsx
>
> forgot-password/page.tsx
>
> reset-password/page.tsx
>
> (dashboard)/
>
> layout.tsx → shell + bottom nav
>
> sales/page.tsx
>
> transactions/
>
> new/page.tsx
>
> notifications/page.tsx
>
> drugs/page.tsx
>
> profile/page.tsx
>
> api/
>
> auth/\[\...all\]/route.ts → better-auth handler
>
> dashboard/
>
> sales/route.ts
>
> notifications/route.ts
>
> transactions/route.ts
>
> drugs/route.ts
>
> patients/route.ts
>
> page.tsx → main landing page (Next.js template)
>
> components/
>
> ui/ → shadcn components
>
> dashboard/ → app-specific components
>
> lib/
>
> notification-service.ts → plug-in point for WA API
>
> prediction-service.ts → plug-in point for XGBoost
>
> wa-message.ts → message template builder

**6.2 Plug-in Point: Notification Service**

The notification trigger is abstracted behind a service interface so swapping wa.me for WA Business API requires only changing the implementation, not the call sites.

> // lib/notification-service.ts
>
> export interface NotificationService {
>
> send(payload: NotificationPayload): Promise\<NotificationResult\>
>
> }
>
> // MVP implementation
>
> export const waDeepLinkService: NotificationService = {
>
> async send(payload) {
>
> const url = buildWaUrl(payload.phone, payload.message)
>
> return { status: \"sent\", url } // frontend opens this url
>
> }
>
> }
>
> // Phase 2 --- swap this in, no other code changes needed
>
> export const waBusinessApiService: NotificationService = {
>
> async send(payload) {
>
> const res = await fetch(\"https://graph.facebook.com/v18.0/\.../messages\", {\...})
>
> return { status: res.ok ? \"sent\" : \"failed\" }
>
> }
>
> }

**6.3 Plug-in Point: Prediction Service**

XGBoost prediction is called through a prediction service abstraction. MVP returns a rule-based score (days overdue / duration). Phase 2 calls Google Cloud Vertex AI.

> // lib/prediction-service.ts
>
> export interface PredictionService {
>
> predict(features: PatientFeatures): Promise\<number\> // 0.0 - 1.0
>
> }
>
> // MVP --- simple rule-based score
>
> export const ruleBasedPredictor: PredictionService = {
>
> async predict(features) {
>
> const rate = features.daysSinceLastBuy / features.drugDurationDays
>
> return Math.min(rate, 1.0)
>
> }
>
> }
>
> // Phase 2 --- Vertex AI XGBoost endpoint
>
> export const vertexAiPredictor: PredictionService = {
>
> async predict(features) {
>
> const res = await fetch(process.env.VERTEX_AI_ENDPOINT, {
>
> method: \"POST\", body: JSON.stringify({ instances: \[features\] })
>
> })
>
> const { predictions } = await res.json()
>
> return predictions\[0\]
>
> }
>
> }

**6.4 XGBoost Feature Extraction**

When Phase 2 launches, this function extracts features from existing DB data --- no new columns needed, everything is already collected.

> // lib/feature-extractor.ts
>
> export async function extractFeatures(
>
> patientId: string, drugId: string, orgId: string
>
> ): Promise\<PatientFeatures\> {
>
> return {
>
> daysSinceLastBuy, // from sale_item.purchase_date
>
> drugDurationDays, // from drug.duration_per_dispense_unit × qty
>
> consumptionRate, // from sale_item.consumption_rate history
>
> totalPurchasesLifetime, // count of sale_items for this patient+drug
>
> avgIntervalBetweenBuys, // avg days between consecutive purchases
>
> purchaseStreak, // consecutive months with a buy
>
> ignoreRateLast3Months, // notification_log outcome = ignored / total
>
> previousOutcome, // last notification_log.outcome
>
> patientCondition, // from patient_condition (current)
>
> drugCategory, // from drug.category
>
> drugPrice, // from drug.sell_price_per_dispense
>
> patientAge, // derived from patient.birth_date
>
> }
>
> }

**6.5 TanStack Query Conventions**

| **Query Key**                   | **Endpoint**                     | **Stale Time** |
|---------------------------------|----------------------------------|----------------|
| \[\"sales\", period\]           | GET /api/dashboard/sales?period= | 5 min          |
| \[\"notifications\", orgId\]    | GET /api/dashboard/notifications | 1 min          |
| \[\"drugs\", orgId\]            | GET /api/drugs                   | 10 min         |
| \[\"patients\", orgId, search\] | GET /api/patients?q=             | 2 min          |
| \[\"transaction\", id\]         | GET /api/transactions/:id        | 10 min         |

Mutations call invalidateQueries on related keys after success. All queries include organization_id from session --- never passed as URL param from client.

**7. API Route Reference**

| **Method** | **Route**                      | **Description**                              |
|------------|--------------------------------|----------------------------------------------|
| GET        | /api/dashboard/sales           | Revenue + comparison data                    |
| GET        | /api/dashboard/notifications   | Notification queue for today                 |
| GET        | /api/patients                  | Search patients by name or WA                |
| POST       | /api/patients                  | Create new patient                           |
| GET        | /api/drugs                     | List all drugs for org                       |
| POST       | /api/drugs                     | Add new drug                                 |
| PATCH      | /api/drugs/:id                 | Update drug                                  |
| POST       | /api/transactions              | Create transaction + sale_items + notif_logs |
| PATCH      | /api/notifications/:id/send    | Mark as sent, update status                  |
| PATCH      | /api/notifications/:id/outcome | Set outcome (bought/ignored/no_response)     |
| GET        | /api/profile                   | Get bidan + clinic info                      |
| PATCH      | /api/profile                   | Update clinic info                           |

**8. Phase 2 Upgrade Plan (+3 Months)**

**8.1 WhatsApp Business API**

- Replace waDeepLinkService with waBusinessApiService in lib/notification-service.ts.

- Add Vercel Cron job that runs daily at 08:00 WIB --- queries notifications due today and auto-sends WA messages without bidan needing to click.

- Patient replies (Yes/No) are parsed by a webhook → auto-update outcome in notification_log.

- No schema changes required --- notification_log already has all needed columns.

**8.2 XGBoost on Vertex AI**

- Train model on notification_log data after 6+ months (outcome as label, extracted features as X).

- Deploy to Google Cloud Vertex AI as a prediction endpoint.

- Replace ruleBasedPredictor with vertexAiPredictor in lib/prediction-service.ts.

- Notification page shows prediction score per patient --- allowing bidan to prioritize high-churn-risk patients for personal follow-up over chatbot message.

- No schema changes required --- feature extraction uses existing columns.

**8.3 Multi-Staff Support**

- better-auth organization plugin already installed --- just enable member invitation UI in Profile page.

- Invite assistant bidan → they join the same organization → see same patients and drugs.

- Role-based access can be added (owner vs member) using better-auth built-in roles.

**9. Open Questions & Next Steps**

| **\#** | **Question**                                                                                                 | **Decision Needed By** |
|--------|--------------------------------------------------------------------------------------------------------------|------------------------|
| 1      | WA Business API account --- needs Facebook Business verification. Start process early as it takes 2-4 weeks. | Month 2                |
| 2      | Google Cloud project setup for Vertex AI XGBoost endpoint.                                                   | Month 2                |
| 3      | Minimum data threshold before training XGBoost --- recommend 500+ notification outcomes.                     | Month 5-6              |
| 4      | Multi-bidan invite --- confirm if Phase 2 or later.                                                          | Month 3                |
| 5      | Drug stock tracking (inventory management) --- currently out of scope. Add?                                  | TBD                    |
