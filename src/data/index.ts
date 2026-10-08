/**
 * Доступ до даних: пошук і похідні значення. Сторінки не чіпають масиви напряму,
 * тож зміна джерела (CMS, JSON) торкнеться лише цього файлу.
 */

import type { Game } from '@/types';
import { GAMES } from './games';

export { GAMES };

const byId = new Map(GAMES.map((g) => [g.id, g] as const));

export const getGame = (id: string): Game | undefined => byId.get(id);

/** Чи можна грати й купити. Заглушка (`mock`) завжди поводиться як «скоро». */
export const isPlayable = (g: Game): boolean => g.status === 'available' && g.mock !== true;

/** Каталог: спершу доступні, потім «скоро», усередині — порядок з games.ts. */
export const catalog = (): Game[] =>
  GAMES.map((g, i) => ({ g, i }))
    .sort((a, b) => Number(isPlayable(b.g)) - Number(isPlayable(a.g)) || a.i - b.i)
    .map(({ g }) => g);

export const liveCount = (): number => GAMES.filter(isPlayable).length;
export const soonCount = (): number => GAMES.length - liveCount();

/** Жанри в порядку появи в каталозі. */
export const genres = (): string[] => [...new Set(catalog().map((g) => g.genre))];

/** Фільтр за жанром з'являється, коли ігор більше шести. */
export const FILTER_FROM = 7;

/* Перевірки під час розробки: биті дані помітно одразу. */
if (import.meta.env.DEV && typeof window !== 'undefined') {
  if (byId.size !== GAMES.length) console.warn('[ігри] Повторюється id гри');
  for (const g of GAMES) {
    if (!/^[a-z0-9-]+$/.test(g.id)) console.warn(`[ігри] id «${g.id}»: лише латиниця, цифри й дефіс`);
  }
  const mocks = GAMES.filter((g) => g.mock).map((g) => g.id);
  if (mocks.length) console.warn(`[ігри] Досі заглушки (mock): ${mocks.join(', ')}`);
}
