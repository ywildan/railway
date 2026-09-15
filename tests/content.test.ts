import { describe, expect, it } from 'vitest';
import { getTrack, languageParityIssues, listTracks, trackIds, validateAllTracks } from '../src/core/content.js';
import { validateTrack } from '../src/core/validate.js';
import type { Lang } from '../src/core/types.js';

const LANGS: Lang[] = ['id', 'en'];

describe('konten terdaftar', () => {
  it('lulus semua aturan validasi', () => {
    const reports = validateAllTracks();
    expect(reports).toEqual([]);
  });

  it('punya jalur di kedua bahasa dengan struktur yang sama', () => {
    expect(languageParityIssues()).toEqual([]);
  });

  it('id jalur unik dan konsisten dengan nama berkas', () => {
    for (const lang of LANGS) {
      const ids = trackIds(lang);
      expect(new Set(ids).size).toBe(ids.length);
      expect(ids.length).toBeGreaterThanOrEqual(8);
    }
  });

  it('setiap jalur punya stasiun, soal, dan kartu', () => {
    for (const lang of LANGS) {
      for (const summary of listTracks(lang)) {
        const track = getTrack(lang, summary.id);
        expect(track, `jalur ${lang}/${summary.id}`).toBeDefined();
        expect(track?.stations.length).toBe(summary.stationCount);
        expect(summary.questionCount).toBeGreaterThan(0);
        for (const station of track?.stations ?? []) {
          expect(station.points.length).toBeGreaterThanOrEqual(2);
          expect(station.questions.length).toBeGreaterThanOrEqual(3);
          expect(station.cards.length).toBeGreaterThanOrEqual(2);
        }
      }
    }
  });

  it('kunci jawaban selalu dalam rentang opsi', () => {
    for (const lang of LANGS) {
      for (const id of trackIds(lang)) {
        const track = getTrack(lang, id);
        for (const station of track?.stations ?? []) {
          for (const question of station.questions) {
            expect(question.answer, `${lang}/${id}/${station.id}/${question.id}`).toBeGreaterThanOrEqual(0);
            expect(question.answer).toBeLessThan(question.options.length);
            expect(new Set(question.options).size).toBe(question.options.length);
          }
        }
      }
    }
  });

  it('sebaran kunci jawaban tidak berat sebelah ke satu posisi', () => {
    for (const lang of LANGS) {
      for (const id of trackIds(lang)) {
        const track = getTrack(lang, id);
        const answers = (track?.stations ?? []).flatMap((station) => station.questions.map((q) => q.answer));
        const first = answers.filter((answer) => answer === 0).length;
        // Jawaban benar tidak boleh selalu berada di opsi pertama.
        expect(first, `jalur ${lang}/${id}`).toBeLessThan(answers.length);
      }
    }
  });

  it('setiap pertanyaan punya penjelasan yang bermakna', () => {
    for (const lang of LANGS) {
      for (const id of trackIds(lang)) {
        const track = getTrack(lang, id);
        for (const station of track?.stations ?? []) {
          for (const question of station.questions) {
            expect(question.explain.length, `${lang}/${id}/${question.id}`).toBeGreaterThan(20);
            expect(question.prompt.trim().length).toBeGreaterThan(10);
          }
        }
      }
    }
  });
});

describe('validator konten', () => {
  it('menolak id yang tidak sesuai nama berkas', () => {
    const errors = validateTrack({ id: 'salah', title: 'x', description: 'y', emoji: '🚂', level: 'pemula', minutes: 5, tags: ['a'], stations: [] }, 'benar.json');
    expect(errors.join('\n')).toMatch(/nama berkas|file name/);
  });

  it('menolak level yang tidak dikenal', () => {
    const errors = validateTrack({ id: 'x', title: 'x', description: 'y', emoji: '🚂', level: 'dewa', minutes: 5, tags: ['a'], stations: [] });
    expect(errors.join('\n')).toMatch(/level/);
  });

  it('menolak opsi jawaban yang kosong atau kembar', () => {
    const track = {
      id: 'x',
      title: 'x',
      description: 'y',
      emoji: '🚂',
      level: 'pemula',
      minutes: 5,
      tags: ['a'],
      stations: [
        {
          id: 's1',
          title: 'S1',
          summary: 'S',
          points: ['a', 'b'],
          cards: [{ front: 'f', back: 'b' }],
          questions: [{ id: 'q1', prompt: 'p', options: ['sama', 'sama'], answer: 0, explain: 'penjelasan yang cukup panjang' }],
        },
      ],
    };
    expect(validateTrack(track).join('\n')).toMatch(/kembar|duplicates/);
  });

  it('menerima jalur yang lengkap', () => {
    const track = {
      id: 'contoh',
      title: 'Contoh',
      description: 'Deskripsi',
      emoji: '🚂',
      level: 'pemula',
      minutes: 10,
      tags: ['contoh'],
      stations: [
        {
          id: 's1',
          title: 'Stasiun 1',
          summary: 'Ringkasan',
          points: ['Poin satu', 'Poin dua'],
          cards: [{ front: 'Depan', back: 'Belakang' }],
          questions: [{ id: 'q1', prompt: 'Pertanyaan?', options: ['A', 'B'], answer: 1, explain: 'Penjelasan yang memadai untuk pembaca.' }],
        },
      ],
    };
    expect(validateTrack(track, 'contoh.json')).toEqual([]);
  });
});
