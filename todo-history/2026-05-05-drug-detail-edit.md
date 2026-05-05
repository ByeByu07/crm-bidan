# Drug Detail and Edit

**Tanggal:** 2026-05-05
**Severity:** Major
**Affected Pages:** Drugs Page
**Reporter:** UI/UX Audit

## Deskripsi Masalah

DrugCard tidak bisa di-klik untuk melihat detail atau edit. Bidan tidak bisa:
- Melihat detail lengkap obat
- Mengedit harga atau stok
- Menonaktifkan obat
- Hapus obat

## Current State

Card hanya menampilkan: nama, kategori, satuan, harga. Tidak ada action apapun.

## Todo Checklist

- [ ] Buat modal/panel detail obat (bisa reuse Dialog)
- [ ] Tambahkan tombol Edit di dalam detail
- [ ] Tambahkan tombol Nonaktifkan/Aktifkan
- [ ] Tambahkan tombol Hapus dengan konfirmasi dialog
- [ ] Buat API route `PATCH /api/drugs/[id]` (sudah ada tapi mungkin perlu extend)
- [ ] Buat API route `DELETE /api/drugs/[id]`
- [ ] Integrasi dengan `useDrugs` hook + invalidate queries
- [ ] Test edit harga → pastikan transaksi lama tidak terpengaruh (snapshot sudah benar)
