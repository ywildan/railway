import { Box, Text, useInput } from 'ink';
import { useState } from 'react';
import { t } from '../core/i18n.js';
import type { Lang } from '../core/types.js';
import { pick } from './theme.js';

export interface SelectItem<T> {
  value: T;
  label: string;
  hint?: string;
  badge?: string;
}

interface Props<T> {
  lang: Lang;
  items: Array<SelectItem<T>>;
  onSelect: (value: T) => void;
  onCancel?: () => void;
  initialIndex?: number;
  /** Jumlah baris yang tampil sekaligus (daftar panjang digulir). */
  windowSize?: number;
}

/** Daftar pilihan dengan panah/nomor — dipakai menu, daftar jalur, dan pemilih bahasa. */
export function SelectList<T>({ lang, items, onSelect, onCancel, initialIndex = 0, windowSize = 9 }: Props<T>) {
  const [index, setIndex] = useState(() => Math.min(Math.max(initialIndex, 0), Math.max(items.length - 1, 0)));

  useInput((input, key) => {
    if (items.length === 0) return;

    if (key.upArrow || input === 'k' || input === 'K' || (key.tab && key.shift)) {
      setIndex((current) => (current - 1 + items.length) % items.length);
      return;
    }
    if (key.downArrow || input === 'j' || input === 'J' || key.tab) {
      setIndex((current) => (current + 1) % items.length);
      return;
    }
    if (key.return) {
      const item = items[index];
      if (item) onSelect(item.value);
      return;
    }
    if (key.escape || input === 'q' || input === 'Q') {
      onCancel?.();
      return;
    }
    const digit = Number.parseInt(input, 10);
    if (!Number.isNaN(digit) && digit >= 1 && digit <= 9) {
      const item = items[digit - 1];
      if (item) {
        setIndex(digit - 1);
        onSelect(item.value);
      }
    }
  });

  if (items.length === 0) {
    return (
      <Box flexDirection="column">
        <Text dimColor>{t(lang, 'tracks.empty')}</Text>
        <Text dimColor>{t(lang, 'app.footer')}</Text>
      </Box>
    );
  }

  const half = Math.floor(windowSize / 2);
  let start = 0;
  if (items.length > windowSize) {
    start = Math.min(Math.max(index - half, 0), items.length - windowSize);
  }
  const visible = items.slice(start, start + windowSize);

  return (
    <Box flexDirection="column">
      {start > 0 ? <Text dimColor>  ↑</Text> : null}
      {visible.map((item, offset) => {
        const realIndex = start + offset;
        const active = realIndex === index;
        return (
          <Box key={realIndex} flexDirection="column">
            <Box>
              <Text color={active ? pick('cyan') : undefined} bold={active}>
                {active ? '❯ ' : '  '}
                {item.label}
              </Text>
              {item.badge ? <Text dimColor>  {item.badge}</Text> : null}
            </Box>
            {item.hint ? <Text dimColor>    {item.hint}</Text> : null}
          </Box>
        );
      })}
      {start + windowSize < items.length ? <Text dimColor>  ↓</Text> : null}
      <Box marginTop={1}>
        <Text dimColor>{t(lang, 'app.footer')}</Text>
      </Box>
    </Box>
  );
}
