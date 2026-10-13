/**
 * Актуальні ціни з платформи без перезбирання сайту. Після відкриття сторінки браузер один раз
 * питає GET /api/public/games (той самий домен: nginx пересилає запит в api платформи, CSP
 * `connect-src 'self'` не змінюється) і підставляє ціни в позначені місця:
 *   <span data-price="launch" data-game="crossword">1 500</span> — ціна однієї гри;
 *   <span data-price="monthly">99</span> — ціна для всіх ігор («від», якщо ціни різні).
 * Якщо api не відповідає, лишаються ціни зі збірки. Калькулятор слухає подію PRICES_EVENT.
 */

import { html, type SafeHtml } from './dom';
import { parsePublicGames, priceOf, summarize, type GamePrices, type PriceKind } from './price-summary';
import { PRICING } from '@/data/site';
import { WORKING_PLATFORM_IDS, priceNumber, summaryText } from '@/data/pricing';

export const PRICES_URL = '/api/public/games';
export const PRICES_EVENT = 'klitynka:prices';
const TIMEOUT_MS = 5000;

let live: ReadonlyMap<string, GamePrices> | null = null;
let started = false;

/** Позначене місце з ціною: при збірці — ціна зі збірки, у браузері — актуальна. */
export function priceMark(kind: PriceKind, text: string, platformId?: string): SafeHtml {
  return platformId
    ? html`<span data-price="${kind}" data-game="${platformId}">${text}</span>`
    : html`<span data-price="${kind}">${text}</span>`;
}

/** Актуальні ціни гри платформи або undefined, поки відповіді немає. */
export const livePricesOf = (platformId: string | undefined): GamePrices | undefined =>
  platformId && live ? live.get(platformId) : undefined;

function textFor(kind: PriceKind, platformId: string | undefined): string | null {
  if (!live) return null;
  if (platformId) {
    const prices = live.get(platformId);
    return prices ? priceNumber(priceOf(prices, kind)) : null;
  }
  const list = WORKING_PLATFORM_IDS.flatMap((id) => {
    const prices = live?.get(id);
    return prices ? [prices] : [];
  });
  return list.length > 0 ? summaryText(summarize(list, kind, PRICING)) : null;
}

/** Підставляє актуальні ціни в позначені місця під root. */
export function applyLivePrices(root: ParentNode): void {
  if (!live) return;
  root.querySelectorAll<HTMLElement>('[data-price]').forEach((el) => {
    const kind = el.dataset['price'];
    if (kind !== 'launch' && kind !== 'monthly') return;
    const text = textFor(kind, el.dataset['game']);
    if (text !== null && el.textContent !== text) el.textContent = text;
  });
}

/** Один запит на відкриття сторінки. Помилка мовчазна: лишаються ціни зі збірки. */
export function loadLivePrices(root: ParentNode): void {
  if (started || typeof fetch !== 'function') return;
  started = true;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  fetch(PRICES_URL, { headers: { accept: 'application/json' }, signal: controller.signal })
    .then((res) => (res.ok ? res.json() : null))
    .then((body: unknown) => {
      const parsed = parsePublicGames(body);
      if (!parsed || parsed.size === 0) return;
      live = parsed;
      applyLivePrices(root);
      window.dispatchEvent(new CustomEvent(PRICES_EVENT));
    })
    .catch(() => undefined)
    .finally(() => clearTimeout(timer));
}
