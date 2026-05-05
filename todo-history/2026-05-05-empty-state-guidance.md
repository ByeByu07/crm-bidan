# Empty State Guidance

**Tanggal:** 2026-05-05
**Severity:** Critical
**Affected Pages:** Transaction Form, Drugs Page
**Reporter:** UI/UX Audit

## Deskripsi Masalah

Ketika tidak ada conditions atau categories, dropdown Select terbuka kosong tanpa petunjuk apa yang harus dilakukan user. User bingung apakah loading, error, atau memang kosong.

## Lokasi

- `TransactionForm.tsx` — Select "Kondisi Pasien"
- `DrugsPage.tsx` — Select "Kategori"

## Todo Checklist

- [x] Tambahkan helper text di bawah Select ketika data kosong
- [x] Contoh: "Belum ada kondisi. Klik + untuk menambahkan."
- [x] Pastikan tombol "+" tetap visible dan jelas fungsinya
- [x] Tambahkan empty state illustration/icon di dalam SelectContent
- [x] Cek consistency antara condition select dan category select
- [x] Test scenario: user baru pertama kali buka form

## Status: DONE ✅
