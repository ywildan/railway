import type { ProgressFile, QuestionStat } from './store.js';
import type { Station, Track } from './types.js';

/**
 * Mesin kuis & pengulangan berjarak.
 * Quiz engine & spaced repetition.
 *
 * Soal diidentifikasi dengan kunci gabungan "jalur:stasiun:soal" supaya statistik
 * tersimpan unik meski dua jalur punya id soal yang sama (mis. "q1").
 */

export interface QuizItem {
  key: string;
  trackId: string;
  stationId: string;
  questionId: string;
  stationTitle: string;
  prompt: string;
  options: string[];
  answer: number;
  explain: string;
}

export function questionKey(trackId: string, stationId: string, questionId: string): string {
  return `${trackId}:${stationId}:${questionId}`;
}

export function collectQuestions(track: Track, stationId?: string): QuizItem[] {
  const stations: Station[] = stationId
    ? track.stations.filter((station) => station.id === stationId)
    : track.stations;

  return stations.flatMap((station) =>
    station.questions.map((question) => ({
      key: questionKey(track.id, station.id, question.id),
      trackId: track.id,
      stationId: station.id,
      questionId: question.id,
      stationTitle: station.title,
      prompt: question.prompt,
      options: question.options,
      answer: question.answer,
      explain: question.explain,
    })),
  );
}

/** RNG kecil & deterministik (mulberry32) — membuat pengujian bisa diulang. */
export function createRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(items: T[], rng: () => number = Math.random): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const a = copy[i] as T;
    const b = copy[j] as T;
    copy[i] = b;
    copy[j] = a;
  }
  return copy;
}

export interface SessionOptions {
  /** Acak urutan soal. Default: true. */
  shuffleQuestions?: boolean;
  /** Acak urutan opsi jawaban. Default: false (urutan opsi tetap stabil). */
  shuffleOptions?: boolean;
  limit?: number;
  rng?: () => number;
}

export function buildSession(items: QuizItem[], options: SessionOptions = {}): QuizItem[] {
  const rng = options.rng ?? Math.random;
  const shuffled = options.shuffleQuestions === false ? [...items] : shuffle(items, rng);
  const limited = options.limit && options.limit > 0 ? shuffled.slice(0, options.limit) : shuffled;

  if (options.shuffleOptions !== true) return limited;

  return limited.map((item) => {
    const correct = item.options[item.answer] as string;
    const options = shuffle(item.options, rng);
    return { ...item, options, answer: options.indexOf(correct) };
  });
}

export interface AnswerRecord {
  key: string;
  questionId: string;
  chosen: number;
  correct: boolean;
}

export interface GradeResult {
  total: number;
  correct: number;
  accuracy: number;
  records: AnswerRecord[];
}

export function grade(session: QuizItem[], answers: Record<string, number>): GradeResult {
  const records: AnswerRecord[] = session.map((item) => {
    const chosen = answers[item.key] ?? -1;
    return {
      key: item.key,
      questionId: item.questionId,
      chosen,
      correct: chosen === item.answer,
    };
  });
  const correct = records.filter((record) => record.correct).length;
  return {
    total: session.length,
    correct,
    accuracy: session.length === 0 ? 0 : correct / session.length,
    records,
  };
}

/** Interval tinjauan (hari) untuk tiap kotak Leitner 0–5. */
export const REVIEW_INTERVAL_DAYS = [0, 1, 3, 7, 14, 30] as const;

const DAY_MS = 24 * 60 * 60 * 1000;

export function nextDueDate(stat: QuestionStat | undefined, from: Date = new Date()): Date {
  if (!stat?.lastSeen) return from;
  const box = Math.min(REVIEW_INTERVAL_DAYS.length - 1, Math.max(0, stat.box));
  const days = REVIEW_INTERVAL_DAYS[box] ?? 0;
  const last = new Date(stat.lastSeen).getTime();
  return new Date(last + days * DAY_MS);
}

export interface ReviewItem extends QuizItem {
  stat?: QuestionStat;
  due: boolean;
}

/**
 * Menyusun antrean tinjauan: soal yang belum pernah dikerjakan & yang sudah jatuh
 * tempo diurutkan lebih dulu, lalu yang paling sering salah.
 */
export function buildReviewQueue(
  track: Track,
  progress: ProgressFile,
  now: Date = new Date(),
  limit = 12,
): ReviewItem[] {
  const stats = progress.tracks[track.id]?.questionStats ?? {};
  const items = collectQuestions(track).map<ReviewItem>((item) => {
    const stat = stats[item.key];
    const due = nextDueDate(stat, now).getTime() <= now.getTime();
    return { ...item, stat, due };
  });

  /**
   * Urutan prioritas:
   *  1. soal yang pernah salah (paling sering salah paling depan),
   *  2. soal yang belum pernah dikerjakan,
   *  3. soal yang sudah jatuh tempo menurut kotak Leitner.
   */
  const rank = (item: ReviewItem): number => {
    if (item.stat && item.stat.wrong > 0) {
      return -1000 + item.stat.box * 10 - item.stat.wrong * 5;
    }
    if (!item.stat) return 0;
    return item.stat.box * 10;
  };

  return items
    .filter((item) => item.due || !item.stat)
    .sort((a, b) => rank(a) - rank(b))
    .slice(0, limit);
}

export function daysBetween(from: Date, to: Date): number {
  const a = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const b = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((b - a) / DAY_MS);
}
