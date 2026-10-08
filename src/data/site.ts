/**
 * Site-wide configuration and copy (not tied to a single project).
 * Business facts live here so they can be edited without touching UI code.
 */

import type { FaqItem, MarketRates, Offering, WorkflowStep } from '@/types';

/** Sales contact. Configured via `.env` → VITE_TELEGRAM_URL. */
export const TELEGRAM_URL: string = import.meta.env.VITE_TELEGRAM_URL || 'https://t.me/your_username';

/**
 * Typical time from payment to a live bot.
 * ⚠️ Set this to your *real* turnaround: it is shown as a promise.
 */
export const DEPLOY_TIME = 'до 5 днів';

/**
 * Calculator assumptions.
 * - starPayoutUsd: Telegram's developer terms quote ≈ $0.013 per Star
 *   (paid out in TON via Fragment; the USD value floats with TON).
 * - uahPerUsd: update periodically.
 */
export const RATES: MarketRates = {
  starPayoutUsd: 0.013,
  uahPerUsd: 41.5,
};

/** Default audience used for previews in lists ("з 500 людей на місяць"). */
export const PREVIEW_TRAFFIC = 500;

/** What every purchase includes. The core offer, shown on the home page. */
export const OFFERINGS: readonly Offering[] = [
  {
    icon: 'box',
    title: 'Готовий бот',
    description: 'Запускаємо під вашою назвою, з оплатою й адмін-панеллю. Жодного коду з вашого боку.',
  },
  {
    icon: 'map',
    title: 'План розвитку',
    description: 'Покрокова інструкція: що робити кожного дня, де шукати клієнтів і як рости далі.',
  },
  {
    icon: 'shield',
    title: 'Підтримка',
    description: 'Сервер, оновлення й відповіді на питання. Технічні проблеми вирішуємо ми.',
  },
];

/** Three steps from purchase to income. */
export const WORKFLOW: readonly WorkflowStep[] = [
  {
    icon: 'key',
    title: 'Обираєте проєкт',
    description: 'Дивитеся напрями, порівнюєте проєкти й обираєте той, що вам ближчий.',
  },
  {
    icon: 'rocket',
    title: 'Ми запускаємо бота й даємо план',
    description: `Налаштовуємо все ${DEPLOY_TIME} і передаємо покрокову інструкцію, як заробляти.`,
  },
  {
    icon: 'trend',
    title: 'Ви працюєте за планом',
    description: 'Трохи часу щодня за готовими кроками. Оплати надходять на баланс вашого бота.',
  },
];

export const FAQ: readonly FaqItem[] = [
  {
    question: 'У мене немає досвіду. Я впораюся?',
    answer:
      'Так, сервіс розрахований саме на новачків. Технічну частину робимо ми, а план розписаний по днях: що зняти, де опублікувати, що відповісти клієнту.',
  },
  {
    question: 'Що саме в плані розвитку?',
    answer:
      'Покрокові завдання на перші тижні, готові сценарії й тексти, список місць, де шукати клієнтів, і напрями для росту, коли бот почне заробляти. Ви отримуєте план разом із ботом.',
  },
  {
    question: 'Скільки часу потрібно щодня?',
    answer:
      'Залежить від проєкту, орієнтир вказаний на сторінці кожного. Зазвичай це від 30 хвилин до години на день. Головне регулярність, а не кількість годин.',
  },
  {
    question: 'Кому належать бот і гроші?',
    answer:
      'Вам. Бот створюється на вашому акаунті, а оплати в Telegram Stars надходять на баланс вашого бота. Ви платите лише за запуск і щомісячно за сервер і підтримку.',
  },
  {
    question: 'Як вивести зароблені Stars?',
    answer:
      'Через офіційну платформу Telegram, Fragment, у криптовалюті TON, яку можна обміняти на гривні. За правилами Telegram зароблені Stars доступні для виведення через 21 день, мінімум 1 000 Stars. У плані є покрокова інструкція.',
  },
  {
    question: 'Ви гарантуєте дохід?',
    answer:
      'Ні, і будьте обережні з тими, хто гарантує. Ми гарантуємо робочого бота й зрозумілий план. Результат залежить від того, наскільки регулярно ви за ним працюєте.',
  },
];
