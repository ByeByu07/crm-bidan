# Sales Chart Independent Time Filter & Custom Range

## Masalah

1. **Filter chart tidak independen**: Tabs waktu (1 Bulan, 3 Bulan, 6 Bulan) berada di level halaman dan mengontrol semua data termasuk metric cards. User tidak bisa mengeksplor chart tanpa mengubah ringkasan metrik.
2. **Tidak ada custom range**: User tidak bisa menganalisis periode promosi tertentu atau membandingkan tanggal arbitrer.
3. **1 Bulan ambiguous**: User mungkin mengira ini rolling 30 hari, padahal API mengembalikan bulan kalender saat ini saja.
4. **Layout header kurang konsisten**: Filter tabs di pojok kanan atas halaman, sementara halaman lain menggunakan AvatarButton.

## Solusi

1. **Pindahkan filter ke header chart card**: Chart menjadi independently explorable.
2. **Tambahkan AvatarButton di header halaman**: Konsisten dengan halaman Notifications.
3. **Buat Popover dengan preset + calendar**: Satu tombol trigger yang membuka Popover berisi preset (Bulan Ini, 3 Bulan, 6 Bulan) dan picker kalender untuk rentang kustom.
4. **Extend backend API**: Terima parameter `from` dan `to`. Agregasi harian untuk rentang ≤ 31 hari, agregasi bulanan untuk rentang lebih panjang.
5. **Update chart formatting**: Dynamic x-axis label — format `dd MMM` untuk harian, `MM/yy` untuk bulanan.

## Todo

- [x] Pindahkan AvatarButton ke header halaman, hapus Tabs dari header
- [x] Wrap chart section dalam Card dengan header berisi Popover filter
- [x] Buat Popover dengan preset buttons dan inline Calendar
- [x] Extend types: `SalesChartDataPoint` dengan field `label` generik
- [x] Extend API `dashboard/sales` untuk menerima `from` dan `to`
- [x] Implementasikan agregasi harian vs bulanan di backend
- [x] Update `useSales` hook untuk menerima `SalesPeriod` atau `SalesDateRange`
- [x] Update `SalesChart` x-axis formatter untuk handle daily dan monthly labels
- [x] Metric cards tetap menampilkan data "Bulan Ini" secara independen
- [x] Verifikasi type check dan build

## Files yang Dimodifikasi

- `apps/web/app/(dashboard)/sales/page.tsx`
- `apps/web/components/dashboard/SalesChart.tsx`
- `apps/web/hooks/use-sales.ts`
- `apps/web/app/api/dashboard/sales/route.ts`
- `packages/types/src/dashboard.ts`

## Hasil

User sekarang dapat mengeksplor chart dengan rentang waktu apapun tanpa mempengaruhi ringkasan metrik di atas. Preset cepat tersedia untuk kasus umum, dan picker kustom memberikan fleksibilitas penuh.
