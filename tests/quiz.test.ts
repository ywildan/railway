import { describe, expect, it } from 'vitest';
import { buildReviewQueue, buildSession, collectQuestions, createRng, daysBetween, grade, nextDueDate, questionKey, shuffle } from '../src/core/quiz.js';
import { createEmptyProgress, recordQuiz } from '../src/core/store.js';
import { getTrack } from '../src/core/content.js';
import type { QuestionStat } from '../src/core/store.js';

const track = getTrack('id', 'uang');

describe('koleksi soal', () => {
  it('menghasilkan kunci gabungan jalur:stasiun:soal', () => {
    if (!track) throw new Error('jalur uang tidak ditemukan');
    const items = collectQuestions(track);
    expect(items.length).toBeGreaterThan(0);
    expect(items[0]?.key).toBe(questionKey('uang', items[0]!.stationId, items[0]!.questionId));
  });

  it('bisa menyaring hanya satu stasiun', () => {
    if (!track) throw new Error('jalur uang tidak ditemukan');
    const items = collectQuestions(track, 'anggaran');
    expect(items.length).toBe(3);
    expect(items.every((item) => item.stationId === 'anggaran')).toBe(true);
  });

  it('mengembalikan daftar kosong untuk stasiun yang tidak ada', () => {
    if (!track) throw new Error('jalur uang tidak ditemukan');
    expect(collectQuestions(track, 'tidak-ada')).toEqual([]);
  });
});

describe('pengacakan', () => {
  it('acak dengan seed tertentu bisa diulang', () => {
    const source = [1, 2, 3, 4, 5, 6, 7, 8];
    expect(shuffle(source, createRng(42))).toEqual(shuffle(source, createRng(42)));
  });

  it('tidak mengubah isi, hanya urutan', () => {
    const source = ['a', 'b', 'c', 'd'];
    const result = shuffle(source, createRng(7));
    expect([...result].sort()).toEqual([...source].sort());
  });

  it('tidak mengubah array asli', () => {
    const source = [1, 2, 3];
    shuffle(source, createRng(1));
    expect(source).toEqual([1, 2, 3]);
  });
});

describe('sesi kuis', () => {
  it('membatasi jumlah soal', () => {
    if (!track) throw new Error('jalur uang tidak ditemukan');
    const session = buildSession(collectQuestions(track), { limit: 5, shuffleQuestions: false });
    expect(session).toHaveLength(5);
  });

  it('tetap menjaga jawaban benar saat opsi diacak', () => {
    if (!track) throw new Error('jalur uang tidak ditemukan');
    const source = collectQuestions(track);
    const session = buildSession(source, { shuffleOptions: true, rng: createRng(99) });
    for (const item of session) {
      const original = source.find((entry) => entry.key === item.key);
      expect(item.options[item.answer]).toBe(original?.options[original.answer]);
    }
  });

  it('menyimpan urutan bila tidak diminta mengacak', () => {
    if (!track) throw new Error('jalur uang tidak ditemukan');
    const source = collectQuestions(track);
    const session = buildSession(source, { shuffleQuestions: false });
    expect(session.map((item) => item.key)).toEqual(source.map((item) => item.key));
  });
});

describe('penilaian', () => {
  it('menghitung nilai dengan benar', () => {
    if (!track) throw new Error('jalur uang tidak ditemukan');
    const session = buildSession(collectQuestions(track), { shuffleQuestions: false, limit: 4 });
    const answers: Record<string, number> = {};
    session.forEach((item, index) => {
      // dua jawaban benar, dua salah
      answers[item.key] = index < 2 ? item.answer : (item.answer + 1) % item.options.length;
    });
    const result = grade(session, answers);
    expect(result.total).toBe(4);
    expect(result.correct).toBe(2);
    expect(result.accuracy).toBeCloseTo(0.5);
  });

  it('jawaban yang tidak diberikan dihitung salah', () => {
    if (!track) throw new Error('jalur uang tidak ditemukan');
    const session = buildSession(collectQuestions(track), { shuffleQuestions: false, limit: 2 });
    const result = grade(session, {});
    expect(result.correct).toBe(0);
    expect(result.records.every((record) => record.chosen === -1)).toBe(true);
  });

  it('sesi kosong tidak membagi dengan nol', () => {
    const result = grade([], {});
    expect(result.accuracy).toBe(0);
  });
});

describe('pengulangan berjarak', () => {
  it('soal yang belum pernah dikerjakan langsung jatuh tempo', () => {
    const now = new Date('2026-05-01T10:00:00');
    expect(nextDueDate(undefined, now).getTime()).toBe(now.getTime());
  });

  it('interval tinjauan memanjang seiring kotak Leitner', () => {
    const now = new Date('2026-05-01T10:00:00');
    const stat = (box: number): QuestionStat => ({ seen: 1, correct: 1, wrong: 0, box, lastSeen: '2026-05-01T10:00:00' });
    const day = 24 * 60 * 60 * 1000;
    expect(nextDueDate(stat(0), now).getTime() - now.getTime()).toBe(0);
    expect(nextDueDate(stat(1), now).getTime() - now.getTime()).toBe(day);
    expect(daysBetween(now, nextDueDate(stat(5), now))).toBe(30);
  });

  it('soal yang baru saja salah masuk antrean tinjauan', () => {
    if (!track) throw new Error('jalur uang tidak ditemukan');
    const wrongKey = questionKey('uang', 'anggaran', 'q1');
    let progress = createEmptyProgress();
    progress = recordQuiz(progress, {
      trackId: 'uang',
      results: [{ questionId: wrongKey, correct: false }],
      durationMs: 1_000,
    }, new Date('2026-05-01T10:00:00'));

    const queue = buildReviewQueue(track, progress, new Date('2026-05-01T11:00:00'), 5);
    expect(queue[0]?.key).toBe(wrongKey);
  });

  it('tidak mengulang soal yang baru saja dijawab benar', () => {
    if (!track) throw new Error('jalur uang tidak ditemukan');
    const correctKey = questionKey('uang', 'anggaran', 'q1');
    let progress = createEmptyProgress();
    progress = recordQuiz(progress, {
      trackId: 'uang',
      results: [{ questionId: correctKey, correct: true }],
      durationMs: 1_000,
    }, new Date('2026-05-01T10:00:00'));

    const later = new Date('2026-05-02T10:00:00'); // kotak 1 → jatuh tempo besok
    const queue = buildReviewQueue(track, progress, later, 20);
    expect(queue.some((item) => item.key === correctKey)).toBe(true);
    expect(buildReviewQueue(track, progress, new Date('2026-05-01T12:00:00'), 20).some((item) => item.key === correctKey)).toBe(false);
  });

  it('menghormati batas jumlah soal tinjauan', () => {
    if (!track) throw new Error('jalur uang tidak ditemukan');
    const queue = buildReviewQueue(track, createEmptyProgress(), new Date(), 4);
    expect(queue.length).toBeLessThanOrEqual(4);
  });
});
