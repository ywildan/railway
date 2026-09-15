import { Box } from 'ink';
import { useCallback, useMemo, useState } from 'react';
import { About } from './components/About.js';
import { Flashcards, type CardItem } from './components/Flashcards.js';
import { Header } from './components/Header.js';
import { Lesson } from './components/Lesson.js';
import { Message } from './components/Message.js';
import { ProgressView } from './components/ProgressView.js';
import { Quiz, type QuizOutcome } from './components/Quiz.js';
import { SelectList } from './components/SelectList.js';
import { TrackDetail, type TrackAction } from './components/TrackDetail.js';
import { TrackList } from './components/TrackList.js';
import type { CommandName } from './core/args.js';
import { getTrack, listTracks } from './core/content.js';
import { t } from './core/i18n.js';
import { buildReviewQueue, buildSession, collectQuestions, type QuizItem } from './core/quiz.js';
import {
  addStudyTime,
  recordQuiz,
  recordStation,
  saveProgress,
  setLanguage,
  summariseTrack,
  type ProgressFile,
} from './core/store.js';
import type { Lang } from './core/types.js';

type Route =
  | { name: 'menu' }
  | { name: 'tracks'; mode: 'detail' | 'quiz' | 'cards' | 'review' }
  | { name: 'track'; trackId: string }
  | { name: 'lesson'; trackId: string; index: number }
  | { name: 'quiz'; title: string; trackId: string; stationId?: string; stationIndex?: number; items: QuizItem[] }
  | { name: 'cards'; trackId: string }
  | { name: 'review'; trackId?: string }
  | { name: 'progress' }
  | { name: 'language' }
  | { name: 'about' }
  | { name: 'message'; text: string; next: Route };

interface RouteState {
  route: Route;
  startedAt: number;
}

export interface AppProps {
  lang: Lang;
  progress: ProgressFile;
  version: string;
  dataPath: string;
  initialCommand: CommandName;
  initialTrackId?: string;
  onExit: () => void;
}

export function App({
  lang: initialLang,
  progress: initialProgress,
  version,
  dataPath,
  initialCommand,
  initialTrackId,
  onExit,
}: AppProps) {
  const [lang, setLang] = useState<Lang>(initialLang);
  const [progress, setProgress] = useState<ProgressFile>(initialProgress);
  const [state, setState] = useState<RouteState>(() => ({
    route: initialRouteFor(initialCommand, initialTrackId, initialLang, initialProgress),
    startedAt: Date.now(),
  }));

  const { route, startedAt } = state;
  const tracks = useMemo(() => listTracks(lang), [lang]);

  const commit = useCallback((next: ProgressFile) => {
    setProgress(next);
    saveProgress(next);
  }, []);

  const navigate = useCallback((nextRoute: Route) => {
    setState({ route: nextRoute, startedAt: Date.now() });
  }, []);

  const trackById = useCallback((trackId: string) => getTrack(lang, trackId), [lang]);

  /**
   * Menyimpan hasil kuis. Bila sesi berisi soal dari beberapa jalur sekaligus
   * (mode tinjauan lintas jalur), hasilnya dipisah per jalur.
   */
  const finishQuiz = useCallback(
    (outcome: QuizOutcome, items: QuizItem[]) => {
      const byTrack = new Map<string, Array<{ questionId: string; correct: boolean }>>();
      outcome.records.forEach((record, index) => {
        const item = items[index];
        const trackId = item?.trackId ?? record.key.split(':')[0] ?? 'unknown';
        const bucket = byTrack.get(trackId) ?? [];
        bucket.push({ questionId: record.key, correct: record.correct });
        byTrack.set(trackId, bucket);
      });

      let next = progress;
      const share = outcome.records.length === 0 ? 0 : outcome.durationMs / outcome.records.length;
      for (const [trackId, results] of byTrack) {
        next = recordQuiz(next, { trackId, results, durationMs: Math.round(share * results.length) });
      }
      commit(next);
    },
    [progress, commit],
  );

  const cardItemsFor = useCallback(
    (trackId: string): CardItem[] => {
      const track = trackById(trackId);
      if (!track) return [];
      return track.stations.flatMap((station) =>
        station.cards.map((card) => ({ front: card.front, back: card.back, stationTitle: station.title })),
      );
    },
    [trackById],
  );

  const reviewItemsFor = useCallback(
    (trackId?: string): QuizItem[] => {
      const targets = trackId ? [trackId] : tracks.map((track) => track.id);
      const merged: QuizItem[] = [];
      for (const id of targets) {
        const track = trackById(id);
        if (!track) continue;
        merged.push(...buildReviewQueue(track, progress, new Date(), trackId ? 12 : 2));
      }
      return merged.slice(0, trackId ? 12 : 12);
    },
    [trackById, tracks, progress],
  );

  const startQuiz = useCallback(
    (trackId: string, mode: 'all' | 'station', stationId?: string, stationIndex?: number) => {
      const track = trackById(trackId);
      if (!track) return;
      const items = buildSession(collectQuestions(track, mode === 'station' ? stationId : undefined));
      if (items.length === 0) {
        navigate({ name: 'message', text: t(lang, 'quiz.noQuestions'), next: { name: 'track', trackId } });
        return;
      }
      const stationTitle = track.stations.find((station) => station.id === stationId)?.title;
      navigate({
        name: 'quiz',
        title: mode === 'station' && stationTitle ? `${track.title} · ${stationTitle}` : track.title,
        trackId,
        stationId: mode === 'station' ? stationId : undefined,
        stationIndex,
        items,
      });
    },
    [trackById, navigate, lang],
  );

  /** Setelah kuis satu stasiun: lanjut ke stasiun berikutnya, atau selesai. */
  const afterStationQuiz = useCallback(
    (trackId: string, index: number) => {
      const track = trackById(trackId);
      if (!track) {
        navigate({ name: 'menu' });
        return;
      }
      if (index + 1 < track.stations.length) {
        navigate({ name: 'lesson', trackId, index: index + 1 });
        return;
      }
      navigate({
        name: 'message',
        text: `${track.emoji} ${track.title} — ${t(lang, 'track.completed')}\n${t(lang, 'lesson.learned')}`,
        next: { name: 'menu' },
      });
    },
    [trackById, navigate, lang],
  );

  const renderRoute = () => {
    switch (route.name) {
      case 'menu':
        return (
          <SelectList<string>
            lang={lang}
            items={[
              { value: 'tracks', label: t(lang, 'menu.pickTrack'), hint: t(lang, 'menu.pickTrackHint') },
              { value: 'quiz', label: t(lang, 'menu.quiz'), hint: t(lang, 'menu.quizHint') },
              { value: 'cards', label: t(lang, 'menu.cards'), hint: t(lang, 'menu.cardsHint') },
              { value: 'review', label: t(lang, 'menu.review'), hint: t(lang, 'menu.reviewHint') },
              { value: 'progress', label: t(lang, 'menu.progress'), hint: t(lang, 'menu.progressHint') },
              { value: 'language', label: t(lang, 'menu.language'), hint: t(lang, 'menu.languageHint') },
              { value: 'about', label: t(lang, 'menu.about'), hint: t(lang, 'menu.aboutHint') },
              { value: 'exit', label: t(lang, 'common.exit') },
            ]}
            onSelect={(value) => {
              if (value === 'tracks') navigate({ name: 'tracks', mode: 'detail' });
              else if (value === 'quiz') navigate({ name: 'tracks', mode: 'quiz' });
              else if (value === 'cards') navigate({ name: 'tracks', mode: 'cards' });
              else if (value === 'review') navigate({ name: 'review' });
              else if (value === 'progress') navigate({ name: 'progress' });
              else if (value === 'language') navigate({ name: 'language' });
              else if (value === 'about') navigate({ name: 'about' });
              else onExit();
            }}
            onCancel={onExit}
          />
        );

      case 'tracks':
        return (
          <TrackList
            lang={lang}
            title={t(lang, 'tracks.title')}
            tracks={tracks}
            badgeFor={(track) => {
              const stat = summariseTrack(progress, track.id);
              if (stat.stationsCompleted === 0) return undefined;
              return `${stat.stationsCompleted}/${track.stationCount} · ${track.minutes} ${t(lang, 'tracks.minutes')}`;
            }}
            onSelect={(trackId) => {
              if (route.mode === 'detail') navigate({ name: 'track', trackId });
              else if (route.mode === 'quiz') startQuiz(trackId, 'all');
              else if (route.mode === 'cards') navigate({ name: 'cards', trackId });
              else navigate({ name: 'review', trackId });
            }}
            onCancel={() => navigate({ name: 'menu' })}
          />
        );

      case 'track': {
        const track = trackById(route.trackId);
        if (!track) {
          return (
            <Message lang={lang} tone="error" onDismiss={() => navigate({ name: 'tracks', mode: 'detail' })}>
              {t(lang, 'cli.trackNotFound', { id: route.trackId })}
            </Message>
          );
        }
        const stat = summariseTrack(progress, track.id);
        return (
          <TrackDetail
            lang={lang}
            track={track}
            stationsCompleted={progress.tracks[track.id]?.stationsCompleted ?? []}
            lastScore={stat.lastScore ? { correct: stat.lastScore.correct, total: stat.lastScore.total } : undefined}
            onAction={(action: TrackAction) => {
              const done = progress.tracks[track.id]?.stationsCompleted.length ?? 0;
              if (action === 'start') {
                navigate({ name: 'lesson', trackId: track.id, index: Math.min(done, track.stations.length - 1) });
              } else if (action === 'quiz') {
                startQuiz(track.id, 'all');
              } else if (action === 'cards') {
                navigate({ name: 'cards', trackId: track.id });
              } else {
                navigate({ name: 'review', trackId: track.id });
              }
            }}
            onBack={() => navigate({ name: 'tracks', mode: 'detail' })}
          />
        );
      }

      case 'lesson': {
        const track = trackById(route.trackId);
        const station = track?.stations[route.index];
        if (!track || !station) {
          return (
            <Message lang={lang} tone="error" onDismiss={() => navigate({ name: 'menu' })}>
              {t(lang, 'cli.trackNotFound', { id: route.trackId })}
            </Message>
          );
        }
        return (
          <Lesson
            lang={lang}
            track={track}
            station={station}
            stationIndex={route.index}
            onNext={() => {
              const elapsed = Date.now() - startedAt;
              commit(addStudyTime(recordStation(progress, track.id, station.id), track.id, elapsed));
              startQuiz(track.id, 'station', station.id, route.index);
            }}
            onExit={() => navigate({ name: 'track', trackId: track.id })}
          />
        );
      }

      case 'quiz':
        return (
          <Quiz
            lang={lang}
            title={route.title}
            items={route.items}
            onFinish={(outcome) => finishQuiz(outcome, route.items)}
            onExit={() => {
              if (route.stationId && typeof route.stationIndex === 'number') {
                afterStationQuiz(route.trackId, route.stationIndex);
                return;
              }
              navigate({ name: 'menu' });
            }}
          />
        );

      case 'cards': {
        const track = trackById(route.trackId);
        if (!track) {
          return (
            <Message lang={lang} tone="error" onDismiss={() => navigate({ name: 'menu' })}>
              {t(lang, 'cli.trackNotFound', { id: route.trackId })}
            </Message>
          );
        }
        return (
          <Flashcards
            lang={lang}
            title={track.title}
            cards={cardItemsFor(track.id)}
            onComplete={() => commit(addStudyTime(progress, track.id, Date.now() - startedAt))}
            onExit={() => navigate({ name: 'track', trackId: track.id })}
          />
        );
      }

      case 'review': {
        const items = buildSession(reviewItemsFor(route.trackId));
        if (items.length === 0) {
          return (
            <Message lang={lang} tone="success" onDismiss={() => navigate({ name: 'menu' })}>
              {`${t(lang, 'review.noneDue')}\n${t(lang, 'review.hint')}`}
            </Message>
          );
        }
        return (
          <Quiz
            lang={lang}
            title={t(lang, 'review.title')}
            items={items}
            onFinish={(outcome) => finishQuiz(outcome, items)}
            onExit={() => navigate({ name: 'menu' })}
          />
        );
      }

      case 'progress':
        return <ProgressView lang={lang} progress={progress} tracks={tracks} dataPath={dataPath} onExit={() => navigate({ name: 'menu' })} />;

      case 'language':
        return (
          <SelectList<Lang>
            lang={lang}
            items={[
              { value: 'id', label: t(lang, 'lang.id') },
              { value: 'en', label: t(lang, 'lang.en') },
            ]}
            initialIndex={lang === 'id' ? 0 : 1}
            onSelect={(value) => {
              commit(setLanguage(progress, value));
              setLang(value);
              const label = value === 'id' ? t(value, 'lang.id') : t(value, 'lang.en');
              navigate({ name: 'message', text: t(value, 'lang.changed', { lang: label }), next: { name: 'menu' } });
            }}
            onCancel={() => navigate({ name: 'menu' })}
          />
        );

      case 'about':
        return <About lang={lang} version={version} onExit={() => navigate({ name: 'menu' })} />;

      case 'message':
        return (
          <Message lang={lang} tone="success" onDismiss={() => navigate(route.next)}>
            {route.text}
          </Message>
        );
    }
  };

  return (
    <Box flexDirection="column" paddingX={1}>
      <Header lang={lang} title="Railway" subtitle={route.name === 'menu' ? t(lang, 'menu.subtitle') : undefined} />
      {renderRoute()}
    </Box>
  );
}

function initialRouteFor(command: CommandName, trackId: string | undefined, lang: Lang, progress: ProgressFile): Route {
  switch (command) {
    case 'tracks':
      return { name: 'tracks', mode: 'detail' };

    case 'start': {
      if (!trackId) return { name: 'tracks', mode: 'detail' };
      const track = getTrack(lang, trackId);
      if (!track) return { name: 'track', trackId };
      const done = progress.tracks[trackId]?.stationsCompleted.length ?? 0;
      return { name: 'lesson', trackId, index: Math.min(done, track.stations.length - 1) };
    }

    case 'quiz': {
      if (!trackId) return { name: 'tracks', mode: 'quiz' };
      const track = getTrack(lang, trackId);
      if (!track) return { name: 'track', trackId };
      return { name: 'quiz', title: track.title, trackId, items: buildSession(collectQuestions(track)) };
    }

    case 'cards':
      return trackId ? { name: 'cards', trackId } : { name: 'tracks', mode: 'cards' };

    case 'review':
      return { name: 'review', trackId };

    case 'progress':
      return { name: 'progress' };

    case 'lang':
      return { name: 'language' };

    case 'about':
      return { name: 'about' };

    default:
      return { name: 'menu' };
  }
}
