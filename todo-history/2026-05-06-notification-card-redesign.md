# Redesign Notification Card — Expandable Purchase History

## Masalah

1. Label "Estimasi habis:" terlalu spesifik (tidak semua obat dikonsumsi, e.g. suntik).
2. Card notifikasi hanya menampilkan nama obat, tanpa konteks riwayat pembelian pasien. Bidan butuh melihat transaksi terakhir pasien untuk memahami pola pembelian sebelum menghubungi.

## Perubahan

- [x] Ubah label "Estimasi habis:" menjadi "Estimasi" di `NotificationCard`
- [x] Tambah section expandable "Riwayat Pembelian" yang load on-demand saat card di-expand
- [x] Buat API endpoint `GET /api/patients/[id]/transactions` untuk mengambil riwayat transaksi pasien
- [x] Tambah tipe `PatientTransactionHistory` di `@repo/types`
- [x] Buat hook `usePatientTransactions` dengan TanStack Query
- [x] Tampilkan transaksi terakhir dengan detail: tanggal, kondisi, daftar obat (nama + qty + subtotal), dan total harga
- [x] Pertahankan tombol WA dan 3 tombol outcome (Beli / Abaikan / Tidak Respon)

## Catatan

- Data riwayat di-fetch hanya saat user expand card, bukan preload, untuk menjaga performa list.
- Jika pasien belum pernah bertransaksi, ditampilkan pesan "Belum ada riwayat pembelian."
- Format harga menggunakan `formatCurrency` dari `@repo/utils`.
