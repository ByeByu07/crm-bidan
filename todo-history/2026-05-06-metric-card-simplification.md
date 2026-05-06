# Sales Page Metric Card Simplification

## Masalah

Kartu metrik (MetricCard) di halaman Penjualan memiliki beberapa masalah UI/UX:

1. **Tinggi tidak konsisten**: Judul "Rata-rata per Transaksi" wrap ke 2 baris di layar sempit, membuat kartu lebih tinggi dari yang lain.
2. **Visual noise**: Icon di pojok kanan atas bersaing dengan angka untuk perhatian user.
3. **Pemborosan ruang vertikal**: Indikator perubahan (`+5% vs periode lalu`) menempati baris tersendiri.
4. **Terlalu sempit di mobile**: Dua kolom dengan teks panjang terasa crowded di layar kecil.

## Solusi

1. **Hapus icon** dari kartu metrik — angka adalah yang paling penting.
2. **Inline change badge**: Pindahkan persentase perubahan ke badge kecil di sebelah judul, menghemat 1 baris.
3. **Kurangi padding**: Dari `p-4` ke `p-3`.
4. **Single column di mobile**: Gunakan `grid-cols-1 sm:grid-cols-2` agar kartu mendapat lebar penuh di mobile.
5. **Persingkat judul**: "Rata-rata per Transaksi" menjadi "Rata-rata".

## Todo

- [x] Hapus prop `icon` dan rendering icon dari MetricCard
- [x] Inline badge persentase dengan warna emerald/rose dan background subtle
- [x] Kurangi padding dan ukuran font value
- [x] Ganti grid menjadi `grid-cols-1 sm:grid-cols-2`
- [x] Persingkat judul "Rata-rata per Transaksi" menjadi "Rata-rata"
- [x] Update skeleton height agar sesuai kartu baru

## Files yang Dimodifikasi

- `apps/web/components/dashboard/MetricCard.tsx`
- `apps/web/app/(dashboard)/sales/page.tsx`

## Hasil

Kartu metrik lebih ringkas, tinggi seragam, dan lebih mudah discan di mobile. Tidak ada lagi teks yang wrap secara tidak merata.
