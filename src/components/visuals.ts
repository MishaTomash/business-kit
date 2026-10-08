/**
 * Visual building blocks: illustrations, phone mockups, the hero scene and
 * the small "what you get" visuals.
 *
 * Everything here is HTML/SVG drawn in code: crisp on any screen, tinted by
 * `--accent`, and with no image requests. All mockups are decorative
 * (`aria-hidden`), because the surrounding text already says the same thing.
 */

import type { ChatMessage } from '@/types';
import { art, type ArtName } from '@/lib/art';
import { html, type SafeHtml } from '@/lib/dom';
import { icon } from '@/lib/icons';

/* -------------------------------------------------------------------------- */
/*  Illustration or real image                                                 */
/* -------------------------------------------------------------------------- */

/** Real image if provided, otherwise the built-in illustration. */
export function picture(artName: ArtName, image?: string): SafeHtml {
  return image
    ? html`<img class="picture__img" src="${image}" alt="" loading="lazy" decoding="async" />`
    : art(artName);
}

/* -------------------------------------------------------------------------- */
/*  Phone with a Telegram-like chat                                            */
/* -------------------------------------------------------------------------- */

// Single line on purpose: bubbles use `white-space: pre-line` so that "\n" in
// demo texts becomes a line break; template indentation must not leak in.
const bubble = (m: ChatMessage, index: number): SafeHtml =>
  html`<div class="chat__msg chat__msg--${m.from}" style="--d: ${index}">${m.text}${m.button && html`<span class="chat__button">${m.button}</span>`}</div>`;

export function phone(messages: readonly ChatMessage[], title = 'Ваш бот', avatarIcon: Parameters<typeof icon>[0] = 'send'): SafeHtml {
  return html`
    <div class="phone" aria-hidden="true">
      <div class="phone__notch"></div>
      <div class="phone__bar">
        <span class="phone__avatar">${icon(avatarIcon, 15)}</span>
        <span class="phone__title">${title}<small>бот</small></span>
      </div>
      <div class="chat">${messages.map(bubble)}</div>
      <div class="phone__input"><span></span>${icon('send', 15)}</div>
    </div>
  `;
}

/* -------------------------------------------------------------------------- */
/*  Hero scene: phone + floating plan / payment / chart cards                  */
/* -------------------------------------------------------------------------- */

const HERO_CHAT: readonly ChatMessage[] = [
  { from: 'user', text: 'vm.tiktok.com/ZM8kq2Lx' },
  { from: 'bot', text: 'Відео від @dance.ua · 0:23', button: 'Завантажити за 1 ⭐' },
  { from: 'system', text: 'Оплачено 1 ⭐' },
  { from: 'bot', text: '🎬 Готово! Відео без вотермарки ⬇️' },
];

/** Bar heights (%) for the weekly chart: a believable, gently rising week. */
const WEEK = [28, 36, 32, 48, 55, 62, 78] as const;
const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'] as const;

export function heroScene(): SafeHtml {
  return html`
    <figure class="scene" data-reveal data-reveal-delay="3">
      <div class="scene__stage" aria-hidden="true">
        ${phone(HERO_CHAT, 'Ваш бот', 'download')}

        <div class="float float--plan">
          <div class="float__head">${icon('map', 16)}<span>План розвитку</span><small>Тиждень 1</small></div>
          <ul class="mini-check">
            <li class="is-done">${icon('check', 14)}Оформити профіль</li>
            <li class="is-done">${icon('check', 14)}Зняти 3 відео</li>
            <li>${icon('check', 14)}Опублікувати в чатах</li>
          </ul>
          <div class="progress"><span style="width: 66%"></span></div>
        </div>

        <div class="float float--pay">
          <span class="float__dot"></span>
          <div><strong>Нова оплата</strong><small>щойно</small></div>
          <span class="float__amount">+50 ⭐</span>
        </div>

        <div class="float float--chart">
          <div class="float__head">${icon('chart', 16)}<span>Покупці за тиждень</span></div>
          <div class="bars">
            ${WEEK.map(
              (h, i) => html`<span class="bars__col"><i style="height: ${h}%; --d: ${i}"></i><small>${DAYS[i]}</small></span>`,
            )}
          </div>
        </div>
      </div>
      <figcaption>Демо інтерфейсу: так виглядають бот, план і статистика</figcaption>
    </figure>
  `;
}

/* -------------------------------------------------------------------------- */
/*  "What you get" mini visuals (one per offering, by index)                   */
/* -------------------------------------------------------------------------- */

export const offerVisuals: readonly SafeHtml[] = [
  // 1. Ready bot
  html`<div class="ov ov--bot" aria-hidden="true">
    <div class="chat__msg chat__msg--user">tiktok.com/@dance.ua/…</div>
    <div class="chat__msg chat__msg--bot">Відео знайдено ✓<span class="chat__button">Завантажити за 1 ⭐</span></div>
  </div>`,
  // 2. Development plan
  html`<div class="ov ov--plan" aria-hidden="true">
    <ul class="mini-check">
      <li class="is-done">${icon('check', 14)}День 1: профіль</li>
      <li class="is-done">${icon('check', 14)}День 2: перші відео</li>
      <li>${icon('check', 14)}День 3: чати</li>
    </ul>
    <div class="progress"><span style="width: 66%"></span></div>
  </div>`,
  // 3. Support
  html`<div class="ov ov--support" aria-hidden="true">
    <div class="chat__msg chat__msg--user">Бот не відповідає?</div>
    <div class="chat__msg chat__msg--bot">Уже виправили ✓</div>
  </div>`,
];

/* -------------------------------------------------------------------------- */
/*  Mini App screen: crossword in progress (for game projects)                 */
/* -------------------------------------------------------------------------- */

type CellState = 'solved' | 'active' | 'cursor' | 'typed' | 'empty';

interface CwCell {
  readonly col: number;
  readonly row: number;
  readonly letter: string;
  readonly state: CellState;
}

/**
 * Real Ukrainian words that genuinely cross:
 * КАВУН (across) · КЕФІР (down, shares К) · ГРУША (across, shares Р) · НУТ (down, active).
 */
const CW_CELLS: readonly CwCell[] = [
  // КАВУН, solved
  { col: 1, row: 1, letter: 'К', state: 'solved' },
  { col: 2, row: 1, letter: 'А', state: 'solved' },
  { col: 3, row: 1, letter: 'В', state: 'solved' },
  { col: 4, row: 1, letter: 'У', state: 'solved' },
  { col: 5, row: 1, letter: 'Н', state: 'solved' },
  // КЕФІР, solved
  { col: 1, row: 2, letter: 'Е', state: 'solved' },
  { col: 1, row: 3, letter: 'Ф', state: 'solved' },
  { col: 1, row: 4, letter: 'І', state: 'solved' },
  { col: 1, row: 5, letter: 'Р', state: 'solved' },
  // ГРУША, partly typed
  { col: 0, row: 5, letter: 'Г', state: 'typed' },
  { col: 2, row: 5, letter: 'У', state: 'typed' },
  { col: 3, row: 5, letter: '', state: 'empty' },
  { col: 4, row: 5, letter: '', state: 'empty' },
  // НУТ, the active word
  { col: 5, row: 2, letter: 'У', state: 'active' },
  { col: 5, row: 3, letter: '', state: 'cursor' },
];

const KEY_ROWS = ['ЙЦУКЕНГШЩЗХЇ', 'ФІВАПРОЛДЖЄ', 'ЯЧСМИТЬБЮ'] as const;

export function crosswordPhone(title: string): SafeHtml {
  return html`
    <div class="phone phone--game" aria-hidden="true">
      <div class="phone__notch"></div>
      <div class="cw__top">
        <span><strong>${title}</strong><small>Рівень 12 · Їжа</small></span>
        <span class="cw__hints">💡 3</span>
      </div>
      <div class="cw__grid">
        ${CW_CELLS.map(
          (c) =>
            html`<span class="cw__cell cw__cell--${c.state}" style="grid-column: ${c.col + 1}; grid-row: ${c.row + 1}">${c.letter}</span>`,
        )}
      </div>
      <div class="cw__clue"><span>3 ↓</span> Зернобобові для хумусу <small>(3)</small></div>
      <div class="cw__tools">
        <span>Літера · 1 💡</span><span>Слово · 3 💡</span><span>Помилки</span>
      </div>
      <div class="cw__keys">
        ${KEY_ROWS.map((row) => html`<div>${[...row].map((k) => html`<span>${k}</span>`)}</div>`)}
      </div>
    </div>
  `;
}
