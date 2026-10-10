/**
 * Розмітка Schema.org (JSON-LD) для пошуковиків. Prerender (vite.config.ts) пише її в
 * <script type="application/ld+json">. Це блок даних: браузер його не виконує, CSP `script-src 'self'`
 * на нього не діє (перевірено в Chromium). Рішення власника від 10.10.2026 — у CLAUDE.md і docs/SEO-PROGRESS.md.
 *
 * Чесність: лише факти з даних сайту. Жодних AggregateRating, Review, вигаданих контактів чи адрес.
 */

import { BRAND, SITE_URL, TELEGRAM_URL } from '@/data/site';

export type JsonLd = Readonly<Record<string, unknown>>;

const ORG_ID = `${SITE_URL}/#org`;
const SITE_ID = `${SITE_URL}/#website`;
const abs = (path: string): string => `${SITE_URL}${path}`;

/** Контакт показуємо лише тоді, коли в .env справжнє посилання, а не заглушка з .env.example. */
const hasRealContact = !TELEGRAM_URL.includes('your_username');

export function organization(): JsonLd {
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: BRAND,
    url: abs('/'),
    logo: abs('/apple-touch-icon.png'),
    ...(hasRealContact ? { contactPoint: { '@type': 'ContactPoint', contactType: 'sales', url: TELEGRAM_URL, availableLanguage: ['uk'] } } : {}),
  };
}

export function website(): JsonLd {
  return { '@type': 'WebSite', '@id': SITE_ID, url: abs('/'), name: BRAND, inLanguage: 'uk', publisher: { '@id': ORG_ID } };
}

/** Крихти: [['Головна', '/'], ['Каталог ігор', '/games'], ['Слововир', '/games/slovovyr']]. */
export function breadcrumbs(items: readonly (readonly [name: string, path: string])[]): JsonLd {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(path) })),
  };
}

export function article(a: { headline: string; description: string; path: string; published: string; modified: string }): JsonLd {
  return {
    '@type': 'Article',
    headline: a.headline,
    description: a.description,
    inLanguage: 'uk',
    datePublished: a.published,
    dateModified: a.modified,
    mainEntityOfPage: abs(a.path),
    author: { '@id': ORG_ID },
    publisher: { '@id': ORG_ID },
  };
}

/** Один <script> на сторінку: усі вузли в @graph. «<» екранується, щоб текст не закрив тег. */
export function jsonLdScript(nodes: readonly JsonLd[]): string {
  const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes }).replace(/</g, '\\u003c');
  return `<script type="application/ld+json">${json}</script>`;
}
