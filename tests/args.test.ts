import { describe, expect, it } from 'vitest';
import { levenshtein, normalizeCommand, parseArgs, suggest } from '../src/core/args.js';

describe('parseArgs', () => {
  it('tanpa argumen membuka menu', () => {
    const parsed = parseArgs([]);
    expect(parsed.command).toBe('menu');
  });

  it('mengenali alias Indonesia dan Inggris', () => {
    expect(parseArgs(['jalur']).command).toBe('tracks');
    expect(parseArgs(['tracks']).command).toBe('tracks');
    expect(parseArgs(['mulai', 'uang']).command).toBe('start');
    expect(parseArgs(['kuis', 'digital']).command).toBe('quiz');
    expect(parseArgs(['kartu', 'uang']).command).toBe('cards');
    expect(parseArgs(['tinjau']).command).toBe('review');
    expect(parseArgs(['progres']).command).toBe('progress');
    expect(parseArgs(['bahasa', 'en']).command).toBe('lang');
    expect(parseArgs(['tentang']).command).toBe('about');
    expect(parseArgs(['bantuan']).command).toBe('help');
    expect(parseArgs(['versi']).command).toBe('version');
    expect(parseArgs(['hapus']).command).toBe('reset');
  });

  it('menyimpan target dan sisa argumen', () => {
    const parsed = parseArgs(['mulai', 'uang', '--json']);
    expect(parsed.target).toBe('uang');
    expect(parsed.json).toBe(true);
  });

  it('mendukung flag bahasa panjang, pendek, dan inline', () => {
    expect(parseArgs(['--bahasa', 'en']).lang).toBe('en');
    expect(parseArgs(['--bahasa=en']).lang).toBe('en');
    expect(parseArgs(['-l', 'id']).lang).toBe('id');
    expect(parseArgs(['tracks', '--lang=en']).lang).toBe('en');
  });

  it('mendukung --json, --no-color, dan --ya', () => {
    const parsed = parseArgs(['hapus', '--ya', '--no-color']);
    expect(parsed.yes).toBe(true);
    expect(parsed.noColor).toBe(true);
  });

  it('mengenali --help dan --version', () => {
    expect(parseArgs(['--help']).command).toBe('help');
    expect(parseArgs(['-h']).command).toBe('help');
    expect(parseArgs(['--version']).command).toBe('version');
    expect(parseArgs(['-V']).command).toBe('version');
  });

  it('menandai perintah yang tidak dikenal', () => {
    const parsed = parseArgs(['nyanyi']);
    expect(parsed.command).toBe('unknown');
    expect(parsed.unknown).toBe('nyanyi');
  });

  it('normalisasi perintah tidak peka huruf besar-kecil', () => {
    expect(normalizeCommand('TRACKS')).toBe('tracks');
    expect(normalizeCommand('  mulai ')).toBe('start');
    expect(normalizeCommand('tidak-ada')).toBeUndefined();
  });
});

describe('saran salah ketik', () => {
  it('mengukur jarak edit', () => {
    expect(levenshtein('kucing', 'kucing')).toBe(0);
    expect(levenshtein('kuis', 'kuiss')).toBe(1);
    expect(levenshtein('start', 'stert')).toBe(1);
  });

  it('menyarankan perintah terdekat', () => {
    expect(suggest('mulaii')).toBe('mulai');
    expect(suggest('quizz')).toBe('quiz');
  });

  it('tidak menyarankan untuk input yang terlalu jauh', () => {
    expect(suggest('zzzzzzzzzzzz')).toBeUndefined();
  });
});
