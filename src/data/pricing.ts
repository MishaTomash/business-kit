/**
 * Ціни сайту зі збірки. Кожна гра має свою ціну запуску й підписки з платформи (games.generated.json,
 * `npm run export:games -- --from-db`). Там, де мова про всі ігри, — найменша ціна серед ігор, що
 * працюють, з «від», якщо ціни різні. Після відкриття сторінки src/lib/live-prices.ts підставляє
 * актуальні ціни з платформи, тож зміна ціни в адмінці видно без перезбирання сайту.
 */

import { GAMES } from './games';
import { PRICING } from './site';
import { summarize, type GamePrices, type PriceKind, type PriceSummary } from '@/lib/price-summary';

/** Ігри, що працюють: їхні ціни показує сайт (заглушки й «скоро» не рахуються). */
const WORKING = GAMES.filter((g) => g.status === 'available' && g.mock !== true);

const pricesOfGames = (list: readonly { priceUah: number; monthlyUah: number }[]): GamePrices[] =>
  list.map((g) => ({ launchUah: g.priceUah, monthlyUah: g.monthlyUah }));

/** Підсумок цін сайту зі збірки. */
export const SITE_PRICES: Readonly<Record<PriceKind, PriceSummary>> = {
  launch: summarize(pricesOfGames(WORKING), 'launch', PRICING),
  monthly: summarize(pricesOfGames(WORKING), 'monthly', PRICING),
};

/** id ігор платформи, що працюють: для живого підсумку цін у браузері. */
export const WORKING_PLATFORM_IDS: readonly string[] = WORKING.flatMap((g) => (g.platformId ? [g.platformId] : []));

const nf = new Intl.NumberFormat('uk-UA');
/** Число для тексту: групи через нерозривний пробіл (як textNumber у business.ts). */
export const priceNumber = (n: number): string => nf.format(n).replace(/\s/g, ' ');

/** «1 500» або «від 1 500» — для тексту про всі ігри. */
export const summaryText = (s: PriceSummary): string => `${s.same ? '' : 'від '}${priceNumber(s.min)}`;

export const sitePriceText = (kind: PriceKind): string => summaryText(SITE_PRICES[kind]);
