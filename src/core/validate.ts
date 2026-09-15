import type { Level, Track } from './types.js';

/**
 * Validator konten sederhana tanpa dependensi eksternal.
 * Dependency-free content validator.
 *
 * Dipakai pada saat aplikasi berjalan (supaya konten yang rusak tidak
 * menjatuhkan CLI) sekaligus pada pengujian otomatis.
 */

const LEVELS: readonly Level[] = ['pemula', 'menengah', 'lanjutan'];
const ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isNonEmptyString);
}

/** Memvalidasi satu objek jalur; mengembalikan daftar pesan kesalahan (kosong = valid). */
export function validateTrack(track: unknown, fileName?: string): string[] {
  const errors: string[] = [];
  const at = fileName ? `${fileName}: ` : '';
  const t = track as Partial<Track> | null | undefined;

  if (!t || typeof t !== 'object') {
    return [`${at}konten bukan objek / content is not an object`];
  }

  if (!isNonEmptyString(t.id) || !ID_RE.test(t.id)) {
    errors.push(`${at}id harus huruf kecil & tanda hubung / id must be lowercase kebab-case`);
  }
  if (fileName && isNonEmptyString(t.id) && `${t.id}.json` !== fileName) {
    errors.push(`${at}id "${t.id}" tidak sama dengan nama berkas "${fileName}" / id must match the file name`);
  }
  if (!isNonEmptyString(t.title)) errors.push(`${at}title wajib diisi / is required`);
  if (!isNonEmptyString(t.description)) errors.push(`${at}description wajib diisi / is required`);
  if (!isNonEmptyString(t.emoji)) errors.push(`${at}emoji wajib diisi / is required`);
  if (!t.level || !LEVELS.includes(t.level)) {
    errors.push(`${at}level harus salah satu dari ${LEVELS.join(', ')} / must be one of ${LEVELS.join(', ')}`);
  }
  if (typeof t.minutes !== 'number' || !Number.isFinite(t.minutes) || t.minutes <= 0) {
    errors.push(`${at}minutes harus angka positif / must be a positive number`);
  }
  if (!isStringArray(t.tags)) {
    errors.push(`${at}tags harus berisi string non-kosong / must be a non-empty string array`);
  }
  if (!Array.isArray(t.stations) || t.stations.length === 0) {
    errors.push(`${at}stations minimal satu / must contain at least one station`);
    return errors;
  }

  const stationIds = new Set<string>();
  t.stations.forEach((station, si) => {
    const where = `${at}stations[${si}]`;
    if (!station || typeof station !== 'object') {
      errors.push(`${where} bukan objek / is not an object`);
      return;
    }
    if (!isNonEmptyString(station.id)) errors.push(`${where}.id wajib diisi / is required`);
    else if (stationIds.has(station.id)) errors.push(`${where}.id duplikat: ${station.id} / duplicate id`);
    else stationIds.add(station.id);

    if (!isNonEmptyString(station.title)) errors.push(`${where}.title wajib diisi / is required`);
    if (!isNonEmptyString(station.summary)) errors.push(`${where}.summary wajib diisi / is required`);
    if (!isStringArray(station.points) || station.points.length < 2) {
      errors.push(`${where}.points minimal 2 / needs at least 2 items`);
    }
    if (!Array.isArray(station.cards) || station.cards.length === 0) {
      errors.push(`${where}.cards minimal 1 / needs at least 1 item`);
    } else {
      station.cards.forEach((card, ci) => {
        if (!isNonEmptyString(card?.front) || !isNonEmptyString(card?.back)) {
          errors.push(`${where}.cards[${ci}] butuh front & back / needs front & back`);
        }
      });
    }

    if (!Array.isArray(station.questions) || station.questions.length === 0) {
      errors.push(`${where}.questions minimal 1 / needs at least 1 question`);
      return;
    }
    const questionIds = new Set<string>();
    station.questions.forEach((question, qi) => {
      const q = `${where}.questions[${qi}]`;
      if (!isNonEmptyString(question?.id)) errors.push(`${q}.id wajib diisi / is required`);
      else if (questionIds.has(question.id)) errors.push(`${q}.id duplikat: ${question.id} / duplicate id`);
      else questionIds.add(question.id);

      if (!isNonEmptyString(question?.prompt)) errors.push(`${q}.prompt wajib diisi / is required`);
      if (!isStringArray(question?.options) || question.options.length < 2 || question.options.length > 5) {
        errors.push(`${q}.options harus 2–5 opsi / must have 2–5 options`);
      } else if (new Set(question.options).size !== question.options.length) {
        errors.push(`${q}.options ada yang kembar / contains duplicates`);
      }
      if (typeof question?.answer !== 'number' || !Number.isInteger(question.answer)) {
        errors.push(`${q}.answer harus indeks bulat / must be an integer index`);
      } else if (Array.isArray(question.options) && (question.answer < 0 || question.answer >= question.options.length)) {
        errors.push(`${q}.answer di luar rentang options / out of range`);
      }
      if (!isNonEmptyString(question?.explain)) errors.push(`${q}.explain wajib diisi / is required`);
    });
  });

  return errors;
}

export function assertTrack(track: unknown, fileName?: string): Track {
  const errors = validateTrack(track, fileName);
  if (errors.length > 0) {
    throw new Error(`Konten tidak valid / invalid content:\n- ${errors.join('\n- ')}`);
  }
  return track as Track;
}
