import { Box, Text, useInput } from 'ink';
import { t } from '../core/i18n.js';
import type { Lang, Station, Track } from '../core/types.js';
import { pick } from './theme.js';

interface Props {
  lang: Lang;
  track: Track;
  station: Station;
  stationIndex: number;
  /** Menandai stasiun selesai lalu lanjut (biasanya ke kuis stasiun ini). */
  onNext: () => void;
  onExit: () => void;
}

/** Layar materi satu stasiun: baca poin-poin, lalu lanjut ke kuis. */
export function Lesson({ lang, track, station, stationIndex, onNext, onExit }: Props) {
  useInput((input, key) => {
    if (key.escape) {
      onExit();
      return;
    }
    if (key.return || input === ' ' || input === 'n') onNext();
  });

  return (
    <Box flexDirection="column">
      <Box>
        <Text bold color={pick('cyan')}>
          {track.emoji} {station.title}
        </Text>
        <Text dimColor>
          {'  '}
          {t(lang, 'lesson.stationOf', { index: stationIndex + 1, total: track.stations.length })}
        </Text>
      </Box>

      <Box marginTop={1}>
        <Text>{station.summary}</Text>
      </Box>

      <Box flexDirection="column" marginTop={1}>
        <Text bold>{t(lang, 'lesson.points')}</Text>
        {station.points.map((point) => (
          <Box key={point}>
            <Text wrap="wrap">
              <Text color={pick('yellow')}>{'• '}</Text>
              {point}
            </Text>
          </Box>
        ))}
      </Box>

      <Box marginTop={1} flexDirection="column">
        <Text dimColor>{t(lang, 'lesson.toQuiz')}</Text>
        <Text dimColor>{t(lang, 'app.footer')}</Text>
      </Box>
    </Box>
  );
}
