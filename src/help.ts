import { COMMAND_ALIASES } from './core/args.js';
import { listTracks } from './core/content.js';
import { t } from './core/i18n.js';
import { VERSION } from './version.js';
import type { Lang } from './core/types.js';

/**
 * Teks bantuan dwibahasa.
 * Bilingual help text.
 *
 * Dicetak tanpa Ink supaya tetap terbaca saat output di-pipe (`| less`)
 * atau dijalankan di lingkungan tanpa TTY (CI, log, dsb).
 */

function uniqueCommands(): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const [alias, command] of Object.entries(COMMAND_ALIASES)) {
    if (seen.has(command)) continue;
    seen.add(command);
    result.push(alias);
  }
  return result;
}

export function helpText(lang: Lang): string {
  const tracks = listTracks(lang);
  const trackList = tracks.map((track) => `  ${track.emoji} ${track.id.padEnd(12)} ${track.title}`).join('\n');

  const id = `🚂 Railway v${VERSION} — ${t('id', 'app.tagline')}

CARA PAKAI / USAGE
  railway                     Buka menu interaktif
  railway jalur               Daftar semua jalur belajar
  railway mulai <jalur>       Mulai jalur dari stasiun terakhir
  railway kuis <jalur>        Kuis seluruh soal di jalur itu
  railway kartu <jalur>       Kartu hafalan
  railway tinjau [jalur]      Tinjau soal yang sulit (spaced repetition)
  railway progres             Lihat kemajuan belajar
  railway bahasa [id|en]      Atur bahasa antarmuka
  railway tentang             Tentang Railway
  railway bantuan             Tampilkan pesan ini

CONTOH / EXAMPLES
  railway mulai uang          Belajar literasi keuangan dari awal
  railway kuis digital        Langsung kuis keamanan digital
  railway tinjau              Tinjau semua soal yang sudah jatuh tempo
  railway progres --json      Keluaran JSON untuk diproses skrip lain

OPSI / OPTIONS
  --bahasa=id|en, -l id       Pilih bahasa untuk sesi ini
  --json                      Keluaran terstruktur (jalur & progres)
  --no-color                  Matikan warna (juga hormati NO_COLOR)
  --ya                        Konfirmasi otomatis (untuk: railway hapus)

PERINTAH LAIN / MORE
  railway hapus --ya          Hapus semua data kemajuan
  railway versi               Tampilkan nomor versi

JALUR TERSEDIA / AVAILABLE TRACKS
${trackList}

Aliased perintah: ${uniqueCommands().join(', ')}
`;

  const en = `🚂 Railway v${VERSION} — ${t('en', 'app.tagline')}

USAGE
  railway                     Open the interactive menu
  railway tracks              List every learning track
  railway start <track>       Start a track from your last station
  railway quiz <track>        Quiz every question in that track
  railway cards <track>       Flashcard drill
  railway review [track]      Review the hard ones (spaced repetition)
  railway progress            See your learning progress
  railway lang [id|en]        Set the interface language
  railway about               About Railway
  railway help                Show this message

EXAMPLES
  railway start uang          Learn financial literacy from the start
  railway quiz digital        Jump straight into the digital safety quiz
  railway review              Review every question that is due
  railway progress --json     Structured output for other scripts

OPTIONS
  --lang=id|en, -l en         Choose the language for this session
  --json                      Structured output (tracks & progress)
  --no-color                  Disable colour (also honours NO_COLOR)
  --yes                       Auto-confirm (for: railway reset)

MORE
  railway reset --yes         Delete all progress data
  railway version             Show the version number

AVAILABLE TRACKS
${trackList}

Command aliases: ${uniqueCommands().join(', ')}
`;

  return lang === 'en' ? `${en}\n${id}` : `${id}\n${en}`;
}

export function versionText(): string {
  return `railway v${VERSION}`;
}
