# Currency Input Formatting

**Tanggal:** 2026-05-05
**Severity:** Critical
**Affected Pages:** Drugs (Add Drug Modal), Transactions (Transaction Form)
**Reporter:** UI/UX Audit

## Deskripsi Masalah

Field harga (sell_price, buy_price, price_per_dispense) menampilkan angka mentah tanpa pemisah ribuan. Contoh: bidan mengetik `200000` tapi yang tampil tetap `200000`, bukan `200.000`. Bidan tidak bisa langsung menghitung jumlah nol, berpotensi menyebabkan kesalahan input harga.

## Screenshoot / Lokasi

- `apps/web/app/(dashboard)/drugs/page.tsx` — Input `sell_price`, `buy_price`
- `apps/web/components/dashboard/TransactionForm.tsx` — Input `pricePerDispense`

## Todo Checklist

- [ ] Riset library currency input (react-number-format vs custom)
- [ ] Buat komponen `CurrencyInput` reusable di `@/components`
- [ ] Integrasi `CurrencyInput` ke Drugs page (sell_price, buy_price)
- [ ] Integrasi `CurrencyInput` ke TransactionForm (pricePerDispense)
- [ ] Pastikan state tetap menyimpan number, display saja yang diformat
- [ ] Test edge case: 0, desimal, paste dari clipboard
- [ ] Test mobile: keyboard numerik muncul

## Reference

- `formatCurrency()` sudah ada di `@repo/utils/format`
- Gunakan `Intl.NumberFormat("id-ID")` untuk konsistensi
