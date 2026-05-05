# Fix Notification Status Mismatch & Remove waMessage Generation

## Masalah

1. Tipe TypeScript `NotificationStatus` menyebutkan `"scheduled"`, tetapi database menyimpan `"pending"`. Hal ini menyebabkan tombol **Hubungi WA** tidak pernah muncul di UI karena kondisi render selalu bernilai `false`.
2. API transaksi (`POST /api/transactions`) membangun `waMessage` secara otomatis menggunakan `buildWaMessage()`, padahal untuk MVP bidan mengetik pesan sendiri di WhatsApp. Field ini seharusnya kosong (`null`) sampai fitur chatbot aktif di masa depan.

## Perubahan

- [x] Fix tipe `NotificationStatus`: `"scheduled"` → `"pending"` di `packages/types/src/dashboard.ts`
- [x] Fix kondisi render tombol WA di `NotificationCard`: `status === "scheduled"` → `status === "pending"`
- [x] Fix prop `onSend` di halaman notifikasi: `n.status === "scheduled"` → `n.status === "pending"`
- [x] Hapus logika `buildWaMessage` dan set `waMessage: null` saat insert `notification_log` di API transaksi
- [x] Pertahankan file `apps/web/lib/wa-message.ts` sebagai stub untuk fase chatbot mendatang

## Catatan

- Flow UX tetap sama: satu list flat "Perlu Dihubungi", card berubah dari tombol WA menjadi 3 tombol outcome setelah diklik.
- Data outcome (`bought`, `ignored`, `no_response`) tetap disimpan untuk training XGBoost.
- File `wa-message.ts` tidak dihapus, hanya tidak di-import sementara.
