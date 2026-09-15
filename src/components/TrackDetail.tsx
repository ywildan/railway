import { Box, Text } from 'ink';
import { t } from '../core/i18n.js';
import { progressBar } from '../core/format.js';
import type { Lang, Track } from '../core/types.js';
import { SelectList } from './SelectList.js';
import { pick } from './theme.js';

export type TrackAction = 'start' | 'quiz' | 'cards' | 'review';

interface Props {
  lang: Lang;
  track: Track;
  stationsCompleted: string[];
  lastScore?: { correct: number; total: number };
  onAction: (action: TrackAction) => void;
  onBack: () => void;
}

/** Detail satu jalur: ringkasan, daftar stasiun, lalu pilihan aksi. */
export function TrackDetail({ lang, track, stationsCompleted, lastScore, onAction, onBack }: Props) {
  const done = stationsCompleted.length;
  const total = track.stations.length;
  const isComplete = done >= total;
  const nextIndex = Math.min(done, total - 1);

  return (
    <Box flexDirection="column">
      <Box>
        <Text bold color={pick('cyan')}>
          {track.emoji} {track.title}
        </Text>
        <Text dimColor>
          {'  '}
          {t(lang, `level.${track.level}`)} · {track.minutes} {t(lang, 'tracks.minutes')}
        </Text>
      </Box>

      <Box marginTop={1}>
        <Text>{track.description}</Text>
      </Box>

      <Box marginTop={1} flexDirection="column">
        <Text>
          {progressBar(total === 0 ? 0 : done / total)}  {isComplete ? t(lang, 'track.completed') : t(lang, 'track.done', { done, total })}
        </Text>
        {lastScore ? <Text dimColor>{t(lang, 'track.lastScore', { score: lastScore.correct, total: lastScore.total })}</Text> : null}
      </Box>

      <Box flexDirection="column" marginTop={1}>
        <Text bold dimColor>
          {t(lang, 'track.stationList')}
        </Text>
        {track.stations.map((station, index) => {
          const finished = stationsCompleted.includes(station.id);
          return (
            <Box key={station.id}>
              <Text color={finished ? pick('green') : undefined} dimColor={!finished}>
                {finished ? '✓' : `${index + 1}.`} {station.title}
              </Text>
            </Box>
          );
        })}
      </Box>

      <Box marginTop={1}>
        <SelectList<TrackAction | 'back'>
          lang={lang}
          items={[
            { value: 'start', label: isComplete ? t(lang, 'track.start') : done === 0 ? t(lang, 'track.start') : t(lang, 'track.continueAt', { index: nextIndex + 1 }) },
            { value: 'quiz', label: t(lang, 'track.quizOnly') },
            { value: 'cards', label: t(lang, 'track.cardsOnly') },
            { value: 'review', label: t(lang, 'menu.review') },
            { value: 'back', label: t(lang, 'common.back') },
          ]}
          onSelect={(action) => (action === 'back' ? onBack() : onAction(action))}
          onCancel={onBack}
        />
      </Box>
    </Box>
  );
}
