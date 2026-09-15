import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { t, UI_KEYS, dictionaryOf } from '../src/core/i18n.js';
import type { Lang } from '../src/core/types.js';

const SRC = join(process.cwd(), 'src');

function collectSourceFiles(dir: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return collectSourceFiles(full);
    return /\.(ts|tsx)$/.test(entry.name) ? [full] : [];
  });
}

describe('kamus antarmuka', () => {
  it('bahasa Indonesia dan Inggris punya kunci yang sama persis', () => {
    const id = Object.keys(dictionaryOf('id')).sort();
    const en = Object.keys(dictionaryOf('en')).sort();
    expect(en).toEqual(id);
  });

  it('tidak ada terjemahan yang kosong', () => {
    for (const lang of ['id', 'en'] as Lang[]) {
      const dict = dictionaryOf(lang);
      for (const key of UI_KEYS) {
        expect(dict[key]?.trim().length ?? 0, `${lang}.${key}`).toBeGreaterThan(0);
      }
    }
  });

  it('placeholder {nama} konsisten di kedua bahasa', () => {
    for (const key of UI_KEYS) {
      const idPlaceholders = [...(dictionaryOf('id')[key] ?? '').matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
      const enPlaceholders = [...(dictionaryOf('en')[key] ?? '').matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
      expect(enPlaceholders, `placeholder kunci ${key}`).toEqual(idPlaceholders);
    }
  });

  it('mengisi placeholder dengan nilai', () => {
    expect(t('id', 'quiz.progress', { index: 2, total: 5 })).toContain('2/5');
    expect(t('en', 'quiz.progress', { index: 2, total: 5 })).toContain('2/5');
  });

  it('placeholder yang tidak diketahui tidak menghilangkan teks', () => {
    expect(t('id', 'track.done', {})).toContain('{done}');
  });

  it('menerjemahkan label level', () => {
    expect(t('id', 'level.pemula')).toBe('Pemula');
    expect(t('en', 'level.pemula')).toBe('Beginner');
  });
});

describe('kunci yang dipakai di kode', () => {
  const files = collectSourceFiles(SRC);

  it('semua kunci literal yang dipakai ada di kamus', () => {
    const used = new Set<string>();
    for (const file of files) {
      const source = readFileSync(file, 'utf8');
      for (const match of source.matchAll(/t\(\s*(?:lang|value|'id'|'en')\s*,\s*'([a-z]+\.[a-zA-Z]+)'/g)) {
        const key = match[1];
        if (key) used.add(key);
      }
    }
    expect(used.size).toBeGreaterThan(20);
    for (const key of used) {
      expect(UI_KEYS as string[], `kunci ${key}`).toContain(key);
    }
  });

  it('kunci turunan level.* tersedia', () => {
    for (const level of ['pemula', 'menengah', 'lanjutan']) {
      expect(UI_KEYS as string[]).toContain(`level.${level}`);
    }
  });
});
