/**
 * Data access layer: lookups and derived data.
 * Views never touch the raw arrays directly → swapping the source
 * (e.g. to a CMS or JSON fetch later) only changes this file.
 */

import type { Category, Project } from '@/types';
import { CATEGORIES } from './categories';
import { PROJECTS } from './projects';

export { CATEGORIES, PROJECTS };

const categoryById = new Map(CATEGORIES.map((c) => [c.id, c] as const));
const projectById = new Map(PROJECTS.map((p) => [p.id, p] as const));

export const getCategory = (id: string): Category | undefined => categoryById.get(id);
export const getProject = (id: string): Project | undefined => projectById.get(id);

/** Projects of a category: available first, then "soon". */
export function projectsIn(categoryId: string): Project[] {
  return PROJECTS.filter((p) => p.categoryId === categoryId).sort(
    (a, b) => Number(a.status === 'soon') - Number(b.status === 'soon'),
  );
}

/** Number of projects that can be bought right now. */
export const availableCount = (categoryId: string): number =>
  projectsIn(categoryId).filter((p) => p.status === 'available').length;

/** Lowest launch price among available projects of a category, or `null`. */
export function minPriceIn(categoryId: string): number | null {
  const prices = projectsIn(categoryId)
    .filter((p) => p.status === 'available')
    .map((p) => p.priceUah);
  return prices.length ? Math.min(...prices) : null;
}

/* Dev-time integrity checks: catch broken references while editing content. */
if (import.meta.env.DEV) {
  for (const p of PROJECTS) {
    if (!categoryById.has(p.categoryId)) console.warn(`[data] Project "${p.id}" has unknown categoryId "${p.categoryId}"`);
  }
  if (projectById.size !== PROJECTS.length) console.warn('[data] Duplicate project ids');
}
