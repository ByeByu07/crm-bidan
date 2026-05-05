# Calendar Date Off By One

**Tanggal:** 2026-05-06
**Severity:** Critical
**Affected Pages:** Transactions New Page
**Reporter:** User Feedback

## Deskripsi Masalah

Ketika memilih tanggal di Calendar (contoh: 14 Mei), yang tersimpan dan ditampilkan adalah tanggal sebelumnya (13 Mei). Ini terjadi karena penggunaan `toISOString()` yang mengkonversi ke timezone UTC.

## Root Cause

```ts
date.toISOString().split("T")[0]
```

`toISOString()` mengembalikan waktu dalam UTC. Jika user berada di WIB (UTC+7), tanggal 14 Mei 00:00 WIB = 13 Mei 17:00 UTC. Sehingga hasil split menjadi "2026-05-13".

## Fix Required

Gunakan local date extraction, bukan `toISOString()`:

```ts
const year = date.getFullYear();
const month = String(date.getMonth() + 1).padStart(2, "0");
const day = String(date.getDate()).padStart(2, "0");
setPurchaseDate(`${year}-${month}-${day}`);
```

## Todo Checklist

- [x] Fix date conversion di TransactionForm Calendar onSelect
- [x] Cek apakah ada tempat lain yang pakai toISOString() untuk date
- [x] Test: pilih tanggal 1, harus tetap 1 (bukan 30 atau 31)
- [x] Test: pilih tanggal akhir bulan
- [x] Test: pilih tanggal 14 Mei, harus muncul 14 Mei

## Status: DONE ✅

## Reference

- `apps/web/components/dashboard/TransactionForm.tsx` line ~168
