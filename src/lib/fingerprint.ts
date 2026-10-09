/**
 * Генетичний відбиток гри: 16 колонок по дві смуги, детерміновано з назви, жанру й кольору.
 * Правило: design/DESIGN-SPEC.md, розділ 5. Еталон: design/ka-lib.cjs (перевіряється тестом
 * `npm test` на контрольному прикладі й на 50 довільних наборах).
 *
 * Чисті функції без DOM, Date і Math.random: працюють і в браузері, і в Node (prerender, превʼю).
 * Порядок дій і 32-бітна арифметика (Math.imul, >>> 0, | 0) повторюють еталон один в один.
 * Модуль навмисно не імпортує нічого з аліасом '@/': тест запускає його напряму в Node.
 */

import { contrast } from './theme.ts';

/** Жанри зі спеки. Назви для людей лежать у src/data/genres.ts. */
export const GENRE_IDS = ['slova', 'viktoryny', 'holovolomky', 'pamiat', 'druzi'] as const;
export type GenreId = (typeof GENRE_IDS)[number];

/** Кольори жанрів. Ті самі значення є в src/styles/tokens.css (--genre-*); тест стежить, щоб вони збігались. */
export const GENRE_COLORS: Readonly<Record<GenreId, string>> = {
  slova: '#E9D8A6',
  viktoryny: '#A9C79A',
  holovolomky: '#E0A9B8',
  pamiat: '#D6B98C',
  druzi: '#9FC1CF',
};

export const CORAL = '#EE8466';
export const IVORY = '#F1ECE1';
/** Тло відбитка завжди темне: Ґрунт або Шар. */
export const FINGERPRINT_BG = ['#0E1714', '#15221E'] as const;
export const COLUMNS = 16;
/** Висота поля в одиницях; смуги 3..14 одиниць, розрив між ними 1 одиниця. */
export const FIELD_UNITS = 30;
/** Ширина смуги в частках колонки. */
export const BAR_WIDTH = 0.55;
/** Колір гри, темніший за цей контраст до тла, у палітрі замінюється кольором жанру. */
export const MIN_GAME_COLOR_CONTRAST = 3;

export interface FingerprintInput {
  /** Назва гри, як у каталозі. */
  readonly name: string;
  readonly genre: GenreId;
  /** Колір гри, `#rrggbb`. */
  readonly color: string;
}

export interface FingerprintBar {
  /** Висота верхньої смуги, одиниць (3..14). */
  readonly top: number;
  /** Висота нижньої смуги, одиниць (3..14). */
  readonly bottom: number;
  /** Індекси в палітрі: 0 — колір гри, 1 — колір жанру, 2 — корал, 3 — слонова кістка. */
  readonly i1: number;
  readonly i2: number;
  /** Ті самі кольори як hex (верхній регістр). */
  readonly c1: string;
  readonly c2: string;
}

export interface Fingerprint {
  readonly key: string;
  readonly seed: number;
  readonly phase: number;
  /** [колір гри або жанру, колір жанру, корал, слонова кістка] */
  readonly palette: readonly [string, string, string, string];
  /** true, якщо колір гри замінено кольором жанру через слабкий контраст до тла. */
  readonly colorReplaced: boolean;
  readonly bars: readonly FingerprintBar[];
}

/** 1. Ключ: нормалізована назва | жанр | колір. */
export function fingerprintKey({ name, genre, color }: FingerprintInput): string {
  return `${name.normalize('NFC').trim().toLowerCase()}|${genre}|${color.toLowerCase()}`;
}

/** 2. Зерно: FNV-1a 32 біт по байтах UTF-8 ключа. */
export function fnv1a32(text: string): number {
  let h = 0x811c9dc5;
  for (const b of new TextEncoder().encode(text)) {
    h ^= b;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** 3. Генератор mulberry32: r() у [0, 1). */
export function mulberry32(seed: number): () => number {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Чи достатньо контрастний колір гри до обох варіантів тла. */
export function isGameColorReadable(color: string): boolean {
  return FINGERPRINT_BG.every((bg) => contrast(color, bg) >= MIN_GAME_COLOR_CONTRAST);
}

/**
 * Висоти й індекси палітри рівно за еталоном. Окремо від палітри, щоб тест міг зіставити
 * сирі значення з ka-lib навіть для темних кольорів (правило 3 : 1 в еталоні не реалізоване).
 * `raw` — значення 3 + 11·amp·k до округлення: тест перевіряє, що вони не лежать на межі x,5.
 */
export function fingerprintBars(seed: number): { phase: number; bars: { top: number; bottom: number; i1: number; i2: number; rawTop: number; rawBottom: number }[] } {
  const r = mulberry32(seed);
  // Порядок викликів r(): phase, потім (k, c1, c2) × 16
  const phase = r() * 2 * Math.PI;
  const bars = [];
  for (let i = 0; i < COLUMNS; i++) {
    const amp = Math.abs(Math.cos(0.55 * i + phase));
    const k = 0.55 + 0.45 * r();
    const rawTop = 3 + 11 * amp * k;
    const rawBottom = 3 + 11 * amp * (1.5 - k);
    const i1 = Math.floor(r() * 4);
    const i2 = Math.floor(r() * 4);
    bars.push({ top: Math.round(rawTop), bottom: Math.round(rawBottom), i1, i2, rawTop, rawBottom });
  }
  return { phase, bars };
}

/** Повна модель відбитка. */
export function fingerprint(input: FingerprintInput): Fingerprint {
  const genreColor = GENRE_COLORS[input.genre];
  if (!genreColor) throw new Error(`Невідомий жанр відбитка: ${String(input.genre)}`);
  if (!/^#[0-9a-f]{6}$/i.test(input.color)) throw new Error(`Колір гри має бути #rrggbb: ${input.color}`);
  const key = fingerprintKey(input);
  const seed = fnv1a32(key);
  const readable = isGameColorReadable(input.color);
  // 4. Палітра P = [колір гри, колір жанру, #EE8466, #F1ECE1]; темний колір гри → колір жанру.
  const palette = [readable ? input.color.toUpperCase() : genreColor, genreColor, CORAL, IVORY] as const;
  const { phase, bars } = fingerprintBars(seed);
  return {
    key,
    seed,
    phase,
    palette,
    colorReplaced: !readable,
    bars: bars.map(({ top, bottom, i1, i2 }) => ({ top, bottom, i1, i2, c1: palette[i1] ?? IVORY, c2: palette[i2] ?? IVORY })),
  };
}

/* ---------------------------------------------------------------- малювання */

export interface FingerprintSvgOptions {
  /** Клас кореневого <svg>. */
  readonly className?: string;
  /** Залити тло (для окремої картинки, напр. превʼю). За замовчуванням тло дає контейнер. */
  readonly background?: (typeof FINGERPRINT_BG)[number];
}

const PALETTE_CLASS = ['fp-game', 'fp-genre', 'fp-coral', 'fp-ivory'] as const;

/** Число без зайвих нулів: 0.225, 7.5. */
const n = (v: number): string => String(Math.round(v * 1000) / 1000);

/**
 * SVG-рядок відбитка. Поле 16 × 30 одиниць тягнеться на розмір контейнера (preserveAspectRatio="none").
 * Кожна смуга має fill з hex (працює як окремий файл без CSS) і клас палітри, через який сайт
 * бере кольори з токенів (--coral, --ivory, --genre-*).
 */
export function renderFingerprintSvg(fp: Fingerprint, genre: GenreId, opts: FingerprintSvgOptions = {}): string {
  const mid = FIELD_UNITS / 2;
  const half = 0.5; // розрив 1 одиниця по центру
  const x0 = (1 - BAR_WIDTH) / 2;
  const rects: string[] = [];
  fp.bars.forEach((b, i) => {
    const x = n(i + x0);
    rects.push(
      `<rect class="${PALETTE_CLASS[b.i1] ?? ''}" x="${x}" y="${n(mid - half - b.top)}" width="${n(BAR_WIDTH)}" height="${b.top}" fill="${b.c1}"/>`,
      `<rect class="${PALETTE_CLASS[b.i2] ?? ''}" x="${x}" y="${n(mid + half)}" width="${n(BAR_WIDTH)}" height="${b.bottom}" fill="${b.c2}"/>`,
    );
  });
  const bg = opts.background ? `<rect width="${COLUMNS}" height="${FIELD_UNITS}" fill="${opts.background}"/>` : '';
  const cls = ['fp', `fp--${genre}`, opts.className].filter(Boolean).join(' ');
  return `<svg class="${cls}" viewBox="0 0 ${COLUMNS} ${FIELD_UNITS}" preserveAspectRatio="none" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">${bg}${rects.join('')}</svg>`;
}
