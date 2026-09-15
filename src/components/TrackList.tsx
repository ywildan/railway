import { Box, Text } from 'ink';
import { t } from '../core/i18n.js';
import type { Lang, TrackSummary } from '../core/types.js';
import { SelectList } from './SelectList.js';

interface Props {
  lang: Lang;
  title: string;
  tracks: TrackSummary[];
  /** Badge tambahan per jalur, mis. "3/4 stasiun". */
  badgeFor?: (track: TrackSummary) => string | undefined;
  onSelect: (trackId: string) => void;
  onCancel: () => void;
}

/** Daftar jalur belajar yang bisa dipilih dengan panah atau nomor. */
export function TrackList({ lang, title, tracks, badgeFor, onSelect, onCancel }: Props) {
  return (
    <Box flexDirection="column">
      <Text bold>{title}</Text>
      <Box marginTop={1}>
        <SelectList
          lang={lang}
          items={tracks.map((track) => ({
            value: track.id,
            label: `${track.emoji} ${track.title}`,
            hint: `${track.description}`,
            badge: badgeFor?.(track) ?? `${track.stationCount} ${t(lang, 'tracks.stations')} · ${track.minutes} ${t(lang, 'tracks.minutes')} · ${t(lang, `level.${track.level}`)}`,
          }))}
          onSelect={onSelect}
          onCancel={onCancel}
        />
      </Box>
      <Text dimColor>{t(lang, 'tracks.chooseHint')}</Text>
    </Box>
  );
}
