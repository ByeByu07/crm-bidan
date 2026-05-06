# Unified AI Recommendation + Notification Card Redesign

## Ringkasan

Redesign total notification card: tombol label lebih jelas, waktu estimasi dihapus, overdue badge disembunyikan, dan digantikan dengan satu accordion "Rekomendasi AI" yang berisi insight obat + riwayat 3 transaksi terakhir. Drug category di halaman obat juga disederhanakan menjadi dropdown.

## Perubahan yang Dilakukan

### 1. Drug Category — Simplifikasi Filter (Drugs Page)
- [x] Ganti `flex flex-wrap` pills menjadi `Select` dropdown di `apps/web/app/(dashboard)/drugs/page.tsx`
- [x] Label "Kategori" + dropdown lebar penuh (sm:w-[240px])
- [x] Loading state dengan `disabled={categoriesLoading}`

### 2. Notification Card — Hapus Drug Name + Optimasi API
- [x] Hapus `<p>{notification.drugName}</p>` di bawah nama pasien
- [x] Hapus field `drugName` dari `NotificationLogItem` di `packages/types/src/dashboard.ts`
- [x] Optimasi API `apps/web/app/api/dashboard/notifications/route.ts`:
  - Dari 4 query terpisah + in-memory Map → 1 JOIN query `notificationLog LEFT JOIN patient`
  - Hapus query `drug` dan `saleItem` yang tidak lagi dibutuhkan
  - Filter DB-level hanya mengambil row yang relevan (pending / sent tanpa outcome / sent hari ini)

### 3. "Beli" Button — Navigasi ke Transaction Form
- [x] Tombol "Beli" di `NotificationCard.tsx` sekarang navigate ke `/transactions/new?patient_id=X&notification_id=Y`
- [x] `TransactionForm.tsx` menerima prop `preselectedPatientId` dan auto-select pasien via `useEffect`
- [x] `transactions/new/page.tsx` membaca query params, memanggil `useSetOutcome({ outcome: "bought" })` setelah transaksi sukses
- [x] Toast: "Transaksi tersimpan dan notifikasi selesai"

### 4. Notification Card — Redesign UI
- [x] Update label tombol outcome:
  - `Beli` → `✓ Pasien Beli Obat` (icon CheckCircle, emerald)
  - `Abaikan` → `✗ Tidak Jadi Beli` (icon XCircle, rose)
  - `Tidak Respon` → `⌛ Belum Dihubungi` (icon HelpCircle, gray)
- [x] Hapus teks estimasi waktu (`Estimasi: {formatDate(...)}`)
- [x] Comment out overdue badge dengan referensi todo `2026-05-06-overdue-notification-pricing.md`
- [x] Hapus accordion "Riwayat Pembelian" terpisah

### 5. AI Recommendation — Fitur Baru
- [x] Install dependencies: `ai`, `@ai-sdk/react`, `streamdown`
- [x] Tambah `AI_GATEWAY_API_KEY` ke `apps/web/.env.local`
- [x] Buat API route `apps/web/app/api/ai/recommendation/route.ts`:
  - Fetch pasien + 3 transaksi terakhir dari DB
  - Build prompt Indonesian untuk rekomendasi obat
  - Streaming via `streamText({ model: "deepseek/deepseek-v4-flash" })`
  - Return `result.toTextStreamResponse()`
- [x] Buat hook `apps/web/hooks/use-ai-recommendation.ts`:
  - TanStack Query dengan `staleTime: 12 jam`, `gcTime: 24 jam`
  - Accumulate streaming chunks menjadi full text
- [x] Buat komponen `apps/web/components/dashboard/AIRecommendation.tsx`:
  - Accordion "Rekomendasi AI" dengan icon Sparkles
  - Fetch AI text + patient transactions secara paralel
  - Render AI insight di atas (Streamdown markdown)
  - Divider + riwayat 3 transaksi terakhir di bawah (kompak, tanpa card)
- [x] Tambah `@source` Streamdown ke `packages/ui/src/styles/globals.css`
- [x] Import `streamdown/styles.css` di `apps/web/app/layout.tsx`

### 6. API Filter — Hanya Notifikasi Hari Ini
- [x] Refactor `scheduled` filter di `/api/dashboard/notifications`:
  - Dari: semua pending yang tidak overdue
  - Menjadi: hanya pending dengan `scheduledDate` antara `startOfToday` dan `startOfTomorrow`

## Catatan Teknis

- **AI Prompt**: Fokus pada rekomendasi obat spesifik (1-2 obat) dengan alasan singkat. Max 60 kata.
- **Client Cache**: 12 jam staleTime, cukup untuk 1 shift kerja bidan.
- **Future-proof**: Layout accordion siap diganti dengan XGBoost prediction API tanpa perubahan UI.
- **TypeScript**: Semua perubahan lolos `tsc --noEmit` tanpa error.

## File yang Dibuat

1. `apps/web/app/api/ai/recommendation/route.ts`
2. `apps/web/hooks/use-ai-recommendation.ts`
3. `apps/web/components/dashboard/AIRecommendation.tsx`
4. `todo-history/2026-05-06-overdue-notification-pricing.md`
5. `todo-history/2026-05-06-ai-privacy-compliance.md`
6. `todo-history/2026-05-06-ai-recommendation-db-cache.md`

## File yang Diubah

1. `apps/web/app/(dashboard)/drugs/page.tsx`
2. `apps/web/components/dashboard/NotificationCard.tsx`
3. `apps/web/app/(dashboard)/transactions/new/page.tsx`
4. `apps/web/components/dashboard/TransactionForm.tsx`
5. `apps/web/app/api/dashboard/notifications/route.ts`
6. `packages/types/src/dashboard.ts`
7. `apps/web/.env.local`
8. `apps/web/package.json`
9. `packages/ui/src/styles/globals.css`
10. `apps/web/app/layout.tsx`
