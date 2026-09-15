/**
 * Toggle warna sederhana.
 * Simple colour toggle.
 *
 * Menghormati flag --no-color, env NO_COLOR, dan terminal non-interaktif
 * (pipa ke `less`, output CI, dsb).
 */

let colorEnabled = true;

export function setColorEnabled(enabled: boolean): void {
  colorEnabled = enabled;
}

export function isColorEnabled(): boolean {
  return colorEnabled;
}

/** Mengembalikan nama warna hanya bila warna aktif; jika tidak, undefined. */
export function pick(color: string): string | undefined {
  return colorEnabled ? color : undefined;
}

export function detectColorEnabled(noColorFlag: boolean): boolean {
  if (noColorFlag) return false;
  if (process.env['NO_COLOR']) return false;
  if (process.env['TERM'] === 'dumb') return false;
  return process.env['FORCE_COLOR'] ? true : Boolean(process.stdout.isTTY);
}
