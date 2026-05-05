# Transaction Form Field Order

**Tanggal:** 2026-05-05
**Severity:** Critical
**Affected Pages:** Transactions New Page
**Reporter:** UI/UX Audit

## Deskripsi Masalah

Urutan field di form transaksi tidak sesuai workflow nyata bidan. Saat ini: Pasien → Tanggal → Item Obat → Kondisi → Catatan → Total. Seharusnya kondisi pasien diisi SEBELUM item obat, karena bidan periksa dulu → diagnosa → baru resep obat.

## Current Order

1. Pasien
2. Tanggal Pembelian
3. Item Obat
4. Kondisi Pasien ← terlalu lambat
5. Catatan
6. Total

## Recommended Order

1. Pasien
2. Kondisi Pasien ← naik ke posisi #2
3. Tanggal Pembelian
4. Item Obat
5. Catatan
6. Total

## Todo Checklist

- [ ] Pindahkan section "Kondisi Pasien" ke atas setelah "Pasien"
- [ ] Pindahkan section "Tanggal Pembelian" ke posisi #3
- [ ] Pastikan tidak ada broken state setelah reorder
- [ ] Test validasi form masih berjalan normal
- [ ] Cek mobile layout tetap nyaman setelah reorder
