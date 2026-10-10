/**
 * Довідкові статті: /guides/<id>. Текст — content/guides/<id>.md (той самий Markdown, що й юридичні тексти,
 * конвертер src/lib/markdown.ts). Розділи з номером («## 1. …») потрапляють у зміст сторінки.
 *
 * Числа в тексті не вписуються вручну, а підставляються з site.ts через мітки:
 *   {{HOLD_DAYS}}, {{MIN_WITHDRAW}}, {{STAR_USD}}, {{UAH_PER_USD}}, {{N1}}…{{N3}}, {{USD1}}…, {{UAH1}}…
 * Змінились правила Telegram чи курс — змініть site.ts, і стаття оновиться разом із калькулятором.
 *
 * Нова стаття: файл у content/guides, запис у GUIDES, дата `updated` при кожній змістовній зміні.
 */

import starsSrc from '../../content/guides/telegram-stars.md?raw';
import { RATES, SITE_URL, STARS_RULES } from './site';
import { markdownToHtml, type MarkdownResult } from '@/lib/markdown';

export interface GuideMeta {
  readonly id: string;
  /** <title> до 60 символів під основний запит статті. */
  readonly title: string;
  /** meta description до 160 символів. */
  readonly description: string;
  /** Підпис для посилань на статтю (футер, FAQ). */
  readonly linkLabel: string;
  /** Дата першої публікації й останньої змістовної зміни, РРРР-ММ-ДД. */
  readonly published: string;
  readonly updated: string;
}

export interface Guide extends GuideMeta {
  /** Заголовок статті (перший «# …» у Markdown). Може бути довшим за <title>. */
  readonly h1: string;
  readonly body: string;
  readonly sections: MarkdownResult['sections'];
}

const nf = new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 3 });
const num = (n: number): string => nf.format(n).replace(/\s/g, ' ');
/** Гривні округлено до 10 ₴: точна сума однаково залежить від курсу в день виведення. */
const uah = (stars: number): string => num(Math.round((stars * RATES.starPayoutUsd * RATES.uahPerUsd) / 10) * 10);
const usd = (stars: number): string => num(Math.round(stars * RATES.starPayoutUsd * 100) / 100);

const EXAMPLES = [STARS_RULES.minWithdraw, STARS_RULES.minWithdraw * 5, STARS_RULES.minWithdraw * 10] as const;

const MARKS: Readonly<Record<string, string>> = {
  HOLD_DAYS: String(STARS_RULES.holdDays),
  MIN_WITHDRAW: num(STARS_RULES.minWithdraw),
  STAR_USD: num(RATES.starPayoutUsd),
  UAH_PER_USD: num(RATES.uahPerUsd),
  ...Object.fromEntries(EXAMPLES.flatMap((n, i) => [[`N${i + 1}`, num(n)], [`USD${i + 1}`, usd(n)], [`UAH${i + 1}`, uah(n)]])),
};

function fill(src: string): string {
  return src.replace(/\{\{([A-Z0-9_]+)\}\}/g, (m, key: string) => {
    const v = MARKS[key];
    if (v === undefined) throw new Error(`Стаття: невідома мітка ${m}`);
    return v;
  });
}

const SOURCES: readonly (GuideMeta & { readonly src: string })[] = [
  {
    id: 'telegram-stars',
    src: starsSrc,
    title: 'Як вивести Telegram Stars на картку: інструкція для бота',
    description: `Коли зірки з бота доступні для виведення, мінімум ${num(STARS_RULES.minWithdraw)} зірок, курс ${num(RATES.starPayoutUsd)} $ за зірку, Fragment і TON, що підготувати й типові помилки.`,
    linkLabel: 'Як вивести Telegram Stars',
    published: '2026-10-10',
    updated: '2026-10-10',
  },
];

export const GUIDE_IDS: readonly string[] = SOURCES.map((s) => s.id);

const cache = new Map<string, Guide>();

export function getGuide(id: string): Guide | undefined {
  const hit = cache.get(id);
  if (hit) return hit;
  const s = SOURCES.find((g) => g.id === id);
  if (!s) return undefined;
  const { src, ...meta } = s;
  const md = markdownToHtml(fill(src), { siteUrl: SITE_URL });
  const guide: Guide = { ...meta, h1: md.title, body: md.body, sections: md.sections };
  cache.set(id, guide);
  return guide;
}

/** Метадані без розбору Markdown: для посилань у футері й FAQ. */
export const guideMeta = (id: string): GuideMeta | undefined => SOURCES.find((g) => g.id === id);
