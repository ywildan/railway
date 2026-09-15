import { Box, Text, useInput } from 'ink';
import { useState } from 'react';
import { t } from '../core/i18n.js';
import { progressBar } from '../core/format.js';
import type { AnswerRecord, QuizItem } from '../core/quiz.js';
import type { Lang } from '../core/types.js';
import { pick } from './theme.js';

export interface QuizOutcome {
  records: AnswerRecord[];
  correct: number;
  total: number;
  durationMs: number;
}

interface Props {
  lang: Lang;
  title: string;
  items: QuizItem[];
  /** Dipanggil sekali saat sesi selesai (hasil sudah final). */
  onFinish: (outcome: QuizOutcome) => void;
  onExit: () => void;
}

type Phase = 'question' | 'feedback' | 'result';

/** Kuis interaktif: panah/nomor memilih, Enter mengunci jawaban. */
export function Quiz({ lang, title, items, onFinish, onExit }: Props) {
  const [index, setIndex] = useState(0);
  const [cursor, setCursor] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [phase, setPhase] = useState<Phase>('question');
  const [startedAt] = useState(() => Date.now());
  const [finished, setFinished] = useState(false);

  const current = items[index];

  const confirm = (choice: number) => {
    if (!current) return;
    if (phase !== 'question') return;
    const record: AnswerRecord = {
      key: current.key,
      questionId: current.questionId,
      chosen: choice,
      correct: choice === current.answer,
    };
    setAnswers((previous) => [...previous, record]);
    setPhase('feedback');
  };

  const advance = () => {
    if (index + 1 >= items.length) {
      const correct = answers.filter((record) => record.correct).length;
      const outcome: QuizOutcome = {
        records: answers,
        correct,
        total: items.length,
        durationMs: Date.now() - startedAt,
      };
      if (!finished) {
        setFinished(true);
        onFinish(outcome);
      }
      setPhase('result');
      return;
    }
    setIndex(index + 1);
    setCursor(0);
    setPhase('question');
  };

  useInput((input, key) => {
    if (phase === 'result') {
      if (key.return || key.escape) onExit();
      return;
    }
    if (phase === 'feedback') {
      if (key.return || input === ' ') advance();
      if (key.escape) onExit();
      return;
    }

    if (key.upArrow) {
      setCursor((value) => (value - 1 + (current?.options.length ?? 1)) % (current?.options.length ?? 1));
      return;
    }
    if (key.downArrow) {
      setCursor((value) => (value + 1) % (current?.options.length ?? 1));
      return;
    }
    if (key.return || input === ' ') {
      confirm(cursor);
      return;
    }
    if (key.escape) {
      onExit();
      return;
    }
    const digit = Number.parseInt(input, 10);
    if (!Number.isNaN(digit) && digit >= 1 && digit <= 9) {
      const choice = digit - 1;
      if (current && choice < current.options.length) {
        setCursor(choice);
        confirm(choice);
      }
    }
  });

  if (!current) {
    return <Text color={pick('yellow')}>{t(lang, 'quiz.noQuestions')}</Text>;
  }

  if (phase === 'result') {
    const correct = answers.filter((record) => record.correct).length;
    const ratio = items.length === 0 ? 0 : correct / items.length;
    const message = ratio === 1 ? t(lang, 'quiz.perfect') : ratio >= 0.7 ? t(lang, 'quiz.great') : t(lang, 'quiz.keepGoing');
    const wrongItems = items.filter((_, i) => answers[i] !== undefined && !answers[i]?.correct);

    return (
      <Box flexDirection="column">
        <Text bold color={pick('cyan')}>
          {t(lang, 'quiz.result')} — {title}
        </Text>
        <Box marginTop={1}>
          <Text>
            {progressBar(ratio)}  {correct}/{items.length}
          </Text>
        </Box>
        <Box marginTop={1}>
          <Text color={ratio === 1 ? pick('green') : ratio >= 0.7 ? pick('yellow') : pick('red')}>{message}</Text>
        </Box>
        {wrongItems.length > 0 ? (
          <Box flexDirection="column" marginTop={1}>
            <Text bold dimColor>
              {t(lang, 'quiz.answerKey')}
            </Text>
            {wrongItems.map((item) => (
              <Box key={item.key} flexDirection="column" marginTop={0}>
                <Text dimColor>• {item.prompt}</Text>
                <Text color={pick('green')}>
                  {'  → '}
                  {item.options[item.answer]}
                </Text>
              </Box>
            ))}
          </Box>
        ) : null}
        <Box marginTop={1}>
          <Text dimColor>{t(lang, 'common.pressAny')}</Text>
        </Box>
      </Box>
    );
  }

  const lastAnswer = answers.at(-1);

  return (
    <Box flexDirection="column">
      <Box>
        <Text bold color={pick('cyan')}>
          {t(lang, 'quiz.title')}
        </Text>
        <Text dimColor>
          {'  '}
          {t(lang, 'quiz.progress', { index: index + 1, total: items.length })}
          {'  ·  '}
          {current.stationTitle}
        </Text>
      </Box>

      <Box marginTop={1} flexDirection="column">
        <Text>{current.prompt}</Text>
      </Box>

      <Box flexDirection="column" marginTop={1}>
        {current.options.map((option, optionIndex) => {
          const isCursor = optionIndex === cursor && phase === 'question';
          const chosen = phase === 'feedback' && lastAnswer?.chosen === optionIndex;
          const isAnswer = optionIndex === current.answer;
          let color: string | undefined;
          if (phase === 'feedback') {
            if (isAnswer) color = pick('green');
            else if (chosen) color = pick('red');
          } else if (isCursor) color = pick('cyan');
          return (
            <Box key={optionIndex}>
              <Text color={color} bold={isCursor || (phase === 'feedback' && (isAnswer || chosen))}>
                {isCursor ? '❯ ' : '  '}
                {optionIndex + 1}. {option}
              </Text>
            </Box>
          );
        })}
      </Box>

      <Box marginTop={1} flexDirection="column">
        {phase === 'question' ? (
          <Text dimColor>{t(lang, 'quiz.choose', { max: current.options.length })}</Text>
        ) : (
          <Box flexDirection="column">
            <Text color={lastAnswer?.correct ? pick('green') : pick('red')} bold>
              {lastAnswer?.correct ? `✓ ${t(lang, 'common.correct')}` : `✗ ${t(lang, 'common.wrong')}`}
            </Text>
            <Box marginTop={0}>
              <Text wrap="wrap">
                {`${t(lang, 'quiz.explain')}: `}
                {current.explain}
              </Text>
            </Box>
            <Box marginTop={1}>
              <Text dimColor>{index + 1 >= items.length ? t(lang, 'quiz.finish') : t(lang, 'quiz.next')}</Text>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
