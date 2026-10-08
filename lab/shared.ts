/**
 * Lab (Етап 2): спільні дані й розмітка для трьох напрямів дизайну.
 * Усі цифри беруться з src/data. Кольорові світи продуктів поки що задані тут
 * мапою; в обраному напрямі вони стануть необов'язковим полем проєкту.
 */

import type { ChatMessage, Project } from '@/types';
import { PROJECTS } from '@/data';
import { DEPLOY_TIME, TELEGRAM_URL } from '@/data/site';
import { formatDaysRange, formatMinutesRange, formatUah } from '@/lib/format';
import { html, raw, type SafeHtml } from '@/lib/dom';

export { DEPLOY_TIME, TELEGRAM_URL, formatDaysRange, formatMinutesRange, formatUah, html, raw };
export type { SafeHtml, Project };

/** Посилання на сторінки справжнього сайту (лаб лежить у /lab/). */
export const siteHref = {
  project: (id: string): string => `../#/p/${encodeURIComponent(id)}`,
  home: (): string => '../#/',
};

export const LIVE: readonly Project[] = PROJECTS.filter((p) => p.status === 'available');
export const SOON_PROJECTS: readonly Project[] = PROJECTS.filter((p) => p.status === 'soon');
export const WORKING = LIVE.filter((p) => p.botUrl);

/** Колірний світ продукту: тло панелі, текст, акцент, м'який відтінок. */
export interface World {
  readonly bg: string;
  readonly ink: string;
  readonly accent: string;
  readonly soft: string;
  /** Колір тексту на кнопці з тлом accent. */
  readonly onAccent: string;
}

const WORLDS: Readonly<Record<string, World>> = {
  'voice-to-text': { bg: '#0E3B3F', ink: '#E9FBF8', accent: '#3FE0C5', soft: '#145259', onAccent: '#06292B' },
  'social-downloader': { bg: '#1747C9', ink: '#FFFFFF', accent: '#FFFFFF', soft: '#2B5BE0', onAccent: '#1747C9' },
  slovovyr: { bg: '#FFF6E9', ink: '#17191D', accent: '#17191D', soft: '#F6E6CC', onAccent: '#FFF6E9' },
};

export const world = (p: Project): World =>
  WORLDS[p.id] ?? { bg: p.accent, ink: '#111318', accent: '#111318', soft: '#ffffff33', onAccent: '#ffffff' };

export const worldStyle = (p: Project): string => {
  const w = world(p);
  return `--w-bg:${w.bg};--w-ink:${w.ink};--w-accent:${w.accent};--w-soft:${w.soft};--w-on:${w.onAccent};--accent:${p.accent}`;
};

/** «Слововир: кросворд у Telegram» → «Слововир». */
export const shortName = (p: Project): string => p.name.split(':')[0]?.trim() ?? p.name;

/** Найнижча ціна в Stars для клієнта, напр. «від 1 ⭐». */
export function fromStars(p: Project): string | null {
  const stars = (p.customerPrices ?? [])
    .map((c) => /^(\d+)\s*⭐/.exec(c.price)?.[1])
    .filter((v): v is string => v !== undefined)
    .map(Number);
  return stars.length ? `від ${Math.min(...stars)} ⭐` : null;
}

/** Безкоштовна частина з customerPrices, напр. «5 хв щодня». */
export const freeTier = (p: Project): string | null =>
  p.customerPrices?.find((c) => c.label.toLowerCase().startsWith('безкоштов'))?.price ?? null;

export function pluralBots(n: number): string {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return 'бот';
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return 'боти';
  return 'ботів';
}

/** Діапазон хвилин на день по всіх живих ботах. */
export const dailyRange = (): string => {
  const mins = LIVE.map((p) => p.dailyMinutes[0]);
  const maxs = LIVE.map((p) => p.dailyMinutes[1]);
  return formatMinutesRange([Math.min(...mins), Math.max(...maxs)]);
};

export const minLaunchPrice = (): number => Math.min(...LIVE.map((p) => p.priceUah));

/** Факти для рядка довіри під кнопками hero. */
export const trustFacts = (): readonly string[] => [
  `${WORKING.length} ${pluralBots(WORKING.length)} уже ${WORKING.length === 1 ? 'працює' : 'працюють'} у Telegram`,
  `Запуск ${DEPLOY_TIME}`,
  'План на перший місяць у комплекті',
];

/* -------------------------------------------------------------------------- */
/*  Екрани телефонів (демо, створені кодом)                                    */
/* -------------------------------------------------------------------------- */

const msg = (m: ChatMessage, i: number): SafeHtml =>
  html`<div class="msg msg--${m.from}" style="--d:${i}">${m.text}${m.button && html`<span class="msg__btn">${m.button}</span>`}</div>`;

function chatScreen(p: Project, messages: readonly ChatMessage[]): SafeHtml {
  return html`<div class="scr scr--chat">
    <div class="scr__bar">
      <span class="scr__ava">${shortName(p).slice(0, 1)}</span>
      <span class="scr__title">${shortName(p)}<small>бот</small></span>
    </div>
    <div class="scr__chat">${messages.map(msg)}</div>
    <div class="scr__input"><span>Повідомлення</span></div>
  </div>`;
}

type Cell = readonly [col: number, row: number, letter: string, state: 'ok' | 'act' | 'cur' | 'typed' | 'empty'];
/** КАВУН / КЕФІР / ГРУША / НУТ: справжні слова, що перетинаються. */
const CELLS: readonly Cell[] = [
  [1, 1, 'К', 'ok'], [2, 1, 'А', 'ok'], [3, 1, 'В', 'ok'], [4, 1, 'У', 'ok'], [5, 1, 'Н', 'ok'],
  [1, 2, 'Е', 'ok'], [1, 3, 'Ф', 'ok'], [1, 4, 'І', 'ok'], [1, 5, 'Р', 'ok'],
  [0, 5, 'Г', 'typed'], [2, 5, 'У', 'typed'], [3, 5, '', 'empty'], [4, 5, '', 'empty'],
  [5, 2, 'У', 'act'], [5, 3, '', 'cur'],
];
const KEYS = ['ЙЦУКЕНГШЩЗХЇ', 'ФІВАПРОЛДЖЄ', 'ЯЧСМИТЬБЮ'] as const;

function crosswordScreen(p: Project): SafeHtml {
  return html`<div class="scr scr--game">
    <div class="cw__top"><span><b>${shortName(p)}</b><small>Рівень 12, розділ «Їжа»</small></span><span class="cw__hint">💡 3</span></div>
    <div class="cw__grid">
      ${CELLS.map(([c, r, l, s]) => html`<span class="cw__c cw__c--${s}" style="grid-column:${c + 1};grid-row:${r + 1}">${l}</span>`)}
    </div>
    <div class="cw__clue"><b>3 ↓</b> Зернобобові для хумусу (3)</div>
    <div class="cw__keys">${KEYS.map((row) => html`<div>${[...row].map((k) => html`<span>${k}</span>`)}</div>`)}</div>
  </div>`;
}

/** Екран продукту: справжній скріншот, якщо є, інакше демо кодом. */
export function screen(p: Project): SafeHtml {
  if (p.image) return html`<img class="scr scr--img" src="${p.image}" alt="Скріншот бота ${shortName(p)}" />`;
  if (p.screen === 'crossword') return crosswordScreen(p);
  if (p.demo) return chatScreen(p, p.demo);
  return html`<div class="scr scr--empty">${shortName(p)}</div>`;
}

/** Телефон з екраном. `label` = підпис «Демо», бо інтерфейс намальований кодом. */
export function phone(p: Project, extraClass = ''): SafeHtml {
  return html`<div class="ph ${extraClass}" style="${worldStyle(p)}">
    <div class="ph__screen" aria-hidden="true">${screen(p)}</div>
    ${!p.image && html`<span class="ph__demo">Демо</span>`}
  </div>`;
}

/* -------------------------------------------------------------------------- */
/*  Поведінка                                                                  */
/* -------------------------------------------------------------------------- */

export const reducedMotion = (): boolean => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Перемикач сцени hero: `[data-rot]` з дітьми `[data-rot-item]` і кнопками `[data-rot-tab]`.
 * Автоматично гортає кожні `ms`, зупиняється при наведенні/фокусі й без анімацій.
 */
export function rotator(root: HTMLElement, ms = 5200): void {
  const items = [...root.querySelectorAll<HTMLElement>('[data-rot-item]')];
  const tabs = [...root.querySelectorAll<HTMLButtonElement>('[data-rot-tab]')];
  if (!items.length) return;
  let index = 0;
  let paused = false;

  const show = (i: number): void => {
    index = (i + items.length) % items.length;
    items.forEach((el, k) => {
      el.classList.toggle('is-active', k === index);
      el.dataset['pos'] = String((k - index + items.length) % items.length);
    });
    tabs.forEach((t, k) => t.setAttribute('aria-pressed', String(k === index)));
  };
  show(0);
  root.classList.add('is-ready');

  tabs.forEach((t, k) => t.addEventListener('click', () => show(k)));
  root.addEventListener('pointerenter', () => (paused = true));
  root.addEventListener('pointerleave', () => (paused = false));
  root.addEventListener('focusin', () => (paused = true));
  root.addEventListener('focusout', () => (paused = false));

  if (reducedMotion()) return;
  window.setInterval(() => {
    if (!paused && !document.hidden) show(index + 1);
  }, ms);
}

/** Плавні появи: `[data-in]` отримує `.is-in`, коли з'являється в полі зору. */
export function reveal(): void {
  const els = [...document.querySelectorAll<HTMLElement>('[data-in]')];
  if (reducedMotion() || !('IntersectionObserver' in window)) {
    els.forEach((e) => e.classList.add('is-in'));
    return;
  }
  document.documentElement.classList.add('has-in');
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      }
    },
    { rootMargin: '0px 0px -10% 0px' },
  );
  els.forEach((e) => io.observe(e));
}

export function mount(markup: SafeHtml): HTMLElement {
  const app = document.getElementById('app');
  if (!app) throw new Error('#app missing');
  app.innerHTML = markup.value;
  return app;
}
