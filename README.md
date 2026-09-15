<p align="center">
  <img src="docs/assets/hero.jpg" alt="Railway — jalur belajar di terminal" width="100%" />
</p>

<h1 align="center">🚂 Railway</h1>

<p align="center">
  <strong>Jalur belajar di terminal — offline, gratis, untuk semua kalangan.</strong><br/>
  <strong>A learning track in your terminal — offline, free, for everyone.</strong>
</p>

<p align="center">
  <a href="#cara-pakai">Cara pakai</a> ·
  <a href="#usage">Usage</a> ·
  <a href="#daftar-jalur--tracks">Jalur</a> ·
  <a href="#cara-kerja--how-it-works">Cara kerja</a> ·
  <a href="#kontribusi--contributing">Kontribusi</a>
</p>

---

## Apa ini?

**Railway** adalah CLI edukasi interaktif. Bayangkan peta rel kereta: setiap *jalur* (track) adalah
bidang kehidupan nyata, dan setiap *stasiun* (station) berisi materi singkat, kuis, dan kartu
hafalan. Kamu membaca, mengerjakan, lalu mengulang — semuanya dari terminal, tanpa akun, tanpa
kuota, tanpa biaya.

Dibangun dengan **React (Ink)** — antarmuka terminal berbasis komponen seperti aplikasi web,
tetap berjalan 100% lokal.

**Railway** is an interactive learning CLI. Think of a railway map: each *track* is a real-life
topic, and each *station* holds a short lesson, a quiz, and flashcards. You read, you answer, you
review — all from the terminal, with no account, no data cost, no fees.

Built with **React (Ink)** — a component-based terminal UI that runs 100% locally.

### Kenapa repot-repot pakai terminal?

- **Ringan & cepat** — jalan di komputer tua sekalipun, cocok untuk perangkat sekolah/perpustakaan.
- **Bisa dipakai jarak jauh** — lewat SSH, termasuk di lab komputer atau Raspberry Pi.
- **Aksesibel** — teks murni, ramah pembaca layar, mendukung `NO_COLOR`, bisa disetel kecepatannya.
- **Bisa diotomatiskan** — keluaran `--json` mudah dipipakan ke skrip lain.
- **Tanpa gangguan** — tidak ada notifikasi, iklan, atau umpan berlebih.

### Why a terminal?

- **Lightweight** — runs on old machines, perfect for school or library computers.
- **Remote friendly** — works over SSH, including labs and Raspberry Pi.
- **Accessible** — pure text, screen-reader friendly, honours `NO_COLOR`, self-paced.
- **Scriptable** — `--json` output pipes cleanly into other tools.
- **Distraction free** — no notifications, adverts, or infinite feeds.

---

## Fitur · Features

| | |
|---|---|
| 🛤️ **8 jalur belajar** | Keuangan, literasi digital, matematika, kesehatan, bahasa Inggris, logika, komputer, wawasan Nusantara |
| 🚉 **Belajar per stasiun** | Baca materi → kuis → lanjut ke stasiun berikutnya |
| 🃏 **Kartu hafalan** | Bolak-balik kartu, langsung dari keyboard |
| 🔁 **Pengulangan berjarak** | Kotak Leitner: soal yang sulit muncul lebih sering |
| 📊 **Kemajuan & streak** | Skor, akurasi, waktu belajar, rangkaian harian |
| 🌐 **Dwibahasa** | Indonesia & Inggris — UI *dan* materi, bisa diganti kapan saja |
| 🔌 **Sepenuhnya offline** | Tidak ada permintaan jaringan sama sekali |
| 🔒 **Privasi default** | Data tersimpan lokal di komputermu sendiri |

---

## Pasang · Install

Butuh **Node.js 20 atau lebih baru** / requires **Node.js 20+**.

```bash
# Coba tanpa memasang / try without installing
npx @ywildan/railway

# Pasang global / install globally
npm install -g @ywildan/railway
railway
```

### Dari kode sumber · From source

```bash
git clone https://github.com/ywildan/railway.git
cd railway
npm install
npm run build
npm link          # perintah `railway` tersedia secara global
npm start -- jalur   # atau jalankan langsung tanpa link
```

---

<a id="cara-pakai"></a>
## Cara pakai (perintah Indonesia)

```bash
railway                     # Menu interaktif
railway jalur               # Daftar semua jalur belajar
railway mulai <jalur>       # Mulai jalur dari stasiun terakhir
railway kuis <jalur>        # Kuis seluruh soal di jalur itu
railway kartu <jalur>       # Latihan kartu hafalan
railway tinjau [jalur]      # Tinjau soal yang sulit / jatuh tempo
railway progres             # Lihat kemajuan
railway bahasa [id|en]      # Atur bahasa
railway tentang             # Tentang Railway
railway bantuan             # Bantuan lengkap
```

<a id="usage"></a>
## Usage (English commands)

```bash
railway                     # Interactive menu
railway tracks              # List every learning track
railway start <track>       # Start a track from your last station
railway quiz <track>        # Quiz every question in that track
railway cards <track>       # Flashcard drill
railway review [track]      # Review due / difficult questions
railway progress            # See your progress
railway lang [id|en]        # Set the language
railway about               # About Railway
railway help                # Full help
```

> Semua perintah punya alias dalam **dua bahasa** — pakai yang paling nyaman.
> Every command has aliases in **both languages** — use whichever feels natural.

### Contoh · Examples

```bash
railway mulai uang          # Belajar literasi keuangan dari awal
railway kuis digital        # Langsung kuis keamanan digital
railway tinjau              # Tinjau soal yang paling sering salah
railway progres --json      # Keluaran JSON untuk skrip lain
railway kartu inggris --bahasa=en
```

### Opsi · Options

| Opsi | Fungsi |
|---|---|
| `--bahasa=id\|en`, `-l en` | Pilih bahasa untuk sesi ini |
| `--json` | Keluaran terstruktur (untuk `jalur` & `progres`) |
| `--no-color` | Matikan warna (juga hormati `NO_COLOR`) |
| `--ya` | Konfirmasi otomatis (untuk `railway hapus`) |

### Tombol · Keys

| Tombol | Aksi |
|---|---|
| `↑` `↓` atau `j` `k` | Berpindah pilihan |
| `1`–`9` | Pilih langsung (nomor opsi / nomor menu) |
| `Enter` | Lanjut · mengunci jawaban |
| `Spasi` | Membalik kartu · lanjut |
| `←` `→` | Geser kartu |
| `Esc` | Kembali / keluar |

---

<a id="daftar-jalur--tracks"></a>
## Daftar jalur · Tracks

| Emoji | Id | Indonesia | English |
|---|---|---|---|
| 💰 | `uang` | Literasi Keuangan | Financial Literacy |
| 🔐 | `digital` | Literasi Digital & Keamanan | Digital Literacy & Safety |
| 🧮 | `matematika` | Matematika Sehari-hari | Everyday Math |
| 🩺 | `kesehatan` | Kesehatan Sehari-hari | Everyday Health |
| 🔤 | `inggris` | Bahasa Inggris Praktis | Everyday English |
| 🧠 | `logika` | Logika & Berpikir Kritis | Logic & Critical Thinking |
| 💻 | `komputer` | Dasar Komputer & Internet | Computer & Internet Basics |
| 🏝️ | `nusantara` | Wawasan Nusantara | Indonesian Knowledge |

Setiap jalur: **4 stasiun × 3 soal + kartu hafalan**. Konten ditulis per bahasa, jadi contoh dan
penjelasannya bisa disesuaikan dengan pembacanya (misalnya rupiah vs angka netral).

Each track: **4 stations × 3 questions + flashcards**. Content is authored per language, so
examples can match the reader (rupiah figures vs neutral numbers).

---

<a id="cara-kerja--how-it-works"></a>
## Cara kerja · How it works

1. **Stasiun** — baca 4 poin materi (±1 menit). Tekan `Enter` untuk kuis stasiun itu.
2. **Kuis** — 3 soal pilihan ganda; setiap jawaban langsung disertai pembahasan.
3. **Ulang** — soal yang salah masuk kotak Leitner 0 dan akan muncul lagi besok lewat `tinjau`.
4. **Kartu** — hafalan cepat untuk istilah dan rumus penting.

Interval tinjauan mengikuti kotak Leitner: `0, 1, 3, 7, 14, 30` hari. Jawab benar → naik satu
kotak (jarak tinjauan makin panjang). Jawab salah → kembali ke kotak 0.

Review intervals follow a Leitner box: `0, 1, 3, 7, 14, 30` days. A correct answer promotes the
question one box (longer gap); a wrong answer sends it back to box 0.

### Data & privasi · Data & privacy

- Kemajuan tersimpan di `~/.railway-learn/progress.json` (JSON biasa — bisa dibaca & dihapus sendiri).
- Bisa dipindah dengan env `RAILWAY_HOME=/lokasi/lain`.
- Hapus semua data: `railway hapus --ya` (atau `railway reset --yes`).
- Berkas rusak otomatis dipindah ke `progress.json.corrupt`, tidak pernah dihapus diam-diam.
- **Tidak ada** telemetri, akun, iklan, atau permintaan jaringan.

---

## Struktur proyek · Project layout

```
src/
  cli.tsx              # Entry point: parsing argumen & perintah non-interaktif
  app.tsx              # Router antar-layar (state machine)
  help.ts              # Teks bantuan dwibahasa
  version.ts           # Nomor versi
  core/
    args.ts            # Parser argumen + saran salah ketik
    content.ts         # Registry konten (impor statis)
    validate.ts        # Validator skema konten (tanpa dependensi)
    i18n.ts            # Kamus UI Indonesia/Inggris
    quiz.ts            # Kuis, pengacakan, penilaian, Leitner box
    store.ts           # Kemajuan lokal (JSON di home)
    format.ts          # Durasi, persen, baris kemajuan
    types.ts           # Kontrak data bersama
  components/          # Komponen Ink (menu, kuis, kartu, progres, …)
  content/
    id/*.json          # Materi bahasa Indonesia (8 jalur)
    en/*.json          # Materi bahasa Inggris (8 jalur)
tests/                 # Pengujian Vitest
docs/                  # Dokumen tambahan (panduan menulis konten)
```

---

<a id="kontribusi--contributing"></a>
## Kontribusi · Contributing

Kontribusi paling berharga justru **bukan kode**: menulis materi baru.

The most valuable contribution is **not code** — it is new learning material.

```bash
npm install
npm test          # pengujian + validasi konten
npm run typecheck
npm run dev       # build ulang otomatis
```

Yang paling dibutuhkan:

- 📝 **Materi baru** — lihat [docs/MENULIS-KONTEN.md](docs/MENULIS-KONTEN.md) (cukup satu berkas JSON).
- 🌍 **Terjemahan & koreksi** — baik UI maupun isi materi.
- ♿ **Aksesibilitas** — lapor bila ada yang sulit dibaca pembaca layar.
- 🐛 **Laporan bug** — sertakan sistem operasi, versi Node, dan langkah mengulangnya.

Cara lengkap ada di [CONTRIBUTING.md](CONTRIBUTING.md).
Full guide in [CONTRIBUTING.md](CONTRIBUTING.md).

---

## Lisensi · Licence

MIT — pakai, salin, dan ubah sesukamu, termasuk untuk kepentingan komersial.
Lihat [LICENSE](LICENSE).

MIT — use, copy, and modify freely, including commercially. See [LICENSE](LICENSE).

---

<p align="center">
  Dibuat supaya siapa pun bisa belajar sedikit setiap hari, di mana pun, tanpa syarat.<br/>
  Built so anyone can learn a little every day, anywhere, with no strings attached. 🚂
</p>
