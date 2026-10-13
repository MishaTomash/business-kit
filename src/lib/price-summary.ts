/**
 * Ціни запуску й підписки по всьому сайту (задача платформи 15): кожна гра має свою ціну з
 * Кабінету платформи. Там, де сайт говорить про всі ігри одразу, показуємо найменшу ціну, а якщо
 * ціни різні — з «від». Чисті функції без імпортів: їх перевіряє `npm test`.
 */

export type PriceKind = 'launch' | 'monthly';

export interface GamePrices {
  readonly launchUah: number;
  readonly monthlyUah: number;
}

export interface PriceSummary {
  /** Найменша ціна серед ігор. */
  readonly min: number;
  /** true — у всіх ігор ця сама ціна (тоді без «від»). */
  readonly same: boolean;
}

const KEY: Readonly<Record<PriceKind, keyof GamePrices>> = { launch: 'launchUah', monthly: 'monthlyUah' };

/** Підсумок цін; порожній список — ціна за замовчуванням. */
export function summarize(list: readonly GamePrices[], kind: PriceKind, fallback: GamePrices): PriceSummary {
  const values = list.map((p) => p[KEY[kind]]).filter((v) => Number.isInteger(v) && v > 0);
  if (values.length === 0) return { min: fallback[KEY[kind]], same: true };
  const min = Math.min(...values);
  return { min, same: values.every((v) => v === min) };
}

/** Ціна гри за видом. */
export const priceOf = (prices: GamePrices, kind: PriceKind): number => prices[KEY[kind]];

/** Чи схожа відповідь api на ціни: цілі гривні від 1 до 1 000 000. */
export function isPrice(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 1_000_000;
}

/**
 * Розбирає відповідь GET /api/public/games платформи: id гри платформи → ціни. Некоректні
 * записи пропускаються; зовсім некоректна відповідь — null (сайт лишає ціни зі збірки).
 */
export function parsePublicGames(body: unknown): Map<string, GamePrices> | null {
  if (typeof body !== 'object' || body === null) return null;
  const games = (body as { games?: unknown }).games;
  if (!Array.isArray(games)) return null;
  const out = new Map<string, GamePrices>();
  for (const item of games) {
    if (typeof item !== 'object' || item === null) continue;
    const { id, launchUah, monthlyUah } = item as Record<string, unknown>;
    if (typeof id !== 'string' || !/^[a-z][a-z0-9-]{1,31}$/.test(id)) continue;
    if (!isPrice(launchUah) || !isPrice(monthlyUah)) continue;
    out.set(id, { launchUah, monthlyUah });
  }
  return out;
}
