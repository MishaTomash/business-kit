/**
 * Site-wide configuration and copy (not tied to a single project).
 * Business facts live here so they can be edited without touching UI code.
 */

import type { FaqItem, JourneyStep, MarketRates, Offering, ProofStat, Requirement, WorkflowStep } from '@/types';
import { formatDaysRange, formatMinutesRange } from '@/lib/format';
import { PROJECTS } from './projects';

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

/* -------------------------------------------------------------------------- */
/*  Головна: «Шлях за 30 днів», «Що потрібно від вас», статистика               */
/* -------------------------------------------------------------------------- */

const live = PROJECTS.filter((p) => p.status === 'available');
const span = (pick: (p: (typeof live)[number]) => readonly [number, number]): readonly [number, number] => [
  Math.min(...live.map((p) => pick(p)[0])),
  Math.max(...live.map((p) => pick(p)[1])),
];
/** Діапазони по всіх доступних ботах (оновлюються самі, коли додаєте бота). */
const FIRST_CLIENT = live.length ? formatDaysRange(span((p) => p.firstClientDays)) : '';
export const DAILY_TIME = live.length ? formatMinutesRange(span((p) => p.dailyMinutes)) : '';

/** Часова шкала на головній. Терміни беруться з плану й правил Telegram. */
export const JOURNEY: readonly JourneyStep[] = [
  { when: 'День 0', title: 'Обираєте бота', text: 'Пишете нам у Telegram, домовляємося про назву, аватар і оплату.' },
  {
    when: DEPLOY_TIME,
    title: 'Бот запущено',
    text: 'Бот працює на вашому акаунті під вашою назвою. Ви отримуєте план і доступ до адмін-команд.',
  },
  {
    when: 'Тиждень 1',
    title: 'Перші користувачі',
    text: 'Оформлюєте профіль, знімаєте перші 5 відео за готовими сценаріями й розповідаєте про бота в чатах.',
  },
  ...(FIRST_CLIENT
    ? [{ when: `≈ ${FIRST_CLIENT}`, title: 'Перший клієнт', text: 'Орієнтир за планом. Оплата в Stars надходить на баланс вашого бота.' }]
    : []),
  {
    when: 'Тижні 2–4',
    title: 'Щоденна звичка',
    text: 'Одне відео на день за календарем. Дивитеся в статистиці, що приводить покупців, і повторюєте те, що спрацювало.',
  },
  {
    when: 'Від 21 дня',
    title: 'Перший вивід Stars',
    text: 'За правилами Telegram зароблені Stars можна вивести через 21 день, від 1 000 ⭐. Покрокова інструкція є в плані.',
  },
];

/** Чесний блок «Що потрібно від вас». */
export const REQUIREMENTS: readonly Requirement[] = [
  {
    value: DAILY_TIME ? `${DAILY_TIME} на день` : 'Трохи часу щодня',
    text: 'На відео й відповіді людям. Точний орієнтир для кожного бота є на його сторінці.',
  },
  { value: 'Телефон', text: 'Знімати, викладати й дивитися статистику бота можна з телефона. Комп\u2019ютер не потрібен.' },
  { value: 'Регулярність', text: 'План працює, коли робите потроху щодня. Тиждень пропусків, і результат відкладається.' },
];

/**
 * Реальна статистика ботів для блоку довіри на головній.
 * Поки масив порожній, блок не показується. Пишіть лише справжні цифри
 * з адмін-панелі, з періодом: { value: '1 240', label: 'людей скористалися ботом у вересні' }.
 */
export const PROOF: readonly ProofStat[] = [];
