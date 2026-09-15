import { render } from 'ink';
import { App } from './app.js';
import { parseArgs, suggest } from './core/args.js';
import { getTrack, listTracks, trackIds } from './core/content.js';
import { formatPercent } from './core/format.js';
import { t } from './core/i18n.js';
import { getPaths, loadProgress, resetProgress, saveProgress, setLanguage, summariseAll } from './core/store.js';
import type { Lang } from './core/types.js';
import { helpText, versionText } from './help.js';
import { VERSION } from './version.js';
import { detectColorEnabled, setColorEnabled } from './components/theme.js';

/** Menebak bahasa dari lingkungan (LANG=id_ID.UTF-8 → Indonesia). */
function detectLangFromEnv(): Lang | undefined {
  const override = process.env['RAILWAY_LANG'];
  if (override === 'id' || override === 'en') return override;
  const locale = process.env['LANG'] ?? process.env['LC_ALL'] ?? '';
  if (locale.toLowerCase().startsWith('id')) return 'id';
  if (locale.toLowerCase().startsWith('en')) return 'en';
  return undefined;
}

function resolveLang(explicit: Lang | undefined, fallback: Lang): Lang {
  return explicit ?? detectLangFromEnv() ?? fallback;
}

export function main(argv: string[] = process.argv.slice(2)): void {
  const args = parseArgs(argv);
  setColorEnabled(detectColorEnabled(args.noColor));

  if (args.command === 'version') {
    console.log(versionText());
    return;
  }

  let progress = loadProgress();
  const lang: Lang = resolveLang(args.lang, progress.language);

  if (args.command === 'help') {
    console.log(helpText(lang));
    return;
  }

  if (args.command === 'unknown') {
    const hint = suggest(args.unknown ?? '');
    console.error(`✗ ${t(lang, 'cli.unknown', { command: args.unknown ?? '' })}`);
    if (hint) console.error(`  ${t(lang, 'cli.suggest', { suggestion: hint })}`);
    console.error(`  ${lang === 'id' ? 'Jalankan: railway bantuan' : 'Try: railway help'}`);
    process.exitCode = 1;
    return;
  }

  if (args.command === 'lang' && args.lang) {
    progress = setLanguage(progress, args.lang);
    saveProgress(progress);
    const label = args.lang === 'id' ? t(args.lang, 'lang.id') : t(args.lang, 'lang.en');
    console.log(`✓ ${t(args.lang, 'lang.changed', { lang: label })}`);
    return;
  }

  if (args.command === 'lang' && !process.stdin.isTTY) {
    console.log(t(lang, 'lang.current', { lang: lang === 'id' ? t(lang, 'lang.id') : t(lang, 'lang.en') }));
    console.log(t(lang, 'lang.hint'));
    return;
  }

  if (args.command === 'reset') {
    if (!args.yes) {
      console.log(t(lang, 'progress.reset'));
      console.log(t(lang, 'cli.resetConfirm'));
      return;
    }
    resetProgress();
    console.log(`✓ ${t(lang, 'progress.resetDone')}`);
    return;
  }

  if (args.command === 'tracks' && args.json) {
    console.log(JSON.stringify({ language: lang, tracks: listTracks(lang) }, null, 2));
    return;
  }

  if (args.command === 'progress' && args.json) {
    const totals = summariseAll(progress);
    console.log(
      JSON.stringify(
        {
          language: lang,
          streak: progress.streak,
          totals: {
            ...totals,
            accuracy: totals.questionsAnswered === 0 ? 0 : totals.questionsCorrect / totals.questionsAnswered,
          },
          tracks: progress.tracks,
          dataPath: getPaths().file,
        },
        null,
        2,
      ),
    );
    return;
  }

  if (args.command === 'tracks') {
    const tracks = listTracks(lang);
    console.log(`🚂 ${t(lang, 'tracks.title')} (${tracks.length})\n`);
    for (const track of tracks) {
      console.log(
        `${track.emoji} ${track.id.padEnd(12)} ${track.title.padEnd(28)} ${String(track.stationCount).padStart(2)} ${t(lang, 'tracks.stations')} · ${String(track.questionCount).padStart(2)} ${t(lang, 'tracks.questions')} · ${track.minutes} ${t(lang, 'tracks.minutes')} · ${t(lang, `level.${track.level}`)}`,
      );
      console.log(`   ${track.description}`);
    }
    console.log(`\n${t(lang, 'tracks.chooseHint')}`);
    return;
  }

  if (args.command === 'progress' && !args.json) {
    if (!process.stdin.isTTY) {
      // Ringkasan satu baris untuk skrip/log.
      const totals = summariseAll(progress);
      const accuracy = formatPercent(totals.questionsAnswered === 0 ? 0 : totals.questionsCorrect / totals.questionsAnswered);
      console.log(
        `streak=${progress.streak.current} best=${progress.streak.best} stations=${totals.stationsCompleted} answered=${totals.questionsAnswered} correct=${totals.questionsCorrect} accuracy=${accuracy}`,
      );
      return;
    }
  }

  // Validasi id jalur dilakukan lebih dulu supaya salah ketik langsung terasa,
  // baik di terminal interaktif maupun saat output di-pipe.
  if (args.target && ['start', 'quiz', 'cards', 'review'].includes(args.command)) {
    if (!getTrack(lang, args.target)) {
      console.error(`✗ ${t(lang, 'cli.trackNotFound', { id: args.target })}`);
      console.error(`  ${t(lang, 'cli.availableTracks', { list: trackIds(lang).join(', ') })}`);
      process.exitCode = 1;
      return;
    }
  }

  // Perintah interaktif butuh terminal.
  if (!process.stdin.isTTY) {
    console.error(`⚠ ${t(lang, 'cli.noTty')}`);
    console.error(helpText(lang));
    process.exitCode = 2;
    return;
  }

  const app = render(
    <App
      lang={lang}
      progress={progress}
      version={VERSION}
      dataPath={getPaths().file}
      initialCommand={args.command}
      initialTrackId={args.target}
      onExit={() => {
        app.unmount();
        console.log(`\n${t(lang, 'cli.bye')}`);
        process.exit(0);
      }}
    />,
    { exitOnCtrlC: true },
  );
}

if (process.env['RAILWAY_NO_AUTORUN'] !== '1') {
  main();
}
