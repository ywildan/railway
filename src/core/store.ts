import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import type { Lang } from './types.js';

/**
 * Penyimpanan kemajuan lokal.
 * Local progress storage.
 *
 * Sengaja berupa berkas JSON biasa di direktori home supaya:
 *  - transparan (bisa dibuka & dihapus sendiri),
 *  - mudah dicadangkan,
 *  - tidak butuh database atau akun.
 *
 * Lokasi bisa dipindah dengan env RAILWAY_HOME.
 */

export interface QuizAttempt {
  /** ISO timestamp. */
  at: string;
  trackId: string;
  stationId?: string;
  correct: number;
  total: number;
  durationMs: number;
}

export interface QuestionStat {
  seen: number;
  correct: number;
  wrong: number;
  /** Kotak Leitner 0–5; makin tinggi makin jarang ditinjau. */
  box: number;
  lastSeen?: string;
  lastCorrect?: boolean;
}

export interface TrackProgress {
  stationsCompleted: string[];
  quizHistory: QuizAttempt[];
  questionStats: Record<string, QuestionStat>;
  timeSpentMs: number;
  updatedAt: string;
}

export interface ProgressFile {
  version: 1;
  language: Lang;
  createdAt: string;
  streak: { current: number; best: number; lastDate?: string };
  tracks: Record<string, TrackProgress>;
}

export const DATA_DIR_NAME = '.railway-learn';

/**
 * Menentukan direktori data.
 * Argumen `home` dipakai untuk pengujian; bila tidak diisi, env RAILWAY_HOME
 * dihormati, lalu direktori home pengguna.
 */
export function resolveDataDir(home?: string): string {
  if (home) return join(home, DATA_DIR_NAME);
  return process.env['RAILWAY_HOME'] || join(homedir(), DATA_DIR_NAME);
}

export function getPaths(home?: string): { dir: string; file: string } {
  const dir = resolveDataDir(home);
  return { dir, file: join(dir, 'progress.json') };
}

/** Kunci hari lokal (YYYY-MM-DD) — penting untuk streak di zona waktu apa pun. */
export function todayKey(now: Date = new Date()): string {
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function createEmptyProgress(language: Lang = 'id'): ProgressFile {
  return {
    version: 1,
    language,
    createdAt: new Date().toISOString(),
    streak: { current: 0, best: 0 },
    tracks: {},
  };
}

export function emptyTrackProgress(): TrackProgress {
  return {
    stationsCompleted: [],
    quizHistory: [],
    questionStats: {},
    timeSpentMs: 0,
    updatedAt: new Date().toISOString(),
  };
}

function coerce(data: unknown): ProgressFile {
  const fallback = createEmptyProgress();
  if (!data || typeof data !== 'object') return fallback;
  const raw = data as Partial<ProgressFile>;
  return {
    version: 1,
    language: raw.language === 'en' ? 'en' : 'id',
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : fallback.createdAt,
    streak: {
      current: Number(raw.streak?.current) || 0,
      best: Number(raw.streak?.best) || 0,
      lastDate: typeof raw.streak?.lastDate === 'string' ? raw.streak.lastDate : undefined,
    },
    tracks: raw.tracks && typeof raw.tracks === 'object' ? (raw.tracks as ProgressFile['tracks']) : {},
  };
}

/** Membaca kemajuan; berkas rusak dipindah ke .corrupt, tidak menghapus data lama. */
export function loadProgress(home?: string): ProgressFile {
  const { file } = getPaths(home);
  if (!existsSync(file)) return createEmptyProgress();
  try {
    const parsed: unknown = JSON.parse(readFileSync(file, 'utf8'));
    return coerce(parsed);
  } catch {
    try {
      renameSync(file, `${file}.corrupt`);
    } catch {
      /* diamkan: yang penting aplikasi tetap jalan */
    }
    return createEmptyProgress();
  }
}

export function saveProgress(progress: ProgressFile, home?: string): string {
  const { dir, file } = getPaths(home);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(file, `${JSON.stringify(progress, null, 2)}\n`, 'utf8');
  return file;
}

export function resetProgress(home?: string): void {
  const { file } = getPaths(home);
  if (existsSync(file)) {
    try {
      renameSync(file, join(dirname(file), 'progress.deleted.json'));
    } catch {
      writeFileSync(file, `${JSON.stringify(createEmptyProgress(), null, 2)}\n`, 'utf8');
    }
  }
}

function trackOf(progress: ProgressFile, trackId: string): TrackProgress {
  const existing = progress.tracks[trackId];
  if (existing) return existing;
  const created = emptyTrackProgress();
  progress.tracks[trackId] = created;
  return created;
}

function touch(track: TrackProgress): void {
  track.updatedAt = new Date().toISOString();
}

/** Memperbarui streak harian berdasarkan aktivitas hari ini. */
export function touchStreak(progress: ProgressFile, now: Date = new Date()): ProgressFile {
  const today = todayKey(now);
  const { streak } = progress;
  if (streak.lastDate === today) return progress;

  const yesterday = todayKey(new Date(now.getTime() - 24 * 60 * 60 * 1000));
  streak.current = streak.lastDate === yesterday ? streak.current + 1 : 1;
  streak.best = Math.max(streak.best, streak.current);
  streak.lastDate = today;
  return progress;
}

export interface QuizResultInput {
  trackId: string;
  stationId?: string;
  /** id soal → benar/salah. question id → correct? */
  results: Array<{ questionId: string; correct: boolean }>;
  durationMs: number;
}

/** Mencatat satu sesi kuis: riwayat, statistik per soal, kotak Leitner, streak. */
export function recordQuiz(progress: ProgressFile, input: QuizResultInput, now: Date = new Date()): ProgressFile {
  const track = trackOf(progress, input.trackId);
  const correct = input.results.filter((r) => r.correct).length;
  track.quizHistory.push({
    at: now.toISOString(),
    trackId: input.trackId,
    stationId: input.stationId,
    correct,
    total: input.results.length,
    durationMs: input.durationMs,
  });
  if (track.quizHistory.length > 50) {
    track.quizHistory = track.quizHistory.slice(-50);
  }

  for (const { questionId, correct: isCorrect } of input.results) {
    const stat = track.questionStats[questionId] ?? { seen: 0, correct: 0, wrong: 0, box: 0 };
    stat.seen += 1;
    if (isCorrect) {
      stat.correct += 1;
      stat.box = Math.min(5, stat.box + 1);
    } else {
      stat.wrong += 1;
      stat.box = 0;
    }
    stat.lastSeen = now.toISOString();
    stat.lastCorrect = isCorrect;
    track.questionStats[questionId] = stat;
  }

  track.timeSpentMs += input.durationMs;
  touch(track);
  return touchStreak(progress, now);
}

export function recordStation(progress: ProgressFile, trackId: string, stationId: string, now: Date = new Date()): ProgressFile {
  const track = trackOf(progress, trackId);
  if (!track.stationsCompleted.includes(stationId)) {
    track.stationsCompleted.push(stationId);
  }
  touch(track);
  return touchStreak(progress, now);
}

export function addStudyTime(progress: ProgressFile, trackId: string, ms: number): ProgressFile {
  const track = trackOf(progress, trackId);
  track.timeSpentMs += ms;
  touch(track);
  return progress;
}

export function setLanguage(progress: ProgressFile, language: Lang): ProgressFile {
  progress.language = language;
  return progress;
}

export interface TrackStat {
  trackId: string;
  stationsCompleted: number;
  questionsAnswered: number;
  questionsCorrect: number;
  attempts: number;
  lastScore?: { correct: number; total: number; at: string };
  timeSpentMs: number;
}

export function summariseTrack(progress: ProgressFile, trackId: string): TrackStat {
  const track = progress.tracks[trackId];
  const stats = Object.values(track?.questionStats ?? {});
  const last = track?.quizHistory.at(-1);
  return {
    trackId,
    stationsCompleted: track?.stationsCompleted.length ?? 0,
    questionsAnswered: stats.reduce((sum, s) => sum + s.seen, 0),
    questionsCorrect: stats.reduce((sum, s) => sum + s.correct, 0),
    attempts: track?.quizHistory.length ?? 0,
    lastScore: last ? { correct: last.correct, total: last.total, at: last.at } : undefined,
    timeSpentMs: track?.timeSpentMs ?? 0,
  };
}

export function summariseAll(progress: ProgressFile): {
  attempts: number;
  questionsAnswered: number;
  questionsCorrect: number;
  timeSpentMs: number;
  stationsCompleted: number;
} {
  const tracks = Object.values(progress.tracks);
  return {
    attempts: tracks.reduce((sum, tr) => sum + tr.quizHistory.length, 0),
    questionsAnswered: tracks.reduce((sum, tr) => sum + Object.values(tr.questionStats).reduce((s, q) => s + q.seen, 0), 0),
    questionsCorrect: tracks.reduce((sum, tr) => sum + Object.values(tr.questionStats).reduce((s, q) => s + q.correct, 0), 0),
    timeSpentMs: tracks.reduce((sum, tr) => sum + tr.timeSpentMs, 0),
    stationsCompleted: tracks.reduce((sum, tr) => sum + tr.stationsCompleted.length, 0),
  };
}
