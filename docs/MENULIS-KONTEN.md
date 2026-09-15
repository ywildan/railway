# Panduan Menulis Konten · Writing Content Guide

Menambah jalur belajar baru tidak butuh keahlian React atau TypeScript — cukup **satu berkas JSON
per bahasa**. Panduan ini ditulis untuk siapa saja: guru, orang tua, mahasiswa, atau relawan
komunitas.

Adding a new learning track needs no React or TypeScript skill — just **one JSON file per
language**. This guide is for everyone: teachers, parents, students, community volunteers.

---

## 1. Tiga langkah cepat · Quick start

1. Salin berkas yang sudah ada sebagai contoh:
   `cp src/content/id/uang.json src/content/id/jalur-baru.json`
2. Ubah isinya (id, judul, stasiun, soal, kartu).
3. Daftarkan di `src/core/content.ts`:

   ```ts
   import jalurBaruId from '../content/id/jalur-baru.json';

   const REGISTRY: Record<Lang, Track[]> = {
     id: [uangId, digitalId, /* … */ jalurBaruId].map(asTrack),
     en: [uangEn, digitalEn, /* … */].map(asTrack),
   };
   ```

4. Jalankan `npm test` — validator akan menolak berkas yang belum rapi (dan memberi tahu apa yang
   kurang).

> Jika hanya menulis satu bahasa, jalurnya tetap muncul untuk bahasa itu. Pengujian
> `languageParityIssues` akan mengingatkan bahwa pasangannya belum ada.
> A single-language track still ships; the parity test simply reminds you the pair is missing.

---

## 2. Bentuk berkas · File shape

```jsonc
{
  "id": "uang",                    // wajib: huruf kecil + tanda hubung, SAMA dengan nama berkas
  "title": "Literasi Keuangan",
  "description": "Satu kalimat yang menjelaskan manfaat jalur ini.",
  "emoji": "💰",                    // satu emoji, dipakai di daftar jalur
  "level": "pemula",               // pemula | menengah | lanjutan  (kunci stabil, label diterjemahkan)
  "minutes": 25,                   // perkiraan waktu tempuh total
  "tags": ["keuangan", "keluarga"],
  "stations": [
    {
      "id": "anggaran",            // unik di dalam jalur
      "title": "Menyusun Anggaran",
      "summary": "Satu kalimat pembuka yang memberi gambaran.",
      "points": ["Poin 1", "Poin 2", "Poin 3", "Poin 4"],   // minimal 2, idealnya 3–5
      "questions": [
        {
          "id": "q1",              // unik di dalam stasiun
          "prompt": "Teks pertanyaan yang jelas.",
          "options": ["A", "B", "C", "D"],                  // 2–5 opsi, tidak boleh kembar
          "answer": 2,             // indeks 0-based ke dalam options
          "explain": "Kenapa jawaban itu benar — minimal satu kalimat yang mengajar."
        }
      ],
      "cards": [
        { "front": "Istilah", "back": "Penjelasan singkat" }   // minimal 1
      ]
    }
  ]
}
```

---

## 3. Aturan wajib · Hard rules

Diperiksa otomatis oleh `src/core/validate.ts` dan `tests/content.test.ts`:

| Aturan | Alasan |
|---|---|
| `id` = nama berkas, huruf kecil, tanda hubung | Perintah CLI memakai id ini |
| Id stasiun & soal unik di lingkupnya | Statistik kemajuan tersimpan per id |
| `answer` harus indeks yang valid (0 … n-1) | Kalau meleset, kuis tidak bisa lulus |
| Opsi 2–5 dan tidak ada yang kembar | Pilihan ganda harus bisa dijawab & terbaca |
| `explain` lebih dari 20 karakter | Jawaban tanpa penjelasan tidak mengajarkan apa pun |
| Jawaban benar tidak selalu di opsi pertama | Menghindari pola yang bisa ditebak |
| Minimal 1 stasiun, 2 poin, 1 soal, 1 kartu | Menjaga kualitas minimum |

---

## 4. Prinsip menulis · Writing principles

**Tulis seperti menjelaskan ke teman, bukan seperti menguji.**
Soal terbaik mengajarkan sesuatu meskipun dijawab salah.

1. **Satu ide per soal.** Kalau butuh dua paragraf untuk menjelaskan, pecah jadi dua soal.
2. **Pengecoh yang masuk akal.** Opsi salah harus keliru karena alasan yang bisa dipahami,
   bukan karena ngawur — justru di situ letak pelajarannya.
3. **Penjelasan mengajar.** Tulis *mengapa*, bukan hanya *bahwa*. Contoh buruk:
   "Jawabannya B." Contoh baik: "50% dari Rp4.000.000 = Rp2.000.000, karena persen berarti per
   seratus."
4. **Konkret & lokal.** Angka rupiah, makanan sehari-hari, situasi nyata. Hindari contoh abstrak
   yang tidak pernah ditemui pembaca.
5. **Netral & aman.** Jangan memuat politik praktis, SARA, merek dagang, atau anjuran medis yang
   menentukan. Untuk kesehatan/hukum/keuangan, arahkan ke tenaga atau lembaga profesional.
6. **Sebarkan kunci jawaban.** Jangan biarkan semua jawaban benar di posisi yang sama.
7. **Hormati pembaca pemula.** Hindari jargon; kalau terpaksa, jelaskan di poin materi.

---

## 5. Konten dwibahasa · Bilingual content

- Struktur **harus sama**: id jalur, id stasiun, dan jumlah soal identik antarbahasa
  (diperiksa oleh `languageParityIssues`).
- Isi **boleh disesuaikan** dengan pembacanya: versi Indonesia memakai rupiah dan PPN 11%, versi
  Inggris bisa memakai angka netral. Yang penting setara secara konsep.
- Terjemahkan **maksud**, bukan kata per kata.

---

## 6. Menambah teks antarmuka baru · Adding UI strings

Kalau butuh teks UI baru (bukan materi), tambahkan ke **kedua** kamus di `src/core/i18n.ts`:

```ts
const id = { /* … */ 'menu.contoh': 'Contoh', /* … */ } as const;
const en: Record<UiKey, string> = { /* … */ 'menu.contoh': 'Example', /* … */ };
```

Pengujian `tests/i18n.test.ts` akan gagal bila salah satu bahasa ketinggalan atau placeholder
`{nama}`-nya tidak sama.

---

## 7. Sebelum mengirim · Before you submit

```bash
npm test          # menjalankan semua pengujian, termasuk validasi konten
npm run typecheck # memastikan tidak ada yang rusak
```

Lalu buka *pull request* ke `main` dengan deskripsi singkat: jalur apa yang ditambahkan dan
untuk siapa jalur itu bermanfaat. Terima kasih! 🙏
