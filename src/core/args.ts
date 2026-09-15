/**
 * Parser argumen yang kecil dan tanpa dependensi.
 * Tiny dependency-free argument parser.
 *
 * Setiap perintah punya alias Indonesia & Inggris supaya nyaman dipakai
 * siapa saja tanpa harus menghafal satu bahasa tertentu.
 */

export type CommandName =
  | 'menu'
  | 'tracks'
  | 'start'
  | 'quiz'
  | 'cards'
  | 'review'
  | 'progress'
  | 'lang'
  | 'about'
  | 'help'
  | 'version'
  | 'reset'
  | 'unknown';

export interface ParsedArgs {
  command: CommandName;
  /** Argumen posisi pertama, mis. id jalur atau kode bahasa. */
  target?: string;
  /** Argumen posisi kedua (jarang dipakai, disiapkan untuk perluasan). */
  rest: string[];
  lang?: 'id' | 'en';
  json: boolean;
  noColor: boolean;
  yes: boolean;
  /** Perintah yang tidak dikenal, bila ada. */
  unknown?: string;
}

const ALIASES: Record<string, CommandName> = {
  // Indonesia
  jalur: 'tracks',
  daftar: 'tracks',
  mulai: 'start',
  jalan: 'start',
  kuis: 'quiz',
  latihan: 'quiz',
  kartu: 'cards',
  hafalan: 'cards',
  tinjau: 'review',
  ulang: 'review',
  progres: 'progress',
  statistik: 'progress',
  bahasa: 'lang',
  tentang: 'about',
  bantuan: 'help',
  panduan: 'help',
  versi: 'version',
  hapus: 'reset',
  // English
  tracks: 'tracks',
  list: 'tracks',
  ls: 'tracks',
  start: 'start',
  learn: 'start',
  quiz: 'quiz',
  cards: 'cards',
  flashcards: 'cards',
  review: 'review',
  drill: 'review',
  progress: 'progress',
  stats: 'progress',
  lang: 'lang',
  language: 'lang',
  about: 'about',
  help: 'help',
  version: 'version',
  reset: 'reset',
};

export const COMMAND_ALIASES = ALIASES;

export function normalizeCommand(input: string): CommandName | undefined {
  return ALIASES[input.trim().toLowerCase()];
}

/** Jarak edit Levenshtein — dipakai untuk saran "maksudmu ...". */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const prev = new Array<number>(b.length + 1);
  const curr = new Array<number>(b.length + 1);
  for (let j = 0; j <= b.length; j += 1) prev[j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min((curr[j - 1] as number) + 1, (prev[j] as number) + 1, (prev[j - 1] as number) + cost);
    }
    for (let j = 0; j <= b.length; j += 1) prev[j] = curr[j] as number;
  }
  return prev[b.length] as number;
}

/** Menyarankan perintah terdekat untuk input yang salah ketik. */
export function suggest(input: string): string | undefined {
  const query = input.trim().toLowerCase();
  if (!query) return undefined;
  let best: { word: string; distance: number } | undefined;
  for (const alias of Object.keys(ALIASES)) {
    const distance = levenshtein(query, alias);
    if (distance <= 2 && (!best || distance < best.distance)) best = { word: alias, distance };
  }
  return best?.word;
}

export function parseArgs(argv: string[]): ParsedArgs {
  const result: ParsedArgs = {
    command: 'menu',
    rest: [],
    json: false,
    noColor: false,
    yes: false,
  };

  const positionals: string[] = [];
  const args = [...argv];

  for (let i = 0; i < args.length; i += 1) {
    const raw = args[i] as string;

    if (raw === '--json') {
      result.json = true;
      continue;
    }
    if (raw === '--no-color' || raw === '--tanpa-warna' || raw === '--no-warna') {
      result.noColor = true;
      continue;
    }
    if (raw === '--ya' || raw === '--yes' || raw === '-y') {
      result.yes = true;
      continue;
    }
    if (raw === '--help' || raw === '-h' || raw === '--bantuan') {
      result.command = 'help';
      continue;
    }
    if (raw === '--version' || raw === '-V' || raw === '--versi') {
      result.command = 'version';
      continue;
    }
    if (raw === '--bahasa' || raw === '--lang' || raw === '-l') {
      // Nilai menyusul sebagai argumen terpisah: --bahasa en
      const next = args[i + 1];
      if (next === 'id' || next === 'en') {
        result.lang = next;
        i += 1;
      }
      continue;
    }
    const inlineLang = /^(?:--bahasa|--lang|-l)=(id|en)$/.exec(raw);
    if (inlineLang) {
      result.lang = inlineLang[1] as 'id' | 'en';
      continue;
    }

    if (raw.startsWith('-')) continue; // flag lain diabaikan / other flags ignored

    positionals.push(raw);
  }

  const [first, ...others] = positionals;
  if (first) {
    const command = normalizeCommand(first);
    if (command) {
      result.command = command;
      result.target = others[0];
      result.rest = others.slice(1);
    } else {
      result.command = 'unknown';
      result.unknown = first;
    }
  }

  // Bahasa juga boleh diberikan sebagai argumen posisi: railway bahasa en
  if (result.command === 'lang' && !result.lang && result.target === 'id') {
    result.lang = 'id';
    result.target = undefined;
  }
  if (result.command === 'lang' && !result.lang && result.target === 'en') {
    result.lang = 'en';
    result.target = undefined;
  }

  return result;
}
