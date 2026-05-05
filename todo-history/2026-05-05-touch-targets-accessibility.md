# Touch Targets Too Small

**Tanggal:** 2026-05-05
**Severity:** Critical
**Affected Pages:** Transaction Form, Notifications, Drugs
**Reporter:** UI/UX Audit

## Deskripsi Masalah

Beberapa elemen interaktif memiliki ukuran di bawah 44×44px (minimum WCAG 2.1 untuk touch target). Berpotensi menyebabkan mis-tap, terutama pada bidan yang bekerja dalam kondisi terburu-buru.

## Elemen yang Bermasalah

| Elemen | Lokasi | Ukuran Saat Ini |
|--------|--------|----------------|
| Hapus item button | TransactionForm | `icon-xs` (~24px) |
| Tambah item button | TransactionForm | `size-sm` (~32px) |
| Bottom nav items | BottomNav | `px-3 py-2` |
| Kirim WA button | NotificationCard | `size-sm` |
| Outcome buttons (3) | NotificationCard | `size-sm` stacked horizontal |

## Todo Checklist

- [x] Perbesar tombol hapus item jadi minimum 36×36px
- [x] Perbesar tombol tambah item jadi minimum 44×36px
- [x] Perbesar bottom nav tap area jadi minimum 44px height
- [x] Perbesar tombol Kirim WA di NotificationCard
- [x] Re-layout outcome buttons (stacked vertical atau swipe)
- [x] Audit seluruh halaman untuk elemen < 44px
- [x] Test di device mobile nyata

## Status: DONE ✅
