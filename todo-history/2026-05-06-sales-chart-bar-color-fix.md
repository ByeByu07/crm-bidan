# Sales Chart Bar Color Black Fix

## Masalah

Bar chart di halaman Penjualan (section "Grafik Penjualan") menampilkan warna hitam (black) alih-alih mengikuti tema primary shadcn/ui. Hal ini terjadi karena property `fill` pada komponen `<Bar>` Recharts menggunakan format `hsl(var(--primary))`, padahal variabel CSS `--primary` didefinisikan dalam format `oklch()`, bukan HSL.

Browser gagal memparse `hsl(oklch(...))` dan fallback ke warna hitam.

## Solusi

Menghapus wrapper `hsl()` dan menggunakan `var(--primary)` secara langsung pada atribut SVG `fill`.

## Todo

- [x] Identifikasi penyebab warna hitam pada `<Bar fill="..." />`
- [x] Ganti `fill="hsl(var(--primary))"` menjadi `fill="var(--primary)"`
- [x] Verifikasi chart mengikuti warna tema primary yang benar
- [x] Verifikasi dark mode tetap bekerja dengan benar

## Files yang Dimodifikasi

- `apps/web/components/dashboard/SalesChart.tsx`

## Hasil

Bar chart sekarang menampilkan warna primary tema (ungu/biru) dan beradaptasi dengan baik di mode gelap.
