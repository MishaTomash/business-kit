/**
 * Налаштування сайту, не прив'язані до конкретної гри.
 * Назва бренду живе в brand.ts.
 */

import type { MarketRates } from '@/types';

import { DEFAULT_SITE_URL, contactUrl } from './brand';
import { CABINET_BOT } from './games';

export { BRAND, BRAND_EN, BRAND_OF, BRAND_LINE, DEFAULT_SITE_URL } from './brand';

/** Контакт власника для питань («Написати нам»). `.env` → VITE_TELEGRAM_URL, запасний — DEFAULT_CONTACT_URL. */
export const TELEGRAM_URL: string = contactUrl(import.meta.env.VITE_TELEGRAM_URL);

/** Бот Кабінету: там клієнт замовляє гру, оплачує, підключає бота й керує грою. Імʼя — з файлу платформи. */
export const CABINET_HANDLE = `@${CABINET_BOT}`;
export const CABINET_URL = `https://t.me/${CABINET_BOT}`;

/** Адреса сайту без «/» у кінці (для og:image і canonical). `.env` → VITE_SITE_URL. */
export const SITE_URL: string = (import.meta.env.VITE_SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, '');

/**
 * Ціни за замовчуванням (ті самі, що PRICE_LAUNCH_UAH і PRICE_MONTHLY_UAH платформи).
 * Кожна гра має свої priceUah / monthlyUah у games.generated.json (ціни з адмінки платформи);
 * ці числа діють, лише коли ігор, що працюють, немає. Підтверджено власником (етап 3).
 */
export const PRICING = {
  launchUah: 1500,
  monthlyUah: 99,
} as const;

/**
 * Частка зі зірок, яку беремо ми. Підтверджено власником: НЕ беремо.
 * Усі зірки йдуть на баланс бота клієнта, доступу до них у нас немає.
 */
export const STARS_COMMISSION = 0;

/**
 * Типовий строк від оплати до запущеної гри.
 * Рішення власника (етап S1): запускаємо якнайшвидше, найпізніше за 2 дні після оплати.
 */
export const DEPLOY_TIME = 'до 2 днів';

/**
 * Курси для калькулятора й «Шляху зірки».
 * - starPayoutUsd: Telegram платить розробникам ≈ $0.013 за зірку (виплата через Fragment).
 * - uahPerUsd: оновлюйте час від часу.
 */
export const RATES: MarketRates = {
  starPayoutUsd: 0.013,
  uahPerUsd: 41.5,
};

/** Правила Telegram для виведення зірок. */
export const STARS_RULES = {
  /** Скільки днів зароблені зірки чекають, перш ніж їх можна вивести. */
  holdDays: 21,
  /** Мінімальна сума виведення, зірок. */
  minWithdraw: 1000,
} as const;

/** Кількість гравців на місяць, з якої калькулятор стартує. */
export const PREVIEW_TRAFFIC = 500;
