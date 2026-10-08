/**
 * Маршрути на звичайних адресах (History API):
 *
 *   /              → головна
 *   /games         → каталог ігор
 *   /games/<id>    → сторінка гри
 *   /offer         → публічна оферта
 *   /privacy       → політика конфіденційності
 *   усе інше       → 404
 *
 * Сервер віддає готовий HTML для кожної сторінки (prerender під час збірки),
 * а для невідомих адрес nginx віддає /index.html, і клієнт показує 404.
 * Старі hash-адреси (#/, #/games…, #/p/…, #/c/…) перенаправляються на нові.
 */

import type { Route } from '@/types';

/** Будуйте адреси лише через ці функції. */
export const href = {
  home: (): string => '/',
  games: (): string => '/games',
  game: (id: string): string => `/games/${encodeURIComponent(id)}`,
  legal: (id: 'offer' | 'privacy'): string => `/${id}`,
  /** Секція головної: /#how, /#prices, /#faq. */
  section: (id: string): string => `/#${id}`,
} as const;

const GAME_ID = /^[a-z0-9-]+$/;

export function parsePath(pathname: string): Route {
  const path = pathname.replace(/\/index\.html$/, '/').replace(/\/+$/, '') || '/';
  if (path === '/') return { name: 'home' };
  if (path === '/games') return { name: 'games' };
  if (path === '/offer') return { name: 'legal', id: 'offer' };
  if (path === '/privacy') return { name: 'legal', id: 'privacy' };
  const m = /^\/games\/([^/]+)$/.exec(path);
  if (m?.[1]) {
    const id = decodeURIComponent(m[1]);
    if (GAME_ID.test(id)) return { name: 'game', id };
  }
  return { name: 'notFound' };
}

/** Ключ маршруту: prerender пише його в data-route, клієнт порівнює, щоб не рендерити двічі. */
export function routeKey(route: Route): string {
  return route.name === 'game' ? `game:${route.id}` : route.name === 'legal' ? `legal:${route.id}` : route.name;
}

/**
 * Стара hash-адреса → нова. `null`, якщо hash не схожий на старий маршрут
 * (звичайні якорі на кшталт #faq не чіпаємо).
 *   #/ → /,  #/games → /games,  #/games/<id> → /games/<id>,
 *   #/p/<id> → /games/<id> (неіснуюча гра покаже 404),  #/c/<будь-що> → /games
 */
export function legacyRedirect(hash: string): string | null {
  if (!hash.startsWith('#/')) return null;
  const parts = hash.slice(2).split('/').filter(Boolean);
  const [kind, raw] = parts;
  if (!kind) return href.home();
  const id = raw ? decodeURIComponent(raw) : '';
  if (kind === 'games') return id ? href.game(id) : href.games();
  if (kind === 'p') return id ? href.game(id) : href.games();
  if (kind === 'c') return href.games();
  return href.home();
}
