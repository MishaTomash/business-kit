/**
 * Телефон з екраном продукту.
 *
 * Пріоритет: справжній скріншот (`image`) → екран гри (`screen`) → демо-чат (`demo`).
 * Демо намальоване кодом, тому підписане «Демо»; справжній скріншот такого підпису не має.
 * Увесь макет декоративний (`aria-hidden`), бо поруч є той самий текст.
 */

import type { ChatMessage, Project } from '@/types';
import { html, type SafeHtml } from '@/lib/dom';
import { displayName, shortLabel, themeStyle } from '@/lib/theme';

// Один рядок навмисно: у бульбашках `white-space: pre-line`, відступи шаблону не мають потрапити в текст.
const msg = (m: ChatMessage, i: number): SafeHtml =>
  html`<div class="msg msg--${m.from}" style="--d:${i}">${m.text}${m.button && html`<span class="msg__btn">${m.button}</span>`}</div>`;

function chatScreen(p: Project, messages: readonly ChatMessage[]): SafeHtml {
  return html`<div class="scr scr--chat">
    <div class="scr__bar">
      <span class="scr__ava">${shortLabel(p).slice(0, 1)}</span>
      <span class="scr__title">${shortLabel(p)}<small>бот</small></span>
    </div>
    <div class="scr__chat">${messages.map(msg)}</div>
    <div class="scr__input"><span>Повідомлення</span></div>
  </div>`;
}

type CellState = 'ok' | 'act' | 'cur' | 'typed' | 'empty';
type Cell = readonly [col: number, row: number, letter: string, state: CellState];
/** Справжні слова, що перетинаються: КАВУН, КЕФІР, ГРУША, НУТ. */
const CELLS: readonly Cell[] = [
  [1, 1, 'К', 'ok'], [2, 1, 'А', 'ok'], [3, 1, 'В', 'ok'], [4, 1, 'У', 'ok'], [5, 1, 'Н', 'ok'],
  [1, 2, 'Е', 'ok'], [1, 3, 'Ф', 'ok'], [1, 4, 'І', 'ok'], [1, 5, 'Р', 'ok'],
  [0, 5, 'Г', 'typed'], [2, 5, 'У', 'typed'], [3, 5, '', 'empty'], [4, 5, '', 'empty'],
  [5, 2, 'У', 'act'], [5, 3, '', 'cur'],
];
const KEYS = ['ЙЦУКЕНГШЩЗХЇ', 'ФІВАПРОЛДЖЄ', 'ЯЧСМИТЬБЮ'] as const;

function crosswordScreen(p: Project): SafeHtml {
  return html`<div class="scr scr--game">
    <div class="cw__top"><span><b>${displayName(p)}</b><small>Рівень 12, розділ «Їжа»</small></span><span class="cw__hint">💡 3</span></div>
    <div class="cw__grid">
      ${CELLS.map(([c, r, l, s]) => html`<span class="cw__c cw__c--${s}" style="grid-column:${c + 1};grid-row:${r + 1}">${l}</span>`)}
    </div>
    <div class="cw__clue"><b>3 ↓</b> Зернобобові для хумусу (3)</div>
    <div class="cw__keys">${KEYS.map((row) => html`<div>${[...row].map((k) => html`<span>${k}</span>`)}</div>`)}</div>
  </div>`;
}

/** Чи є що показати в телефоні. */
export const hasScreen = (p: Project): boolean => Boolean(p.image || p.screen || p.demo?.length);

function screen(p: Project): SafeHtml {
  if (p.image)
    return html`<img class="scr scr--img" src="${p.image}" alt="Скріншот бота ${displayName(p)}" width="590" height="1280" decoding="async" />`;
  if (p.screen === 'crossword') return crosswordScreen(p);
  if (p.demo?.length) return chatScreen(p, p.demo);
  return html`<div class="scr scr--empty"><span>${shortLabel(p).slice(0, 1)}</span></div>`;
}

/**
 * @param size  'lg' для hero, 'md' для панелей, 'sm' для мініатюр у списках.
 */
export function phone(p: Project, size: 'sm' | 'md' | 'lg' = 'md'): SafeHtml {
  // Справжній скріншот лишається доступним для читачів екрана, демо — ні.
  return html`<div class="ph ph--${size}" style="${themeStyle(p)}" ${p.image ? '' : html`aria-hidden="true"`}>
    <div class="ph__screen">${screen(p)}</div>
    ${!p.image && size !== 'sm' && html`<span class="ph__demo">Демо</span>`}
  </div>`;
}
