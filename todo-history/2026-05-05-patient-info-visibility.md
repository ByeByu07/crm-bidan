# Patient Info Visibility

**Tanggal:** 2026-05-05
**Severity:** Major
**Affected Pages:** Transaction Form
**Reporter:** UI/UX Audit

## Deskripsi Masalah

Setelah memilih pasien, hanya nama yang tampil. Nomor WhatsApp (penting untuk notifikasi) tidak terlihat. Bidan tidak bisa memverifikasi apakah pasien yang dipilih benar tanpa membuka dropdown lagi.

## Current State

```
[Pilih pasien...]  [+]
↓
Budi Santoso  ← hanya nama
```

## Todo Checklist

- [ ] Tampilkan nomor WA di bawah nama pada combobox trigger
- [ ] Tampilkan info tambahan (usia, lokasi) jika ada
- [ ] Style info sekunder dengan `text-muted-foreground text-xs`
- [ ] Pastikan tidak overflow pada mobile
- [ ] Pertimbangkan menampilkan avatar/inisial
