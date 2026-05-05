# Data Entry Improvements

**Tanggal:** 2026-05-05
**Severity:** Medium
**Affected Pages:** Drugs Page, Transaction Form, Quick Add Patient
**Reporter:** UI/UX Audit

## Deskripsi Masalah

1. **Number input spinners mengganggu** — Browser menampilkan up/down arrow di input number
2. **No helper text** — Field seperti "Durasi per Satuan" membingungkan
3. **Add Patient modal terlalu minimal** — Hanya nama + WA, tidak ada birth_date, lokasi, notes
4. **No search debounce** — Pencarian obat trigger setiap keystroke

## Todo Checklist

- [x] Hide number input spinners dengan CSS (`appearance: none`)
- [ ] Atau buat custom stepper dengan tombol +/-
- [x] Tambahkan helper text di bawah input yang membingungkan
- [x] Contoh helper: "Durasi per Satuan: berapa hari 1 tablet habis"
- [ ] Tambahkan field birth_date, lokasi, notes di QuickAddPatientModal (opsional)
- [ ] Atau buat link "Lengkapi data" ke form penuh
- [x] Implement debounce 300ms pada search input Drugs page
- [x] Tambahkan loading state pada search (sudah ada skeleton)

## Status: PARTIAL ✅
