import { Box, Text, useInput } from 'ink';
import { useState } from 'react';
import { t } from '../core/i18n.js';
import type { Lang } from '../core/types.js';
import { pick } from './theme.js';

export interface CardItem {
  front: string;
  back: string;
  stationTitle: string;
}

interface Props {
  lang: Lang;
  title: string;
  cards: CardItem[];
  onExit: () => void;
  /** Dipanggil setelah semua kartu dilihat, untuk mencatat waktu belajar. */
  onComplete?: () => void;
}

/** Kartu hafalan bolak-balik: spasi/Enter membalik, panah berpindah. */
export function Flashcards({ lang, title, cards, onExit, onComplete }: Props) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [completed, setCompleted] = useState(false);

  const current = cards[index];

  const move = (delta: number) => {
    setFlipped(false);
    setIndex((value) => {
      const next = value + delta;
      if (next >= cards.length) {
        if (!completed) {
          setCompleted(true);
          onComplete?.();
        }
        return value;
      }
      if (next < 0) return 0;
      return next;
    });
  };

  useInput((input, key) => {
    if (key.escape) {
      onExit();
      return;
    }
    if (key.return || input === ' ' || input === 'f') {
      setFlipped((value) => !value);
      return;
    }
    if (key.rightArrow || input === 'n' || input === 'l') {
      move(1);
      return;
    }
    if (key.leftArrow || input === 'p' || input === 'h') {
      move(-1);
    }
  });

  if (!current) {
    return <Text color={pick('yellow')}>{t(lang, 'cards.done')}</Text>;
  }

  return (
    <Box flexDirection="column">
      <Box>
        <Text bold color={pick('cyan')}>
          {t(lang, 'cards.title')} — {title}
        </Text>
        <Text dimColor>
          {'  '}
          {t(lang, 'cards.progress', { index: index + 1, total: cards.length })}
        </Text>
      </Box>

      <Box marginTop={1} borderStyle="round" borderColor={pick('cyan')} paddingX={2} paddingY={1} flexDirection="column">
        <Text dimColor>{current.stationTitle}</Text>
        <Text bold>{flipped ? current.back : current.front}</Text>
      </Box>

      <Box marginTop={1} flexDirection="column">
        {completed ? <Text color={pick('green')}>{t(lang, 'cards.done')}</Text> : null}
        <Text dimColor>{flipped ? t(lang, 'cards.next') : t(lang, 'cards.flip')}</Text>
      </Box>
    </Box>
  );
}
