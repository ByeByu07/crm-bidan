# Bottom Nav UX

**Tanggal:** 2026-05-05
**Severity:** Medium
**Affected Pages:** All Dashboard Pages (Layout)
**Reporter:** UI/UX Audit

## Deskripsi Masalah

1. **Tab "Transaksi" langsung ke form** — Konvensi umum: tab menuju list view, bukan form
2. **Tap area terlalu sempit** — `px-3 py-2` kurang nyaman untuk jari
3. **Tidak ada badge notifikasi** — Tidak ada indikator unread count di tab Notifikasi

## Todo Checklist

- [ ] Buat halaman `/transactions` (list view)
- [ ] Pindahkan tab "Transaksi" → `/transactions`
- [ ] Tambahkan FAB di `/transactions` untuk ke `/transactions/new`
- [x] Perbesar tap area bottom nav jadi minimum 44px (sudah dilakukan di critical)
- [x] Tambahkan badge count di tab Notifikasi (jika ada overdue/today)
- [x] Pertimbangkan active indicator yang lebih prominent (dot/underline)

## Status: PARTIAL ✅
