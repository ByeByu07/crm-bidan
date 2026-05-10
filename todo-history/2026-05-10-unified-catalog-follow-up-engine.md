# 2026-05-10-unified-catalog-follow-up-engine

Refactor data model dari drug-only catalog menjadi unified catalog (product + service) dengan follow-up notification engine.

## Ringkasan Perubahan

- Rename `drug` → `catalog_item` (unified product + service)
- Rename `drug_category` → `category`
- Simplify unit system: single `unit` + `duration_days`
- Add `type` discriminator: `product` | `service`
- Follow-up engine dengan reschedule bottom sheet
- "Hentikan Follow-Up" button untuk keluar dari notification loop

---

## Schema & Types

- [x] `packages/db/src/schema.ts` — Replace `drug` → `catalog_item`, rename `drug_category` → `category`, update all FKs & relations
- [x] `packages/types/src/dashboard.ts` — Update `Drug` → `CatalogItem`, `DrugCategoryItem` → `Category`, update `SaleItem` (`drugId` → `catalogItemId`)
- [x] `packages/db/src/index.ts` — Verify exports

## API Routes

- [x] `apps/web/app/api/catalog/route.ts` — GET list + POST create
- [x] `apps/web/app/api/catalog/[id]/route.ts` — PATCH update + DELETE
- [x] `apps/web/app/api/categories/route.ts` — GET list + POST create (renamed from drug-categories)
- [x] `apps/web/app/api/transactions/route.ts` — Update to use `catalogItem`, unified formula `qty × durationDays`, generic WA message, qty lock for services
- [x] `apps/web/app/api/dashboard/sales/route.ts` — Update joins
- [x] `apps/web/app/api/dashboard/notifications/route.ts` — Update joins + include catalog item data
- [x] `apps/web/app/api/notifications/[id]/outcome/route.ts` — Update behavior
- [x] `apps/web/app/api/notifications/[id]/reschedule/route.ts` — **NEW** endpoint (POST `{ scheduled_date }`, validate max days)
- [x] `apps/web/app/api/ai/recommendation/route.ts` — Update joins
- [x] `apps/web/app/api/patients/[id]/transactions/route.ts` — Update joins

## Hooks

- [x] `apps/web/hooks/use-catalog-items.ts` — **NEW** (replaces use-drugs)
- [x] `apps/web/hooks/use-categories.ts` — **NEW** (replaces use-drug-categories)
- [x] `apps/web/hooks/use-create-transaction.ts` — Update field names (`catalog_item_id`)
- [x] `apps/web/hooks/use-reschedule-notification.ts` — **NEW**
- [x] `apps/web/hooks/index.ts` — Update exports

## Components

- [x] `apps/web/components/dashboard/CatalogItemCard.tsx` — **NEW** (replaces DrugCard)
- [x] `apps/web/components/dashboard/CatalogItemCombobox.tsx` — **NEW** (replaces DrugCombobox)
- [x] `apps/web/components/dashboard/QuickAddCategoryModal.tsx` — **NEW** (replaces QuickAddDrugCategoryModal)
- [x] `apps/web/components/dashboard/TransactionForm.tsx` — Update: qty lock for services, use catalog items
- [x] `apps/web/components/dashboard/NotificationCard.tsx` — Major update: reschedule bottom sheet trigger
- [x] `apps/web/components/dashboard/RescheduleBottomSheet.tsx` — **NEW**
- [x] `apps/web/components/dashboard/BottomNav.tsx` — Label "Katalog", href `/catalog`

## Pages

- [x] `apps/web/app/(dashboard)/catalog/page.tsx` — **NEW** (renamed from drugs)
- [x] `apps/web/app/(dashboard)/transactions/new/page.tsx` — Update hooks
- [x] `apps/web/app/(dashboard)/sales/page.tsx` — Update refs
- [x] `apps/web/app/(dashboard)/notifications/page.tsx` — Update with reschedule bottom sheet

## Utilities

- [x] `apps/web/lib/wa-message.ts` — Generic message template (remove hardcoded "Obat")
- [x] `apps/web/lib/feature-extractor.ts` — Update field names
- [x] `apps/web/lib/prediction-service.ts` — Update field names
- [x] `packages/utils/src/calc.ts` — Update parameter name

## Cleanup (Delete Old Files)

- [x] `apps/web/app/api/drugs/route.ts` — DELETE
- [x] `apps/web/app/api/drugs/[id]/route.ts` — DELETE
- [x] `apps/web/app/api/drug-categories/route.ts` — DELETE
- [x] `apps/web/hooks/use-drugs.ts` — DELETE
- [x] `apps/web/hooks/use-drug-categories.ts` — DELETE
- [x] `apps/web/components/dashboard/DrugCard.tsx` — DELETE
- [x] `apps/web/components/dashboard/DrugCombobox.tsx` — DELETE
- [x] `apps/web/components/dashboard/QuickAddDrugCategoryModal.tsx` — DELETE
- [x] `apps/web/app/(dashboard)/drugs/page.tsx` — DELETE

## Documentation

- [x] `FOLDER_PLAN.md` — Updated
- [x] `BidanCRM_PRD.md` — Updated
- [x] This todo file — Mark [x] as completed

## Data Loss Warning

- [x] Old `drug` table dropped
- [x] Old `drug_category` table dropped
- [x] `sale_item` and `notification_log` may need truncation to avoid broken FKs

## Verification

- [x] `npx tsc --noEmit` passes for all packages (db, types, utils, auth, ui, web)
- [x] No remaining `drug`/`Drug` references in codebase
- [x] All imports updated to new types
