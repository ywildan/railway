# Kontribusi · Contributing

Terima kasih sudah meluangkan waktu. Repo ini ingin berguna untuk **semua kalangan** — pelajar,
guru, orang tua, pekerja, UMKM, sampai lansia yang baru mulai memakai komputer. Karena itu
kontribusi yang paling berharga sering kali **bukan kode**, melainkan materi yang jujur dan
mudah dipahami.

Thanks for your time. This repo wants to be useful to **everyone** — students, teachers, parents,
workers, small businesses, and people just getting started with computers. So the most valuable
contribution is often **not code** but honest, understandable material.

---

## Cara cepat berkontribusi · Fastest ways to help

| Jenis | Untuk siapa | Mulai dari |
|---|---|---|
| 📝 Menulis materi baru | Guru, praktisi, siapa pun | [docs/MENULIS-KONTEN.md](docs/MENULIS-KONTEN.md) |
| 🌍 Terjemahan & koreksi bahasa | Penutur ID/EN | `src/content/*/` dan `src/core/i18n.ts` |
| 🐛 Laporan bug | Siapa pun | [Issues](https://github.com/ywildan/railway/issues) |
| ♿ Perbaikan aksesibilitas | Siapa pun | Lihat catatan di bawah |
| 🧑‍💻 Fitur & perbaikan kode | Developer | Bagian "Menjalankan proyek" |

---

## Menjalankan proyek · Running the project

Butuh Node.js 20 atau lebih baru / requires Node.js 20+.

```bash
git clone https://github.com/ywildan/railway.git
cd railway
npm install
npm test            # 70+ pengujian, termasuk validasi konten
npm run typecheck   # pemeriksaan tipe ketat
npm run build       # menghasilkan dist/cli.js
npm run dev         # build ulang otomatis saat berkas berubah
npm start -- jalur  # menjalankan CLI hasil build
```

### Menguji tampilan interaktif

CLI-nya interaktif, jadi butuh terminal sungguhan:

```bash
npm start -- mulai uang
```

Untuk menguji tanpa mengubah data aslimu, arahkan direktori data ke lokasi sementara:

```bash
RAILWAY_HOME=/tmp/railway-coba npm start -- mulai uang
```

---

## Aturan kepatutan · Ground rules

1. **Ramah & sabar.** Banyak kontributor adalah kontributor pertama kali.
2. **Satu ide per pull request.** Materi baru dipisah dari perubahan kode.
3. **Jelaskan dampaknya.** Untuk perubahan materi, tuliskan siapa yang terbantu.
4. **Netral & aman.** Tidak ada politik praktis, ujaran kebencian, SARA, atau anjuran medis/
   hukum/keuangan yang menentukan. Untuk topik berisiko, arahkan ke profesional.
5. **Hormati privasi.** Fitur baru tidak boleh menambahkan telemetri atau permintaan jaringan —
   offline adalah janji utama aplikasi ini.

---

## Standar kode · Code standards

- TypeScript **ketat** (`strict: true`); `npm run typecheck` harus bersih.
- Tidak menambah dependensi baru tanpa alasan kuat — ukuran dan kecepatan pasang itu penting
  untuk perangkat sekolah/kampus.
- Semua teks antarmuka hidup di `src/core/i18n.ts`, **lengkap di dua bahasa**.
- Logika murni (kuis, penyimpanan, format) diletakkan di `src/core/` supaya mudah diuji;
  komponen `src/components/` hanya mengurus tampilan.
- Setiap perubahan logika baru disertai pengujian di `tests/`.

---

## Aksesibilitas · Accessibility

- Jangan menyandikan informasi hanya lewat warna (pakai juga ikon/teks seperti `✓` / `✗`).
- Hormati `NO_COLOR` dan flag `--no-color`.
- Jaga lebar baris tetap nyaman (< 100 kolom) supaya aman di layar sempit dan terminal HP.
- Tombol harus bisa dijangkau tanpa tetikus: panah, angka, `Enter`, `Spasi`, `Esc`.

---

## Lisensi · Licence

Dengan berkontribusi, kamu setuju bahwa kontribusimu dirilis di bawah lisensi MIT yang sama
dengan proyek ini. Lihat [LICENSE](LICENSE).

By contributing you agree that your contribution is released under the same MIT licence as this
project. See [LICENSE](LICENSE).
