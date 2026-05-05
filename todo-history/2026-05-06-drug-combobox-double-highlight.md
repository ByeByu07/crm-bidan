# Drug Combobox Double Highlight

**Tanggal:** 2026-05-06
**Severity:** Major
**Affected Pages:** Transaction Form
**Reporter:** User Feedback

## Deskripsi Masalah

Di dropdown DrugCombobox, jika ada dua obat dengan nama yang sama (atau nama mirip), kedua-duanya ter-highlight saat salah satu dipilih. Ini terjadi karena CommandItem menggunakan `value={drug.name}` yang tidak unik.

## Root Cause

```tsx
<CommandItem
  key={drug.id}
  value={drug.name}  // ← tidak unik!
  onSelect={() => {}}
>
```

Jika dua drug memiliki nama sama (contoh: "Paracetamol" generik dari brand berbeda), Command tidak bisa membedakan keduanya.

## Fix Required

Gunakan `drug.id` sebagai value (unik), dan tambahkan properti `textValue` untuk pencarian:

```tsx
<CommandItem
  key={drug.id}
  value={drug.id}        // ← unik
  onSelect={() => {}}
>
```

Atau gunakan kombinasi nama + id:
```tsx
value={`${drug.name}__${drug.id}`}
```

## Todo Checklist

- [x] Fix DrugCombobox: ganti `value={drug.name}` jadi kombinasi unik `${drug.name}__${drug.id}`
- [x] Fix PatientCombobox: ganti `value={patient.name}` jadi kombinasi unik `${patient.name}__${patient.id}`
- [x] Pastikan pencarian (CommandInput) tetap berfungsi (fuzzy match pada kombinasi string)
- [x] Test dengan data dummy yang memiliki nama sama
- [x] Test selection: hanya item yang diklik yang ter-highlight

## Status: DONE ✅

## Reference

- `apps/web/components/dashboard/DrugCombobox.tsx` line ~53
- `apps/web/components/dashboard/PatientCombobox.tsx` line ~57
