import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  addStudyTime,
  createEmptyProgress,
  getPaths,
  loadProgress,
  recordQuiz,
  recordStation,
  resetProgress,
  saveProgress,
  setLanguage,
  summariseAll,
  summariseTrack,
  todayKey,
  touchStreak,
} from '../src/core/store.js';

let home: string;

beforeEach(() => {
  home = mkdtempSync(join(tmpdir(), 'railway-test-'));
});

describe('penyimpanan kemajuan', () => {
  it('mengembalikan data kosong bila belum pernah menyimpan', () => {
    const progress = loadProgress(home);
    expect(progress.tracks).toEqual({});
    expect(progress.language).toBe('id');
  });

  it('menyimpan lalu memuat kembali', () => {
    const progress = createEmptyProgress('en');
    const file = saveProgress(progress, home);
    expect(existsSync(file)).toBe(true);
    expect(loadProgress(home).language).toBe('en');
  });

  it('memulihkan diri dari berkas yang rusak tanpa menghapusnya', () => {
    const { dir, file } = getPaths(home);
    mkdirSync(dir, { recursive: true });
    writeFileSync(file, '{ ini bukan json', 'utf8');
    const corrupted = join(dir, 'progress.json.corrupt');
    const progress = loadProgress(home);
    expect(progress.tracks).toEqual({});
    expect(existsSync(corrupted)).toBe(true);
  });

  it('menghapus data saat reset', () => {
    saveProgress(createEmptyProgress(), home);
    resetProgress(home);
    expect(loadProgress(home).tracks).toEqual({});
  });

  it('menyimpan dalam format JSON yang bisa dibaca manusia', () => {
    const file = saveProgress(createEmptyProgress(), home);
    const raw = readFileSync(file, 'utf8');
    expect(raw).toContain('\n');
    expect(() => JSON.parse(raw)).not.toThrow();
  });
});

describe('pencatatan belajar', () => {
  it('mencatat stasiun yang selesai tanpa duplikasi', () => {
    let progress = createEmptyProgress();
    progress = recordStation(progress, 'uang', 'anggaran');
    progress = recordStation(progress, 'uang', 'anggaran');
    expect(progress.tracks['uang']?.stationsCompleted).toEqual(['anggaran']);
  });

  it('mencatat hasil kuis: riwayat, akurasi, dan waktu', () => {
    let progress = createEmptyProgress();
    progress = recordQuiz(progress, {
      trackId: 'uang',
      results: [
        { questionId: 'uang:anggaran:q1', correct: true },
        { questionId: 'uang:anggaran:q2', correct: false },
      ],
      durationMs: 60_000,
    });

    const track = progress.tracks['uang'];
    expect(track?.quizHistory).toHaveLength(1);
    expect(track?.quizHistory[0]?.correct).toBe(1);
    expect(track?.timeSpentMs).toBe(60_000);
    expect(track?.questionStats['uang:anggaran:q1']?.box).toBe(1);
    expect(track?.questionStats['uang:anggaran:q2']?.box).toBe(0);
    expect(summariseTrack(progress, 'uang').questionsCorrect).toBe(1);
  });

  it('membatasi riwayat kuis agar berkas tidak membengkak', () => {
    let progress = createEmptyProgress();
    for (let i = 0; i < 80; i += 1) {
      progress = recordQuiz(progress, {
        trackId: 'uang',
        results: [{ questionId: `uang:anggaran:q${i % 3}`, correct: true }],
        durationMs: 1_000,
      });
    }
    expect(progress.tracks['uang']?.quizHistory.length).toBeLessThanOrEqual(50);
  });

  it('menambah waktu belajar', () => {
    let progress = createEmptyProgress();
    progress = addStudyTime(progress, 'digital', 5_000);
    progress = addStudyTime(progress, 'digital', 7_000);
    expect(summariseTrack(progress, 'digital').timeSpentMs).toBe(12_000);
  });

  it('mengubah bahasa tersimpan', () => {
    const progress = setLanguage(createEmptyProgress(), 'en');
    expect(progress.language).toBe('en');
  });
});

describe('rangkaian hari (streak)', () => {
  it('menambah streak pada hari yang sama hanya sekali', () => {
    const now = new Date('2026-03-10T09:00:00');
    let progress = createEmptyProgress();
    progress = touchStreak(progress, now);
    progress = touchStreak(progress, now);
    expect(progress.streak.current).toBe(1);
  });

  it('menyambung streak bila belajar di hari berikutnya', () => {
    const day1 = new Date('2026-03-10T09:00:00');
    const day2 = new Date('2026-03-11T09:00:00');
    let progress = createEmptyProgress();
    progress = touchStreak(progress, day1);
    progress = touchStreak(progress, day2);
    expect(progress.streak.current).toBe(2);
    expect(progress.streak.best).toBe(2);
  });

  it('mengulang dari 1 bila ada hari yang terlewat', () => {
    const day1 = new Date('2026-03-10T09:00:00');
    const day3 = new Date('2026-03-12T09:00:00');
    let progress = createEmptyProgress();
    progress = touchStreak(progress, day1);
    progress = touchStreak(progress, day3);
    expect(progress.streak.current).toBe(1);
    expect(progress.streak.best).toBe(1);
  });

  it('kunci hari memakai kalender lokal', () => {
    expect(todayKey(new Date('2026-01-05T23:30:00'))).toBe('2026-01-05');
  });
});

describe('ringkasan', () => {
  it('menjumlahkan seluruh jalur', () => {
    let progress = createEmptyProgress();
    progress = recordQuiz(progress, {
      trackId: 'uang',
      results: [
        { questionId: 'uang:anggaran:q1', correct: true },
        { questionId: 'uang:anggaran:q2', correct: true },
      ],
      durationMs: 1_000,
    });
    progress = recordStation(progress, 'uang', 'anggaran');

    const totals = summariseAll(progress);
    expect(totals.questionsAnswered).toBe(2);
    expect(totals.questionsCorrect).toBe(2);
    expect(totals.stationsCompleted).toBe(1);
  });

  it('memberi nol untuk jalur yang belum disentuh', () => {
    const totals = summariseAll(createEmptyProgress());
    expect(totals).toEqual({ attempts: 0, questionsAnswered: 0, questionsCorrect: 0, timeSpentMs: 0, stationsCompleted: 0 });
  });
});
