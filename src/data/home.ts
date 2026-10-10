/**
 * Тексти головної: заголовки секцій, вступи, підписи кнопок і факти hero.
 * Числа беруться з site.ts, нічого не вписано вручну. Списки (кроки, переваги, FAQ…) — у business.ts.
 *
 * Звідки тексти (етап S5): з попередніх даних сайту або з позначки ЗМІСТ макета «ДНК» (файл змісту
 * власника). Тексти з позначкою ВИГАДАНО не використано. Правило формулювань: без «для каналу» як умови.
 */

import { DEPLOY_TIME, PRICING, STARS_COMMISSION } from './site';
import { textNumber } from './business';
import { pluralGames } from '@/lib/format';

const works = (n: number): string => (pluralGames(n) === 'гра' ? 'працює' : 'працюють');

export interface HeroFact {
  /** Число або коротке значення: «1 500 ₴», «0%», «до 2 днів». */
  readonly value: string;
  readonly label: string;
  /** Підсвітити коралом (наша частка 0 %). */
  readonly accent?: boolean;
}

export const HOME = {
  hero: {
    title: 'Гра у вашому Telegram. Зірки — на вашому рахунку.',
    lead: `Обираєте гру з каталогу, ми запускаємо її під вашою назвою й кольорами. Гравці платять зірками Telegram, зірки йдуть на баланс вашого бота. Наша частка: ${STARS_COMMISSION}%.`,
    primary: 'Обрати гру',
    secondary: 'Написати в Telegram',
    facts: [
      { value: `${textNumber(PRICING.launchUah)} ₴`, label: 'запуск, разово' },
      { value: `${textNumber(PRICING.monthlyUah)} ₴`, label: 'підтримка на місяць' },
      { value: `${STARS_COMMISSION}%`, label: 'наша частка зірок', accent: true },
      { value: DEPLOY_TIME, label: 'до запуску' },
    ] satisfies readonly HeroFact[],
  },
  path: {
    eyebrow: 'Шлях зірки',
    title: 'Шлях однієї зірки від гравця до вашої картки',
    disclaimer: 'Прогноз на сайті — модель, а не гарантія доходу. Точна сума залежить від курсу в день виведення.',
  },
  reasons: { title: 'Чому це вигідно' },
  offer: {
    title: 'Що ми надаємо',
    launchTitle: 'Запуск гри',
    launchNote: `Запуск ${DEPLOY_TIME} після оплати.`,
    monthlyTitle: 'Підтримка',
    perMonth: '/ міс',
    shareLabel: 'Наша частка зі зірок',
  },
  audience: { title: 'Для кого' },
  launch: { title: 'Як проходить запуск', lead: `Від першого повідомлення до робочої гри — ${DEPLOY_TIME}.` },
  catalog: {
    title: 'Каталог ігор',
    cta: 'Переглянути ігри',
    /** Рядок із посиланнями на ігри, що працюють: «Уже працює: Слововир». */
    liveLabel: 'Уже працює:',
    /** «Зараз працює 1 гра, ще 4 у розробці». */
    status: (live: number, soon: number): string =>
      live > 0
        ? `Зараз ${works(live)} ${live} ${pluralGames(live)}${soon > 0 ? `, ще ${soon} у розробці` : ''}`
        : `Усі ${soon} ${pluralGames(soon)} поки в розробці`,
  },
  faq: { title: 'Часті питання' },
  final: {
    title: 'Обговоримо вашу гру',
    text: 'Напишіть нам у Telegram: оберемо гру, назву, кольори й тему.',
    cta: 'Написати в Telegram',
  },
  meta: {
    /** <title> до 60 символів: основний запит «гра в Telegram під ключ» і Telegram Stars (docs/SEO-PLAN.md). */
    title: 'Клітинка — ігри в Telegram під ключ, оплата Telegram Stars',
    ogTitle: 'Гра у вашому Telegram, зірки на вашому рахунку',
    /** До 160 символів. */
    description: `Готова гра Telegram Mini App під вашою назвою: гравці платять Telegram Stars, зірки йдуть на баланс вашого бота. Запуск ${textNumber(PRICING.launchUah)}\u00A0₴, ${textNumber(PRICING.monthlyUah)}\u00A0₴/міс, ${STARS_COMMISSION}% зі зірок.`,
  },
} as const;
