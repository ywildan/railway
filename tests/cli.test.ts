import { describe, expect, it } from 'vitest';
import { helpText, versionText } from '../src/help.js';
import { formatDuration, formatPercent, progressBar, relativeDays, truncate } from '../src/core/format.js';
import { detectColorEnabled, isColorEnabled, pick, setColorEnabled } from '../src/components/theme.js';

describe('teks bantuan', () => {
  it('menampilkan nomor versi', () => {
    expect(versionText()).toMatch(/^railway v\d+\.\d+\.\d+$/);
  });

  it('berisi perintah utama dalam dua bahasa', () => {
    const text = helpText('id');
    for (const command of ['railway jalur', 'railway mulai', 'railway kuis', 'railway tinjau', 'railway progres', 'railway tracks', 'railway start', 'railway quiz']) {
      expect(text).toContain(command);
    }
  });

  it('mencantumkan semua jalur yang tersedia', () => {
    const text = helpText('en');
    for (const id of ['uang', 'digital', 'matematika', 'kesehatan', 'inggris', 'logika', 'komputer', 'nusantara']) {
      expect(text).toContain(id);
    }
  });
});

describe('format tampilan', () => {
  it('memformat durasi dalam dua bahasa', () => {
    expect(formatDuration(45_000, 'id')).toBe('45 dtk');
    expect(formatDuration(90_000, 'id')).toBe('1 mnt 30 dtk');
    expect(formatDuration(3_725_000, 'en')).toBe('1h 2m');
    expect(formatDuration(-5, 'id')).toBe('0 dtk');
  });

  it('memformat persen', () => {
    expect(formatPercent(0)).toBe('0%');
    expect(formatPercent(2 / 3)).toBe('67%');
  });

  it('membatasi rasio pada rentang 0–1', () => {
    expect(progressBar(-1, 4)).toBe('░░░░');
    expect(progressBar(5, 4)).toBe('████');
    expect(progressBar(0.5, 4)).toBe('██░░');
  });

  it('menerjemahkan selisih hari', () => {
    const now = new Date('2026-04-10T10:00:00');
    expect(relativeDays(new Date('2026-04-10T08:00:00'), now, 'id')).toBe('hari ini');
    expect(relativeDays(new Date('2026-04-07T08:00:00'), now, 'en')).toBe('3 days ago');
    expect(relativeDays(undefined, now, 'id')).toBe('-');
  });

  it('memotong teks panjang', () => {
    expect(truncate('pendek', 10)).toBe('pendek');
    expect(truncate('kalimat yang sangat panjang sekali', 10)).toHaveLength(10);
  });
});

describe('warna', () => {
  it('dapat dimatikan lewat flag atau NO_COLOR', () => {
    const previous = process.env['NO_COLOR'];
    setColorEnabled(true);

    expect(detectColorEnabled(true)).toBe(false);

    process.env['NO_COLOR'] = '1';
    expect(detectColorEnabled(false)).toBe(false);
    delete process.env['NO_COLOR'];

    if (previous === undefined) delete process.env['NO_COLOR'];
    else process.env['NO_COLOR'] = previous;
  });

  it('pick mengembalikan undefined saat warna nonaktif', () => {
    setColorEnabled(false);
    expect(pick('green')).toBeUndefined();
    expect(isColorEnabled()).toBe(false);
    setColorEnabled(true);
    expect(pick('green')).toBe('green');
  });
});
