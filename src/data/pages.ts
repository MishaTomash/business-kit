/**
 * Тексти сторінок каталогу, гри, 404 і юридичних документів (етап S6).
 * Числа з site.ts. Джерела: попередні тексти сайту, позначка ЗМІСТ макета «ДНК» і рішення власника
 * з docs/DNA-PROGRESS.md. Тексти з позначкою ВИГАДАНО не використано. Без «для вашого каналу».
 */

import { DEPLOY_TIME, PRICING, STARS_COMMISSION } from './site';
import { textNumber } from './business';
import { formatDaysRange, formatMinutesRange } from '@/lib/format';

export const CATALOG = {
  title: 'Каталог ігор',
  lead: 'Кожна гра запускається під вашою назвою й кольорами.',
  allLabel: 'Усі',
  filterLabel: 'Жанр',
  play: 'Пограти',
  notify: 'Повідомити про запуск',
  /** Картка наприкінці каталогу. Рішення власника: так, побажання справді збираються. */
  wish: {
    title: 'Немає потрібної гри?',
    text: 'Напишіть, яку гру ви хотіли б запустити. Ми збираємо побажання для наступних ігор каталогу.',
    cta: 'Написати в Telegram',
  },
  meta: {
    /** Основний запит сторінки: «готові ігри для Telegram» (docs/SEO-PLAN.md). */
    title: 'Готові ігри для Telegram під ключ',
    ogTitle: 'Каталог ігор у Telegram під ключ',
    description: (live: number, soon: number): string =>
      `Готові ігри Telegram Mini App під ключ: працює ${live}, у розробці ${soon}. Кожна гра запускається під вашою назвою й кольорами, зірки йдуть на ваш бот.`,
  },
} as const;

export const GAME_PAGE = {
  crumbs: 'Каталог',
  play: 'Пограти',
  want: 'Хочу таку гру',
  /** «Запуск 1 500 ₴ · підтримка 99 ₴/міс · до 2 днів після оплати» */
  terms: `Запуск ${textNumber(PRICING.launchUah)} ₴ · підтримка ${textNumber(PRICING.monthlyUah)} ₴/міс · ${DEPLOY_TIME} після оплати`,
  prices: { title: 'Ціни для гравців' },
  calc: { title: 'Скільки може приносити гра' },
  includes: { title: 'Що входить' },
  plan: {
    title: 'План просування',
    lead: (days: readonly [number, number], minutes: readonly [number, number]): string =>
      `Орієнтир за планом: перший платник через ${formatDaysRange(days)}, ${formatMinutesRange(minutes)} на день на просування.`,
  },
  buy: {
    title: (name: string): string => `Запуск гри «${name}»`,
    rows: [
      { value: `${textNumber(PRICING.launchUah)} ₴`, text: 'один раз за запуск' },
      { value: `${textNumber(PRICING.monthlyUah)} ₴`, text: 'щомісяця: сервер, домен, оновлення й підтримка' },
      { value: `${STARS_COMMISSION}%`, text: 'наша частка зі зірок: усі зірки йдуть на баланс вашого бота' },
    ],
    note: `Гра запрацює ${DEPLOY_TIME} після оплати.`,
  },
  soon: {
    badge: 'у розробці',
    notify: 'Повідомити про запуск',
    /** Рішення власника (DNA-PROGRESS): без обіцянки автоматичних сповіщень. */
    notifyNote: 'Напишіть нам у Telegram: ми запишемо вас і повідомимо, коли гра буде готова',
    how: 'Як гра працюватиме',
    theme: 'Тема під вас',
    pay: 'За що гравці платитимуть',
  },
  meta: {
    liveTitle: (name: string, genre: string): string => `${name}: ${genre.toLowerCase()} у Telegram під ключ`,
    liveOg: (name: string): string => `${name} — гра в Telegram під вашою назвою`,
    liveDescription: (tagline: string): string =>
      `${tagline} Запуск під вашою назвою за ${textNumber(PRICING.launchUah)} ₴, підтримка ${textNumber(PRICING.monthlyUah)} ₴ на місяць, зірки повністю ваші.`,
    soonTitle: (name: string): string => `${name} (у розробці)`,
    soonOg: (name: string): string => `${name} — скоро в каталозі`,
    soonDescription: (tagline: string): string => `${tagline} Гра в розробці: напишіть нам, і ми повідомимо, коли вона буде готова.`,
  },
} as const;

export const NOT_FOUND = {
  eyebrow: 'Помилка 404',
  title: 'Такої сторінки немає',
  lead: 'Можливо, адреса змінилась або гру прибрали з каталогу. Усі ігри зібрані в одному місці.',
  home: 'На головну',
  catalog: 'Каталог ігор',
  meta: { description: 'Такої сторінки немає. Усі ігри зібрані в каталозі.' },
} as const;

export const LEGAL_PAGE = {
  eyebrow: 'Документи',
  toc: 'Зміст',
} as const;
