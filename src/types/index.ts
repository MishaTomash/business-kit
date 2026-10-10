/**
 * Типи сайту «Клітинка»: ігри в Telegram (Mini App) під ключ.
 *
 *   Головна (про бізнес)  →  Каталог ігор /games  →  Сторінка гри /games/<id>
 *
 * Весь вміст лежить у src/data/. Помилка в даних стає помилкою компіляції, а не зламаною сторінкою.
 */

import type { GenreId } from '@/lib/fingerprint';

export type { GenreId };

/** Hex-колір, напр. `#0d2a1c`. */
export type HexColor = `#${string}`;


/** Дані для генетичного відбитка гри (DESIGN-SPEC, розділ 5). */
export interface GameDna {
  /** Жанр зі спеки: slova, viktoryny, holovolomky, pamiat, druzi. Задає колір жанру й фільтр каталогу. */
  readonly genre: GenreId;
  /**
   * Колір гри `#rrggbb` (зазвичай колір бренду клієнта). Разом із назвою й жанром дає відбиток.
   * Якщо він темніший за 3 : 1 до темного тла, у візерунку його замінить колір жанру.
   */
  readonly color: HexColor;
}

/* -------------------------------------------------------------------------- */
/*  Гра                                                                        */
/* -------------------------------------------------------------------------- */

/** `available` — можна грати й купити; `soon` — у розробці. */
export type GameStatus = 'available' | 'soon';

/** Справжній скріншот гри (файл у /public). */
export interface Screenshot {
  readonly src: string;
  /** Короткий опис для читачів екрана. */
  readonly alt: string;
}

/** Що платять гравці всередині гри. */
export interface CustomerPrice {
  readonly label: string;
  /** Напр. '10 ★' або '3 підказки безкоштовно'. Символ ★ можна писати як ⭐ — сайт замінить. */
  readonly price: string;
}

/** Модель доходу від зірок (для калькулятора, src/lib/economics.ts). */
export interface StarsEconomics {
  readonly kind: 'stars';
  /** Частка гравців, які платять хоча б раз на місяць (0..1). */
  readonly payerRate: number;
  /** Скільки зірок у середньому витрачає один платник за місяць. */
  readonly arppuStars: number;
  /** Змінні витрати на одного платника за місяць, USD (сторонні API тощо). */
  readonly apiCostPerPayerUsd: number;
}

/** Модель для фізичних товарів. Для ігор не використовується, лишена для сумісності калькулятора. */
export interface OrdersEconomics {
  readonly kind: 'orders';
  readonly payerRate: number;
  readonly avgOrderUah: number;
  readonly marginRate: number;
}

export type GameEconomics = StarsEconomics | OrdersEconomics;

/** Діапазон, напр. дні до першого платника `[5, 14]`. */
export type Range = readonly [min: number, max: number];

/** Канал просування гри. */
export interface PromoChannel {
  readonly title: string;
  readonly description: string;
  /** Чи коштує канал грошей. Починати варто з `free`. */
  readonly cost: 'free' | 'paid';
}

/** Етап плану просування. */
export interface PlanPhase {
  /** «Тиждень 1», «Місяць 2+»… */
  readonly period: string;
  readonly title: string;
  readonly tasks: readonly string[];
}

/**
 * Колірний світ гри: обкладинка в каталозі й hero сторінки гри.
 * Перевіряйте контраст `ink` на `bg` (≥ 4,5 : 1).
 */
export interface GameTheme {
  /** Тло обкладинки й hero. */
  readonly bg: HexColor;
  /** Колір тексту на тлі. */
  readonly ink: HexColor;
  /** Колір плиток на обкладинці. */
  readonly tile: HexColor;
  /** Колір літер на плитках. */
  readonly tileInk: HexColor;
}

export interface Game {
  /** Адреса сторінки: /games/<id>. Латиниця, цифри й дефіс. */
  readonly id: string;
  readonly status: GameStatus;
  /** Заглушка: гра ще не існує. Завжди поводиться як `soon`, навіть якщо status помилково 'available'. */
  readonly mock?: true;

  readonly name: string;
  /**
   * <title> сторінки гри для пошуку (до 60 символів), якщо загальний шаблон «Назва: жанр у Telegram під ключ — Клітинка»
   * не містить того, що люди шукають. Лише для ігор, що працюють. Приклад: «Слововир — кросворди українською в Telegram під ключ».
   */
  readonly searchTitle?: string;
  /** Жанр одним-двома словами: «Кросворд», «Вгадай слово». Фільтр у каталозі будується з цього поля. */
  readonly genre: string;
  /** Генетичний відбиток: жанр зі спеки й колір гри. Відбиток рахується з назви, жанру й кольору, у файлах не зберігається. */
  readonly dna: GameDna;
  /** Один рядок суті для картки в каталозі. */
  readonly tagline: string;
  /** Хто платить і за що, 2–3 речення. */
  readonly howItEarns: string;
  /** Механіки гри, по одній на рядок. */
  readonly mechanics: readonly string[];

  readonly theme: GameTheme;
  /** Слово з плиток на обкладинці (до 7 літер), напр. 'СЛОВО'. */
  readonly coverWord: string;
  /** Справжня обкладинка (файл у /public). Замінює обкладинку з плиток. */
  readonly cover?: string;
  /** Картинка прев'ю посилання 1200×630 PNG у /public/og/. Без неї береться /og/<id>.png або загальна. */
  readonly ogImage?: string;

  /** Разова ціна запуску, ₴. */
  readonly priceUah: number;
  /** Щомісячна плата за сервер, домен, оновлення й підтримку, ₴. */
  readonly monthlyUah: number;

  /** Ціни для гравців. */
  readonly customerPrices: readonly CustomerPrice[];
  /** Орієнтир: днів до першого платника за планом. */
  readonly firstClientDays: Range;
  /** Орієнтир: хвилин на день на просування. */
  readonly dailyMinutes: Range;
  /** Звідки зазвичай приходять гравці (для калькулятора). */
  readonly trafficSource: string;
  readonly economics: GameEconomics;

  readonly includes: readonly string[];
  readonly channels: readonly PromoChannel[];
  readonly plan: readonly PlanPhase[];

  /** Посилання на гру в Telegram. Дає кнопку «Пограти». */
  readonly botUrl?: string;
  /** Справжні скріншоти. Порожньо → галерея прихована. */
  readonly screenshots?: readonly Screenshot[];
  /** Маленька робоча демо-гра на сторінці гри: 3–4 слова з питаннями. */
  readonly demo?: readonly DemoWord[];
}

/** Слово демо-кросворду. */
export interface DemoWord {
  readonly clue: string;
  /** Відповідь великими літерами, без пробілів. */
  readonly answer: string;
}

/**
 * Сумісність із src/lib/economics.ts: калькулятор рахує «проєкт», тобто гру.
 * Логіку економіки не змінюємо, тому лишаємо стару назву типу.
 */
export type Project = Game;

/* -------------------------------------------------------------------------- */
/*  Головна: бізнес                                                            */
/* -------------------------------------------------------------------------- */

/** Станція сцени «Шлях зірки». */
export interface StarStep {
  readonly label: string;
  /** Фігура з плиток: '★' — плитка-зірка, ' ' — вузька проставка, '₴' — плитка гривні. */
  readonly figure: string;
  readonly prefix?: string;
  readonly text: string;
}

/** Причина «Чому це вигідно». */
export interface Reason {
  readonly figure: string;
  readonly title: string;
  readonly text: string;
}

/** Що ми надаємо. */
export interface Offering {
  /** Коротке слово з плиток (до 6 літер), напр. 'ПЛАН'. */
  readonly word: string;
  readonly title: string;
  readonly text: string;
}

/** Для кого: одна конкретна ситуація. */
export interface Audience {
  readonly title: string;
  readonly situation: string;
  /** Чесне застереження жирним (виділена картка). */
  readonly note?: string;
}

/** Етап запуску. */
export interface LaunchStep {
  readonly when: string;
  readonly title: string;
  readonly text: string;
}

export interface FaqItem {
  readonly question: string;
  /** `null` — відповідь чекає підтвердження власника, питання не показується. */
  readonly answer: string | null;
  /** Посилання після відповіді, напр. на довідкову статтю. */
  readonly link?: { readonly href: string; readonly label: string };
}

export interface MarketRates {
  /** USD, які розробник отримує за 1 зірку при виведенні. */
  readonly starPayoutUsd: number;
  /** Гривень за 1 USD. */
  readonly uahPerUsd: number;
}

/* -------------------------------------------------------------------------- */
/*  Калькулятор і маршрути                                                     */
/* -------------------------------------------------------------------------- */

export interface RevenueForecast {
  readonly payers: number;
  readonly grossStars: number | null;
  readonly grossUah: number;
  readonly costsUah: number;
  readonly netUah: number;
  readonly netYearUah: number;
  /** Днів до окупності запуску; `null`, якщо не окупається. */
  readonly paybackDays: number | null;
}

export interface CalculatorState {
  readonly traffic: number;
  readonly payerRate: number;
}

/** Маршрути: /, /games, /games/<id>, /offer, /privacy, усе інше — 404. */
export type Route =
  | { readonly name: 'home' }
  | { readonly name: 'games' }
  | { readonly name: 'game'; readonly id: string }
  | { readonly name: 'legal'; readonly id: 'offer' | 'privacy' }
  | { readonly name: 'guide'; readonly id: string }
  | { readonly name: 'notFound' };
