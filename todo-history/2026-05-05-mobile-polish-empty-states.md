# Mobile Polish and Empty States

**Tanggal:** 2026-05-05
**Severity:** Medium
**Affected Pages:** All Dashboard Pages
**Reporter:** UI/UX Audit

## Deskripsi Masalah

1. **No pull-to-refresh** — Mobile users expect gesture pull-down untuk refresh
2. **No empty state illustrations** — Hanya teks polos "Belum ada data"
3. **No offline indicator** — Bidan di desa sering koneksi putus-nyambung
4. **Calendar popover terlalu kecil** — Sulit dipakai di layar mobile

## Todo Checklist

- [ ] Implement pull-to-refresh di lists (drugs, notifications)
- [ ] Buat komponen `EmptyState` dengan illustration/icon + CTA button
- [ ] Integrasi `EmptyState` ke semua list view
- [ ] Tambahkan network status listener + banner/toast offline
- [ ] Ganti Calendar Popover dengan native date input di mobile
- [ ] Atau perbesar Calendar popover menjadi full-width drawer
- [ ] Test di iOS Safari dan Android Chrome
