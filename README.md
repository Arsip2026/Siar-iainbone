# SIAR IAIN Bone — Record Arsip

Aplikasi web satu halaman (index.html) dengan Firebase Authentication dan Cloud Firestore.

## File
- `index.html` — aplikasi
- `data-awal.json` — 14 arsip awal (dimuat admin lewat tombol "Muat 14 arsip awal")
- `firestore.rules` — aturan keamanan database
- `firebase.json` — pengaturan Firebase Hosting

## Pasang
1. Firebase Console > Firestore Database > Rules: tempel isi `firestore.rules`, lalu Publish.
2. Authentication > Users: buat akun `arsiparisiainbone@gmail.com` (admin awal) dengan password.
3. Pasang ke Firebase Hosting atau unggah ke hosting statis lain.
4. Masuk sebagai admin, klik "Muat 14 arsip awal" dan "Kelola pengguna" untuk menambah tim.

## Berita Acara Peminjaman
- Template: file Drive `BA-PEMINJAMAN.docx` (ID di `TEMPLATE_ID` pada `apps-script/Code.gs`). Setiap kali dipratinjau, template dibaca ulang dari Drive sehingga perubahan pada file ikut berlaku.
- Setelah mengubah `Code.gs`: jalankan fungsi `izin` sekali, lalu Terapkan > Kelola deployment > Versi baru.
- Setelah mengubah `firestore.rules`: tempel ke Firebase Console > Firestore > Rules > Publish.
