import { Box, Text, useInput } from 'ink';
import { t } from '../core/i18n.js';
import type { Lang } from '../core/types.js';
import { pick } from './theme.js';

interface Props {
  lang: Lang;
  version: string;
  onExit: () => void;
}

/** Layar tentang: cara kerja, status offline, lokasi data, lisensi. */
export function About({ lang, version, onExit }: Props) {
  useInput(() => {
    onExit();
  });

  return (
    <Box flexDirection="column">
      <Text bold color={pick('cyan')}>
        {t(lang, 'about.title')} — v{version}
      </Text>
      <Box marginTop={1}>
        <Text>{t(lang, 'about.body')}</Text>
      </Box>
      <Box flexDirection="column" marginTop={1}>
        <Text wrap="wrap">
          {`${t(lang, 'about.offline')}: `}
          {t(lang, 'about.offlineYes')}
        </Text>
        <Text wrap="wrap">
          {`${t(lang, 'about.data')}: `}
          {t(lang, 'about.dataBody')}
        </Text>
        <Text dimColor>{t(lang, 'about.license')}</Text>
      </Box>
      <Box marginTop={1}>
        <Text dimColor>{t(lang, 'common.pressAny')}</Text>
      </Box>
    </Box>
  );
}
