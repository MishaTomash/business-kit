/**
 * Prerender: список сторінок для статичного HTML. Викликається з плагіна у vite.config.ts
 * під час `npm run build`. Кожна гра з games.ts автоматично отримує власну сторінку
 * /games/<id>/index.html зі своїми <title>, description і og-мета для прев'ю посилань.
 */

import { GAMES } from '@/data';
import { BRAND, SITE_URL } from '@/data/site';
import { href, parsePath } from '@/router';
import { LEGAL_IDS } from '@/data/legal';
import { resolveView } from '@/pages';
import type { PageMeta } from '@/views/view';

export interface PrerenderPage {
  /** Файл відносно dist/, напр. 'games/slovovyr/index.html'. */
  readonly file: string;
  readonly key: string;
  readonly navTone: 'dark' | 'light';
  readonly meta: PageMeta;
  readonly markup: string;
}

const fileFor = (path: string): string => (path === '/' ? 'index.html' : `${path.replace(/^\//, '')}/index.html`);

export function pages(): PrerenderPage[] {
  const list: PrerenderPage[] = [];
  const add = (path: string, file = fileFor(path)): void => {
    const view = resolveView(path === '/404' ? { name: 'notFound' } : parsePath(path), { path });
    list.push({ file, key: view.key, navTone: view.navTone ?? 'light', meta: view.meta, markup: view.markup.value });
  };
  add(href.home());
  add(href.games());
  for (const g of GAMES) add(href.game(g.id));
  for (const id of LEGAL_IDS) add(href.legal(id));
  add('/404', '404.html');
  return list;
}

export const site = { BRAND, SITE_URL };
