/**
 * Налаштування сайту, не прив'язані до конкретної гри.
 * Назва бренду живе в brand.ts.
 */

import type { MarketRates } from '@/types';

import { DEFAULT_SITE_URL } from './brand';

export { BRAND, BRAND_OF, BRAND_LINE, DEFAULT_SITE_URL } from './brand';

/** Контакт для продажів. Налаштовується в `.env` → VITE_TELEGRAM_URL. */
export const TELEGRAM_URL: string = import.meta.env.VITE_TELEGRAM_URL || 'https://t.me/your_username';

/** Адреса сайту без «/» у кінці (для og:image і canonical). `.env` → VITE_SITE_URL. */
export const SITE_URL: string = (import.meta.env.VITE_SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, '');

/**
 * Ціни, однакові для всіх ігор. Гра може мати власні priceUah / monthlyUah у games.ts.
 * Підтверджено власником (етап 3): 1 500 ₴ разово за запуск, 99 ₴ на місяць за підтримку.
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
