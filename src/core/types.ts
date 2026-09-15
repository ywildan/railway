/**
 * Tipe data inti Railway.
 * Core data types for Railway.
 *
 * Kontrak ini dipakai bersama oleh loader konten, mesin kuis, dan komponen UI,
 * sehingga satu perubahan di sini langsung terdeteksi oleh `npm run typecheck`
 * dan pengujian validasi konten di tests/content.test.ts.
 */

/** Bahasa antarmuka yang didukung. Supported UI languages. */
export type Lang = 'id' | 'en';

/** Level kesulitan kanonik (kunci stabil, label diterjemahkan saat ditampilkan). */
export type Level = 'pemula' | 'menengah' | 'lanjutan';

export interface Question {
  /** Unik di dalam satu stasiun. Unique within a station. */
  id: string;
  prompt: string;
  /** Minimal 2, maksimal 5 opsi. Between 2 and 5 options. */
  options: string[];
  /** Indeks jawaban benar (0-based) ke dalam `options`. */
  answer: number;
  /** Penjelasan singkat yang ditampilkan setelah menjawab. */
  explain: string;
}

export interface Flashcard {
  front: string;
  back: string;
}

/** Satu "stasiun" = satu unit materi + latihan. */
export interface Station {
  /** Unik di dalam satu jalur. Unique within a track. */
  id: string;
  title: string;
  summary: string;
  /** Poin-poin materi utama. Key learning points. */
  points: string[];
  questions: Question[];
  cards: Flashcard[];
}

/** Satu berkas konten = satu jalur belajar. */
export interface Track {
  /** Harus sama dengan nama berkas (tanpa .json). Must match the file name. */
  id: string;
  title: string;
  description: string;
  emoji: string;
  level: Level;
  /** Perkiraan waktu tempuh total dalam menit. */
  minutes: number;
  tags: string[];
  stations: Station[];
}

/** Ringkasan jalur untuk keperluan daftar (tanpa memuat seluruh soal). */
export interface TrackSummary {
  id: string;
  title: string;
  description: string;
  emoji: string;
  level: Level;
  minutes: number;
  tags: string[];
  stationCount: number;
  questionCount: number;
}
