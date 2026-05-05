# Notification UX Improvements

**Tanggal:** 2026-05-05
**Severity:** Major
**Affected Pages:** Notifications Page
**Reporter:** UI/UX Audit

## Deskripsi Masalah

1. **Tombol "Kirim WA" misleading** — sebenarnya membuka WhatsApp, bukan mengirim otomatis
2. **Tombol outcome terlalu kecil** — 3 tombol horizontal dengan `size-sm`, mudah salah tap
3. **Pesan WA terlalu panjang** — membuat card jadi tinggi, scroll berlebihan

## Todo Checklist

- [ ] Rename "Kirim WA" → "Buka WhatsApp" atau "Kirim via WA"
- [ ] Tambahkan icon external link pada tombol WA
- [ ] Re-layout outcome buttons (stacked vertical full-width)
- [ ] Truncate pesan WA dengan "Baca selengkapnya" expand
- [ ] Tambahkan timestamp/status terakhir di card
- [ ] Pertimbangkan swipe gesture untuk quick actions (optional)
- [ ] Test di mobile device
