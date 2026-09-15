import { Box, Text, useInput } from 'ink';
import { t } from '../core/i18n.js';
import type { Lang } from '../core/types.js';
import { pick } from './theme.js';

interface Props {
  lang: Lang;
  children: string;
  tone?: 'info' | 'success' | 'warn' | 'error';
  onDismiss: () => void;
}

/** Layar pesan singkat: tekan tombol apa saja untuk lanjut. */
export function Message({ lang, children, tone = 'info', onDismiss }: Props) {
  const color = tone === 'error' ? pick('red') : tone === 'success' ? pick('green') : tone === 'warn' ? pick('yellow') : pick('cyan');

  useInput(() => {
    onDismiss();
  });

  return (
    <Box flexDirection="column">
      <Text color={color}>{children}</Text>
      <Box marginTop={1}>
        <Text dimColor>{t(lang, 'common.pressAny')}</Text>
      </Box>
    </Box>
  );
}
