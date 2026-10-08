/**
 * Domain types for the Business Kit site.
 *
 * Information architecture:
 *   Category (напрям)  →  Project (готовий бот + план)  →  Project page
 *
 * Content lives in `src/data/`. Everything rendered on the site is described
 * here, so a typo in content becomes a compile error, not a broken page.
 */

import type { IconName } from '@/lib/icons';
import type { ArtName } from '@/lib/art';

/** Hex color literal, e.g. `#3b82f6`. */
export type HexColor = `#${string}`;

/* -------------------------------------------------------------------------- */
/*  Category                                                                   */
/* -------------------------------------------------------------------------- */

export interface Category {
  /** URL slug: `#/c/<id>`. Latin letters, digits and dashes. */
  readonly id: string;
  readonly name: string;
  /** One sentence: what kind of business is in this direction. */
  readonly description: string;
  readonly icon: IconName;
  readonly accent: HexColor;
  /** Built-in illustration shown on the card (see lib/art.ts). */
  readonly art: ArtName;
  /** Optional real image (path in /public, e.g. '/images/media.webp'). Overrides `art`. */
  readonly image?: string;
}

/* -------------------------------------------------------------------------- */
/*  Demo chat (phone mockup on the project page)                               */
/* -------------------------------------------------------------------------- */

export interface ChatMessage {
  readonly from: 'user' | 'bot' | 'system';
  readonly text: string;
  /** Inline keyboard button under a bot message (e.g. "Купити за 15 ⭐"). */
  readonly button?: string;
}

/** A real screenshot of the bot (file in /public). */
export interface Screenshot {
  readonly src: string;
  /** Short description for screen readers, e.g. "Оплата пакета в боті". */
  readonly alt: string;
}

/** What the buyer's customers pay inside the bot. */
export interface CustomerPrice {
  readonly label: string;
  readonly price: string;
}

/* -------------------------------------------------------------------------- */
/*  Unit economics (drives the calculator on the project page)                 */
/* -------------------------------------------------------------------------- */

/** Digital product monetized with Telegram Stars. */
export interface StarsEconomics {
  readonly kind: 'stars';
  /** Default share of visitors who pay at least once a month (0..1). */
  readonly payerRate: number;
  /** Average Stars spent by one paying user per month. */
  readonly arppuStars: number;
  /** Variable third-party cost per paying user per month, USD (AI APIs etc.). */
  readonly apiCostPerPayerUsd: number;
}

/** Physical-goods store: profit = orders × average order × margin. */
export interface OrdersEconomics {
  readonly kind: 'orders';
  readonly payerRate: number;
  readonly avgOrderUah: number;
  /** Seller's gross margin on goods (0..1). */
  readonly marginRate: number;
}

export type ProjectEconomics = StarsEconomics | OrdersEconomics;

/* -------------------------------------------------------------------------- */
/*  Project page building blocks                                               */
/* -------------------------------------------------------------------------- */

/** Inclusive numeric range, e.g. days to first client `[3, 7]`. */
export type Range = readonly [min: number, max: number];

/** A way to find clients for this project. */
export interface AcquisitionChannel {
  readonly icon: IconName;
  readonly title: string;
  readonly description: string;
  /** Does this channel cost money? Beginners start with `free`. */
  readonly cost: 'free' | 'paid';
}

/** One stage of the development plan that ships with the bot. */
export interface PlanPhase {
  /** "Тиждень 1", "Місяць 2"… */
  readonly period: string;
  readonly title: string;
  /** Short daily/weekly actions. Shown as a preview of the full plan. */
  readonly tasks: readonly string[];
}

/** A direction for growing beyond the basic plan. */
export interface GrowthDirection {
  readonly title: string;
  readonly description: string;
}

/* -------------------------------------------------------------------------- */
/*  Project                                                                    */
/* -------------------------------------------------------------------------- */

export type ProjectStatus = 'available' | 'soon';

export interface Project {
  /** URL slug: `#/p/<id>`. */
  readonly id: string;
  /** Must match a `Category.id`. */
  readonly categoryId: string;
  /** `soon` = visible in the list, but not clickable yet. */
  readonly status: ProjectStatus;

  readonly name: string;
  readonly icon: IconName;
  readonly accent: HexColor;
  /** One line under the name in lists. */
  readonly tagline: string;
  /** Who pays and for what, in plain words. */
  readonly howItEarns: string;

  /** One-time launch price, UAH. */
  readonly priceUah: number;
  /** Monthly hosting & support, UAH. */
  readonly monthlyUah: number;

  /** Estimated days to the first paying client when following the plan. */
  readonly firstClientDays: Range;
  /** Estimated minutes per day the owner spends working the plan. */
  readonly dailyMinutes: Range;
  /** Where customers typically come from (used in calculator copy). */
  readonly trafficSource: string;
  readonly economics: ProjectEconomics;

  readonly channels: readonly AcquisitionChannel[];
  readonly plan: readonly PlanPhase[];
  readonly directions: readonly GrowthDirection[];
  /** What the bot does / what we set up. */
  readonly includes: readonly string[];

  /** Short scripted chat shown in a phone mockup. Omit to hide the phone. */
  readonly demo?: readonly ChatMessage[];
  /** Built-in Mini App screen mockup instead of a chat (for games). */
  readonly screen?: 'crossword';
  /** Illustration for list thumbnails; defaults to the category's art. */
  readonly art?: ArtName;
  /** Optional real screenshot (path in /public). Overrides the phone mockup and the list thumbnail. */
  readonly image?: string;
  /** Extra real screenshots shown as a gallery on the project page. Empty → section hidden. */
  readonly screenshots?: readonly Screenshot[];
  /** Link to a live demo bot, e.g. 'https://t.me/your_bot'. Shows "Спробувати бота" buttons. */
  readonly botUrl?: string;
  /** Prices the end customers see inside the bot. */
  readonly customerPrices?: readonly CustomerPrice[];
}

/* -------------------------------------------------------------------------- */
/*  Site content                                                               */
/* -------------------------------------------------------------------------- */

export interface WorkflowStep {
  readonly title: string;
  readonly description: string;
  readonly icon: IconName;
}

export interface Offering {
  readonly title: string;
  readonly description: string;
  readonly icon: IconName;
}

export interface FaqItem {
  readonly question: string;
  readonly answer: string;
}

export interface MarketRates {
  /** USD a developer receives per 1 Telegram Star on withdrawal. */
  readonly starPayoutUsd: number;
  /** UAH per 1 USD. */
  readonly uahPerUsd: number;
}

/* -------------------------------------------------------------------------- */
/*  Calculator & routing                                                       */
/* -------------------------------------------------------------------------- */

export interface RevenueForecast {
  readonly payers: number;
  readonly grossStars: number | null;
  readonly grossUah: number;
  readonly costsUah: number;
  readonly netUah: number;
  readonly netYearUah: number;
  /** Days until the launch price is earned back; `null` if never. */
  readonly paybackDays: number | null;
}

/** Calculator inputs (local state of one calculator instance). */
export interface CalculatorState {
  readonly traffic: number;
  readonly payerRate: number;
}

/** Hash routes: `#/`, `#/c/<categoryId>`, `#/p/<projectId>`. */
export type Route =
  | { readonly name: 'home' }
  | { readonly name: 'category'; readonly id: string }
  | { readonly name: 'project'; readonly id: string };
