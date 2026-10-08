/**
 * Дані прототипу. Усі цифри беруться з src/data (RATES, ціни Слововира),
 * нічого не вписано вручну. На етапі 3 це переїде в src/data/business.ts і games.ts.
 */
import { RATES, TELEGRAM_URL } from '@/data/site';
import { PROJECTS } from '@/data/projects';
import type { Project } from '@/types';

/** Токени фігури на плитках: '★' — плитка-зірка, ' ' — проміжок, решта — літера чи цифра. */
export interface Station {
  /** Підпис станції на лінії. */
  readonly label: string;
  /** Що складається з плиток у великому факті. */
  readonly figure: string;
  /** Маленький префікс перед плитками, напр. «≈». */
  readonly prefix?: string;
  /** Одне речення з фактом. */
  readonly text: string;
}

const nf = new Intl.NumberFormat('uk-UA');
/** «1 000» з вузьким нерозривним пробілом → звичайний пробіл для плиток. */
const tilesNumber = (n: number): string => nf.format(n).replace(/\s/g, ' ');
const usd = (n: number): string => `$${String(n).replace('.', ',')}`;

const MIN_WITHDRAW = 1000; // правило Telegram (FAQ у src/data/site.ts)
const HOLD_DAYS = 21; // правило Telegram (FAQ у src/data/site.ts)
const withdrawUah = Math.round((MIN_WITHDRAW * RATES.starPayoutUsd * RATES.uahPerUsd) / 10) * 10;

export const STAR_PATH: readonly Station[] = [
  { label: 'Гравець грає', figure: '0★', text: 'Гравець відкриває гру й грає безкоштовно, без реєстрації й оплати на вході.' },
  { label: 'Застрягає', figure: '?', text: 'Слово не відгадується, а пройти рівень і не перервати серію днів хочеться.' },
  { label: 'Купує підказку', figure: '1★', text: 'Підказка коштує 1 зірку. Оплата в два дотики всередині Telegram, без картки й форм.' },
  { label: 'Зірка на балансі', figure: '+1★', text: 'Зірка надходить на баланс вашої гри. Бот і баланс належать вам.' },
  { label: `${HOLD_DAYS} день`, figure: String(HOLD_DAYS), text: `Стільки днів Telegram тримає зароблені зірки, перш ніж їх можна вивести.` },
  {
    label: 'Fragment',
    figure: `${tilesNumber(MIN_WITHDRAW)}★`,
    text: `Виведення через Fragment, мінімум ${tilesNumber(MIN_WITHDRAW)} зірок. Telegram платить приблизно ${usd(RATES.starPayoutUsd)} за зірку.`,
  },
  {
    label: 'Гривні на картці',
    figure: `${tilesNumber(withdrawUah)}₴`,
    prefix: '≈',
    text: `${tilesNumber(MIN_WITHDRAW)} зірок — це приблизно ${tilesNumber(withdrawUah)} ₴ за курсом ${String(RATES.uahPerUsd).replace('.', ',')} ₴ за долар. Точна сума залежить від курсу в день виведення.`,
  },
];

const slovovyr = PROJECTS.find((p) => p.id === 'slovovyr');
if (!slovovyr) throw new Error('Немає гри slovovyr у src/data/projects.ts');

export interface EarnRow {
  readonly figure: string;
  readonly text: string;
}

export const EARN: readonly EarnRow[] = [
  { figure: `${tilesNumber(slovovyr.priceUah)}₴`, text: 'один раз за запуск: гра під вашою назвою й кольорами, бот, адмін-панель і план просування.' },
  { figure: `${tilesNumber(slovovyr.monthlyUah)}₴`, text: 'щомісяця: сервер, домен, оновлення й підтримка. Сума не залежить від кількості гравців.' },
];

/* ---------------------------------------------------------------- каталог */

export interface LabGame {
  readonly id: string;
  readonly name: string;
  readonly genre: string;
  readonly line: string;
  readonly status: 'available' | 'soon';
  readonly mock?: true;
  /** Слово з плиток на обкладинці. */
  readonly word: string;
  readonly bg: string;
  readonly ink: string;
  readonly tile: string;
  readonly tileInk: string;
  readonly botUrl?: string;
  readonly prices?: Project['customerPrices'];
}

export const GAMES: readonly LabGame[] = [
  {
    id: slovovyr.id,
    name: slovovyr.shortName ?? slovovyr.name,
    genre: 'Кросворд',
    line: slovovyr.tagline,
    status: 'available',
    word: 'СЛОВО',
    bg: '#0d2a1c',
    ink: '#e6f5ea',
    tile: '#ffb81c',
    tileInk: '#0d2a1c',
    ...(slovovyr.botUrl ? { botUrl: slovovyr.botUrl } : {}),
    ...(slovovyr.customerPrices ? { prices: slovovyr.customerPrices } : {}),
  },
  // MOCK: замінити, коли гра запрацює
  {
    id: 'slovo-dnia',
    name: 'Слово дня',
    genre: 'Вгадай слово',
    line: 'Вгадай слово з 5 літер за 6 спроб. Одне нове слово щодня для всіх гравців.',
    status: 'soon',
    mock: true,
    word: 'ДЕНЬ',
    bg: '#1f7a47',
    ink: '#ffffff',
    tile: '#ffffff',
    tileInk: '#0d2a1c',
  },
  // MOCK: замінити, коли гра запрацює
  {
    id: 'anahramy',
    name: 'Анаграми',
    genre: 'Слова з літер',
    line: 'Склади якомога більше слів з одного набору літер, поки не скінчився час.',
    status: 'soon',
    mock: true,
    word: 'ЛІТЕРИ',
    bg: '#ffffff',
    ink: '#0d2a1c',
    tile: '#d5eedc',
    tileInk: '#0d2a1c',
  },
];

export { TELEGRAM_URL };
