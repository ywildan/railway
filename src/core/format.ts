import { t } from './i18n.js';
import type { Lang } from './types.js';

/** Utilitas tampilan: durasi, persen, baris kemajuan, waktu relatif. */

export function formatDuration(ms: number, lang: Lang): string {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const parts: string[] = [];
  if (hours > 0) {
    parts.push(`${hours}${lang === 'id' ? ' jam' : 'h'}`);
    parts.push(`${minutes}${lang === 'id' ? ' mnt' : 'm'}`);
  } else if (minutes > 0) {
    parts.push(`${minutes}${lang === 'id' ? ' mnt' : 'm'}`);
    parts.push(`${seconds}${lang === 'id' ? ' dtk' : 's'}`);
  } else {
    parts.push(`${seconds}${lang === 'id' ? ' dtk' : 's'}`);
  }
  return parts.join(' ');
}

export function formatPercent(ratio: number): string {
  return `${Math.round(ratio * 100)}%`;
}

/** Baris kemajuan berblok, mis. "█████░░░░░". */
export function progressBar(ratio: number, width = 10): string {
  const clamped = Math.max(0, Math.min(1, ratio));
  const filled = Math.round(clamped * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

export function relativeDays(date: Date | string | undefined, now: Date, lang: Lang): string {
  if (!date) return '-';
  const then = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(then.getTime())) return '-';
  const days = Math.floor((now.getTime() - then.getTime()) / (24 * 60 * 60 * 1000));
  if (days <= 0) return t(lang, 'review.today');
  return t(lang, 'review.daysAgo', { days });
}

/** Memotong teks agar tidak meluber di terminal sempit. */
export function truncate(text: string, max: number): string {
  if (max <= 1) return '…';
  return text.length <= max ? text : `${text.slice(0, max - 1)}…`;
}
