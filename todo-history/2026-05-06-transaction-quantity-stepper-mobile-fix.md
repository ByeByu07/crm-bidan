# Mobile Number Input Append Bug & Quantity Stepper

## Masalah

Di halaman transaksi baru, pada bagian "Item Obat", field "Jumlah" memiliki nilai default `0` atau `1`. Saat user mengetik di mobile (misalnya angka `6`), hasilnya menjadi `06` atau `16` karena teks tidak terseleksi saat fokus. Selain itu, layout 2 kolom (`grid-cols-2`) membuat field terlalu sempit di layar mobile.

## Solusi

1. Menambahkan `onFocus={(e) => e.target.select()}` agar teks otomatis terseleksi saat tap.
2. Menambahkan `inputMode="numeric"` untuk memunculkan numeric keypad di mobile.
3. Merubah layout dari 2 kolom menjadi single column agar field lebih lega.
4. Menambahkan tombol `+` dan `-` di kanan field Jumlah sebagai alternatif input tanpa keyboard.

## Todo

- [x] Tambahkan `onFocus={select}` dan `inputMode="numeric"` pada input Jumlah
- [x] Ganti layout `grid-cols-2` menjadi single column vertikal
- [x] Tambahkan tombol decrement (`-`) dengan disabled state saat qty ≤ 1
- [x] Tambahkan tombol increment (`+`) di kanan input Jumlah
- [x] Pastikan tombol menggunakan `type="button"` agar tidak submit form

## Files yang Dimodifikasi

- `apps/web/components/dashboard/TransactionForm.tsx`

## Hasil

User dapat langsung mengetik angka baru tanpa harus menghapus nilai lama terlebih dahulu. Tombol stepper memudahkan penyesuaian qty dengan satu tap.
