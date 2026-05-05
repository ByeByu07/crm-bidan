# Currency Input Real-time Formatting

**Tanggal:** 2026-05-06
**Severity:** Critical
**Affected Pages:** Drugs (Add/Edit Modal), Transactions (Transaction Form)
**Reporter:** User Feedback

## Deskripsi Masalah

CurrencyInput saat ini hanya memformat angka saat blur (kehilangan focus). Saat user sedang mengetik, angka masih muncul mentah tanpa pemisah ribuan (contoh: 20000, bukan 20.000). User meminta agar format muncul secara real-time saat mengetik.

## Current Behavior

- Focus: menampilkan angka mentah
- Blur: memformat dengan titik (20.000)

## Expected Behavior

- Saat mengetik langsung terformat: 20000 → 20.000 (real-time)
- State tetap menyimpan number

## Todo Checklist

- [x] Rewrite CurrencyInput untuk format real-time pada setiap keystroke
- [x] Parse display value yang terformat → number untuk state
- [x] Tangani edge case: hapus, backspace, paste
- [x] Test di mobile: keyboard numerik tetap muncul (inputMode="numeric")
- [x] Integrasi ulang ke Drugs page dan TransactionForm
- [x] Test scenario: ketik 200000, harus langsung jadi 200.000

## Status: DONE ✅

## Reference

- `formatCurrency()` sudah ada di `@repo/utils/format`
- Gunakan `inputMode="numeric"` untuk mobile keyboard
