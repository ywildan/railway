import digitalEn from '../content/en/digital.json';
import inggrisEn from '../content/en/inggris.json';
import kesehatanEn from '../content/en/kesehatan.json';
import komputerEn from '../content/en/komputer.json';
import logikaEn from '../content/en/logika.json';
import matematikaEn from '../content/en/matematika.json';
import nusantaraEn from '../content/en/nusantara.json';
import uangEn from '../content/en/uang.json';
import digitalId from '../content/id/digital.json';
import inggrisId from '../content/id/inggris.json';
import kesehatanId from '../content/id/kesehatan.json';
import komputerId from '../content/id/komputer.json';
import logikaId from '../content/id/logika.json';
import matematikaId from '../content/id/matematika.json';
import nusantaraId from '../content/id/nusantara.json';
import uangId from '../content/id/uang.json';
import { validateTrack } from './validate.js';
import type { Lang, Track, TrackSummary } from './types.js';

/**
 * Registry konten.
 * Content registry.
 *
 * Konten diimpor statis (bukan dibaca dari disk) supaya:
 *  - CLI tetap jalan meski terpasang global (npm i -g),
 *  - selalu offline,
 *  - berkas JSON tidak perlu disalin saat build.
 *
 * Menambah jalur baru: taruh berkas JSON di src/content/<bahasa>/
 * lalu daftarkan di REGISTRY di bawah ini (lihat docs/MENULIS-KONTEN.md).
 */

const asTrack = (data: unknown): Track => data as Track;

const REGISTRY: Record<Lang, Track[]> = {
  id: [uangId, digitalId, matematikaId, kesehatanId, inggrisId, logikaId, komputerId, nusantaraId].map(asTrack),
  en: [uangEn, digitalEn, matematikaEn, kesehatanEn, inggrisEn, logikaEn, komputerEn, nusantaraEn].map(asTrack),
};

export function trackIds(lang: Lang): string[] {
  return REGISTRY[lang].map((track) => track.id);
}

export function listTracks(lang: Lang): TrackSummary[] {
  return REGISTRY[lang].map((track) => ({
    id: track.id,
    title: track.title,
    description: track.description,
    emoji: track.emoji,
    level: track.level,
    minutes: track.minutes,
    tags: track.tags,
    stationCount: track.stations.length,
    questionCount: countQuestions(track),
  }));
}

export function countQuestions(track: Track): number {
  return track.stations.reduce((sum, station) => sum + station.questions.length, 0);
}

export function getTrack(lang: Lang, id: string): Track | undefined {
  return REGISTRY[lang].find((track) => track.id === id);
}

/** Mencari jalur di kedua bahasa — berguna untuk pesan kesalahan. */
export function findTrackIdAnyLang(id: string): string | undefined {
  const ids = new Set([...trackIds('id'), ...trackIds('en')]);
  return ids.has(id) ? id : undefined;
}

export interface ValidationReport {
  lang: Lang;
  id: string;
  errors: string[];
}

/** Memvalidasi seluruh konten yang terdaftar (dipakai CLI & pengujian). */
export function validateAllTracks(): ValidationReport[] {
  const reports: ValidationReport[] = [];
  for (const lang of ['id', 'en'] as Lang[]) {
    for (const track of REGISTRY[lang]) {
      const errors = validateTrack(track, `${track.id}.json`);
      if (errors.length > 0) reports.push({ lang, id: track.id, errors });
    }
  }
  return reports;
}

/** Memastikan kedua bahasa punya jalur dengan id & jumlah soal yang sama. */
export function languageParityIssues(): string[] {
  const ids = trackIds('id');
  const enIds = trackIds('en');
  const issues: string[] = [];

  for (const id of ids) {
    if (!enIds.includes(id)) issues.push(`Jalur "${id}" belum punya versi bahasa Inggris / missing English version`);
  }
  for (const id of enIds) {
    if (!ids.includes(id)) issues.push(`Jalur "${id}" belum punya versi bahasa Indonesia / missing Indonesian version`);
  }
  for (const id of ids.filter((i) => enIds.includes(i))) {
    const a = getTrack('id', id);
    const b = getTrack('en', id);
    if (!a || !b) continue;
    if (a.stations.length !== b.stations.length) {
      issues.push(`Jalur "${id}": jumlah stasiun berbeda / different station count`);
      continue;
    }
    a.stations.forEach((station, index) => {
      const other = b.stations[index];
      if (!other) return;
      if (station.id !== other.id) {
        issues.push(`Jalur "${id}" stasiun #${index + 1}: id beda (${station.id} vs ${other.id}) / station id mismatch`);
      }
      if (station.questions.length !== other.questions.length) {
        issues.push(`Jalur "${id}" stasiun "${station.id}": jumlah soal berbeda / different question count`);
      }
    });
  }
  return issues;
}
