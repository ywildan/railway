import { Box, Text } from 'ink';
import { t } from '../core/i18n.js';
import type { Lang } from '../core/types.js';
import { pick } from './theme.js';

interface Props {
  lang: Lang;
  title: string;
  subtitle?: string;
}

/** Kepala layar: judul + tagline, sama di semua layar. */
export function Header({ lang, title, subtitle }: Props) {
  return (
    <Box flexDirection="column" marginBottom={1}>
      <Box>
        <Text bold color={pick('cyan')}>
          🚂 {title}
        </Text>
      </Box>
      <Text dimColor>{subtitle ?? t(lang, 'app.tagline')}</Text>
    </Box>
  );
}
