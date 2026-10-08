/**
 * Hash router.
 *
 *   #/            → home
 *   #/c/<id>      → category (list of projects)
 *   #/p/<id>      → project page
 *
 * Hash routing works on any static hosting (GitHub Pages, Netlify, S3)
 * with zero server configuration, and links stay shareable.
 */

import type { Route } from '@/types';

/** Build a URL for a route. Use these instead of hand-written strings. */
export const href = {
  home: (): string => '#/',
  category: (id: string): string => `#/c/${encodeURIComponent(id)}`,
  project: (id: string): string => `#/p/${encodeURIComponent(id)}`,
} as const;

/** Parse `location.hash` into a typed route. Unknown → home. */
export function parseRoute(hash: string = location.hash): Route {
  const [, kind, rawId] = hash.replace(/^#/, '').split('/');
  const id = rawId ? decodeURIComponent(rawId) : '';

  if (kind === 'c' && id) return { name: 'category', id };
  if (kind === 'p' && id) return { name: 'project', id };
  return { name: 'home' };
}

/** Subscribe to route changes. Calls `onRoute` immediately with the current route. */
export function startRouter(onRoute: (route: Route) => void): void {
  window.addEventListener('hashchange', () => onRoute(parseRoute()));
  onRoute(parseRoute());
}
