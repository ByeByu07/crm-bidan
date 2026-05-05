# Remove Profile Tab → Add Avatar Header + Full-Screen Profile Sheet

**Tanggal:** 2026-05-06
**Severity:** Major
**Affected Pages:** All Dashboard Pages (Layout, BottomNav, Drugs, Notifications, Transactions)
**Reporter:** User Feedback

## Deskripsi Masalah

Bottom navigation memiliki 5 tab termasuk "Profil" yang jarang digunakan. User ingin:
1. Menghapus tab "Profil" dari bottom navigation
2. Menambahkan avatar bulat di header halaman (sejajar dengan judul)
3. Avatar menampilkan: organization logo (prioritas) → user image → user initials fallback
4. Klik avatar membuka full-screen profile sheet (bottom sheet)
5. Profile sheet berisi: info user, info klinik, tombol logout
6. Halaman `/profile` dihapus sepenuhnya

## Better-Auth Organization Reference

- `authClient.organization.getFullOrganization()` → returns `{ name, logo, slug, metadata }`
- `authClient.getSession()` → returns `{ user: { name, email, image } }`
- Organization table schema: `id, name, slug, logo, metadata, createdAt`
- User table schema: `id, name, email, emailVerified, image, role, createdAt, updatedAt`

## Changes Made

### Files Created
- `apps/web/components/dashboard/AvatarButton.tsx` — Circular avatar button with priority display
- `apps/web/components/dashboard/ProfileSheet.tsx` — Full-screen bottom sheet with profile + logout
- `apps/web/hooks/use-organization.ts` — Hook to fetch active organization data

### Files Modified
- `apps/web/components/dashboard/BottomNav.tsx` — Removed Profil tab (4 tabs now)
- `apps/web/app/(dashboard)/drugs/page.tsx` — Added AvatarButton to header
- `apps/web/app/(dashboard)/notifications/page.tsx` — Added AvatarButton to header
- `apps/web/app/(dashboard)/transactions/new/page.tsx` — Added AvatarButton to header
- `apps/web/app/(dashboard)/profile/page.tsx` — Replaced with redirect to /sales

### Files Deleted
- `apps/web/app/(dashboard)/profile/page.tsx` (old profile page content)

## Design Specs

### AvatarButton
```
size: 36px × 36px
border-radius: 9999px (full circle)
border: 2px solid hsl(var(--border))
object-fit: cover
hover: ring-2 ring-primary/50 ring-offset-2
```

### ProfileSheet
```
position: fixed, bottom-0, inset-x-0
height: 100dvh (full screen)
bg: hsl(var(--background))
border-radius: 1rem 1rem 0 0 (top rounded)
animation: translate-y-0 (slide up)
```

## Status: DONE ✅
