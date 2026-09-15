import { Box, Text, useInput } from 'ink';
import { t } from '../core/i18n.js';
import { formatDuration, formatPercent, progressBar } from '../core/format.js';
import { summariseAll, summariseTrack } from '../core/store.js';
import type { ProgressFile } from '../core/store.js';
import type { Lang, TrackSummary } from '../core/types.js';
import { pick } from './theme.js';

interface Props {
  lang: Lang;
  progress: ProgressFile;
  tracks: TrackSummary[];
  dataPath: string;
  onExit: () => void;
}

/** Ringkasan kemajuan: statistik global, lalu per jalur. */
export function ProgressView({ lang, progress, tracks, dataPath, onExit }: Props) {
  useInput(() => {
    onExit();
  });

  const totals = summariseAll(progress);
  const hasData = totals.questionsAnswered > 0 || totals.stationsCompleted > 0;

  return (
    <Box flexDirection="column">
      <Text bold color={pick('cyan')}>
        {t(lang, 'progress.title')}
      </Text>

      {!hasData ? (
        <Box marginTop={1}>
          <Text dimColor>{t(lang, 'progress.empty')}</Text>
        </Box>
      ) : (
        <Box flexDirection="column" marginTop={1}>
          <Box flexDirection="column">
            <Text wrap="wrap">
              {`${t(lang, 'progress.streak')}: `}
              <Text bold>{`${progress.streak.current} ${t(lang, 'progress.day')}`}</Text>
              {`  `}
              <Text dimColor>{`(${t(lang, 'progress.best')}: ${progress.streak.best})`}</Text>
            </Text>
            <Text wrap="wrap">
              {`${t(lang, 'progress.questions')}: `}
              <Text bold>{`${totals.questionsCorrect}/${totals.questionsAnswered}`}</Text>
              {`  `}
              <Text dimColor>{`(${t(lang, 'progress.accuracy')}: ${formatPercent(totals.questionsAnswered === 0 ? 0 : totals.questionsCorrect / totals.questionsAnswered)})`}</Text>
            </Text>
            <Text wrap="wrap">
              {`${t(lang, 'progress.totalTime')}: `}
              <Text bold>{formatDuration(totals.timeSpentMs, lang)}</Text>
            </Text>
          </Box>

          <Box flexDirection="column" marginTop={1}>
            {tracks.map((track) => {
              const stat = summariseTrack(progress, track.id);
              if (stat.questionsAnswered === 0 && stat.stationsCompleted === 0) return null;
              const ratio = track.stationCount === 0 ? 0 : stat.stationsCompleted / track.stationCount;
              return (
                <Box key={track.id} flexDirection="column">
                  <Text wrap="wrap">
                    {progressBar(ratio, 8)}
                    {`  `}
                    {t(lang, 'progress.trackRow', { emoji: track.emoji, title: track.title })}
                  </Text>
                  <Text dimColor>
                    {'            '}
                    {t(lang, 'progress.detail', {
                      done: stat.stationsCompleted,
                      total: track.stationCount,
                      correct: stat.questionsCorrect,
                      answered: stat.questionsAnswered,
                    })}
                  </Text>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}

      <Box marginTop={1} flexDirection="column">
        <Text dimColor>{t(lang, 'progress.file', { path: dataPath })}</Text>
        <Text dimColor>{t(lang, 'common.pressAny')}</Text>
      </Box>
    </Box>
  );
}
