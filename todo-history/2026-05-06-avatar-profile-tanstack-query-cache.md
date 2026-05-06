# Avatar & Profile Data Caching dengan TanStack Query

## Masalah

Komponen `AvatarButton` dan `ProfileSheet` melakukan fetch data profil dan organisasi secara independen menggunakan `useEffect` + `useState`. Hal ini menyebabkan:

- **Redundant API calls**: Setiap kali `AvatarButton` mount atau `ProfileSheet` dibuka, `authClient.getSession()` dan `authClient.organization.getFullOrganization()` dipanggil ulang.
- **Tidak ada caching**: Data tidak di-cache, sehingga pengguna melihat loading state berulang kali.
- **Inkonsistensi state**: Jika data berubah di server, komponen yang berbeda bisa menampilkan data yang berbeda.

## Solusi

Mengkonversi fetch data profil dan organisasi ke **TanStack Query hooks** agar data di-cache dan dibagikan antar komponen.

## Todo

- [x] Buat hook `useProfile` dengan `useQuery` dan query key `["profile"]`
- [x] Update hook `useOrganization` dari `useEffect` ke `useQuery` dengan query key `["organization"]`
- [x] Update `AvatarButton.tsx`: ganti `useEffect` + `useState` dengan `useProfile()` dan `useOrganization()`
- [x] Update `ProfileSheet.tsx`: ganti `useEffect` + `useState` dengan `useProfile()` dan `useOrganization()`
- [x] Tambahkan `staleTime` (5 menit) dan `gcTime` (10 menit) untuk mengurangi refetch yang tidak perlu
- [x] Verifikasi type check dan build berhasil

## Files yang Dimodifikasi

- `apps/web/hooks/use-profile.ts` *(baru)*
- `apps/web/hooks/use-organization.ts`
- `apps/web/components/dashboard/AvatarButton.tsx`
- `apps/web/components/dashboard/ProfileSheet.tsx`

## Hasil

- **Single source of truth**: `AvatarButton` dan `ProfileSheet` berbagi cache yang sama.
- **No redundant requests**: TanStack Query mendeduplikasi request secara otomatis.
- **Loading state konsisten**: `isLoading` berasal dari query, tidak lagi dari state lokal.
- **Background refetch**: Data tetap segar saat window di-refocus tanpa gangguan UX.
