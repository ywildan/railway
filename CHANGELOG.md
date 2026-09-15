# Riwayat Perubahan · Changelog

Format mengikuti [Keep a Changelog](https://keepachangelog.com/), versi mengikuti SemVer.

## [1.0.0] — 2026-09-15

Rilis pertama: CLI edukasi interaktif berbasis React (Ink), offline, dwibahasa.

### Ditambahkan · Added
- 8 jalur belajar (4 stasiun/jalur, 3 soal + kartu per stasiun) dalam bahasa Indonesia & Inggris:
  `uang`, `digital`, `matematika`, `kesehatan`, `inggris`, `logika`, `komputer`, `nusantara`.
- Alur belajar per stasiun: baca materi → kuis → lanjut otomatis ke stasiun berikutnya.
- Kuis interaktif dengan pembahasan langsung dan ringkasan nilai di akhir sesi.
- Kartu hafalan (flashcard) bolak-balik.
- Mode tinjau (spaced repetition) memakai kotak Leitner `0, 1, 3, 7, 14, 30` hari.
- Pencatatan kemajuan lokal: stasiun tuntas, akurasi, durasi belajar, dan streak harian.
- Perintah dengan alias ganda (Indonesia & Inggris): `jalur/tracks`, `mulai/start`, `kuis/quiz`,
  `kartu/cards`, `tinjau/review`, `progres/progress`, `bahasa/lang`, `tentang/about`,
  `bantuan/help`, `versi/version`, `hapus/reset`.
- Keluaran `--json` untuk `jalur` dan `progres`, plus ringkasan satu baris tanpa TTY.
- Dukungan aksesibilitas: `NO_COLOR`, `--no-color`, navigasi penuh dari keyboard.
- Validator konten bawaan tanpa dependensi + 70 pengujian otomatis (Vitest).

### Catatan · Notes
- Data tersimpan di `~/.railway-learn/progress.json`; bisa dipindah dengan `RAILWAY_HOME`.
- Tidak ada permintaan jaringan sama sekali dalam kode aplikasi.
