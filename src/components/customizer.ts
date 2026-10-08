/**
 * Наочна кастомізація: нейтральна рамка «вашої гри» (не екран конкретної гри).
 * Назва, кольори й знак перемикаються наживо. Без JS видно стан за замовчуванням.
 */

import { html, raw, type SafeHtml } from '@/lib/dom';
import { STAR_ICON, wordTiles } from '@/lib/tiles';

interface Palette {
  readonly id: string;
  readonly name: string;
  readonly bg: string;
  readonly ink: string;
  readonly tile: string;
  readonly tileInk: string;
}

/** Кольори перевірені на контраст: текст на тлі й літери на плитках ≥ 4,5 : 1. */
const PALETTES: readonly Palette[] = [
  { id: 'forest', name: 'Хвоя', bg: '#0d2a1c', ink: '#e6f5ea', tile: '#ffb81c', tileInk: '#0d2a1c' },
  { id: 'mint', name: 'М’ята', bg: '#d5eedc', ink: '#0d2a1c', tile: '#ffffff', tileInk: '#0d2a1c' },
  { id: 'sky', name: 'Небо', bg: '#1d5c8c', ink: '#ffffff', tile: '#ffffff', tileInk: '#1d5c8c' },
  { id: 'orange', name: 'Мандарин', bg: '#ff7a1a', ink: '#1c1206', tile: '#ffffff', tileInk: '#1c1206' },
];

const DEFAULT_NAME = 'ВАШ КАНАЛ';
const vars = (p: Palette): string => `--f-bg:${p.bg};--f-ink:${p.ink};--f-tile:${p.tile};--f-tile-ink:${p.tileInk}`;

function frameWord(name: string): SafeHtml {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return html`${words.map((w) => wordTiles(w, 'tiles--frame'))}`;
}

export function customizerMarkup(): SafeHtml {
  const first = PALETTES[0];
  if (!first) return raw('');
  return html`
    <div class="custom" data-custom>
      <div class="custom__controls" role="group" aria-label="Налаштування рамки гри">
        <label class="custom__label" for="cz-name">Назва вашої гри</label>
        <input class="custom__input" id="cz-name" name="name" type="text" maxlength="12" value="${DEFAULT_NAME}" autocomplete="off" spellcheck="false" />
        <fieldset class="custom__set">
          <legend class="custom__label">Кольори</legend>
          <div class="swatches">
            ${PALETTES.map(
              (p, i) => html`<label class="swatch" style="${vars(p)}"><input type="radio" name="palette" value="${p.id}" ${i === 0 ? raw('checked') : ''} /><span class="swatch__chip" aria-hidden="true"></span><span class="swatch__name">${p.name}</span></label>`,
            )}
          </div>
        </fieldset>
        <fieldset class="custom__set">
          <legend class="custom__label">Знак</legend>
          <div class="swatches">
            <label class="swatch swatch--text"><input type="radio" name="mark" value="star" checked /><span class="swatch__name">Зірка</span></label>
            <label class="swatch swatch--text"><input type="radio" name="mark" value="letter" /><span class="swatch__name">Перша літера</span></label>
          </div>
        </fieldset>
      </div>

      <figure class="frame" data-frame style="${vars(first)}">
        <div class="frame__bar">
          <span class="frame__logo" data-logo>${STAR_ICON}</span>
          <span class="frame__name" data-name>${DEFAULT_NAME}</span>
        </div>
        <div class="frame__word" data-word>${frameWord(DEFAULT_NAME)}</div>
        <figcaption class="frame__cap">Рамка показує лише вашу назву, кольори й знак. Самі ігри — у каталозі.</figcaption>
      </figure>
    </div>
  `;
}

export function mountCustomizer(root: ParentNode): void {
  const box = root.querySelector<HTMLElement>('[data-custom]');
  if (!box) return;
  const form = box.querySelector<HTMLElement>('.custom__controls');
  const frame = box.querySelector<HTMLElement>('[data-frame]');
  const nameEl = box.querySelector<HTMLElement>('[data-name]');
  const wordEl = box.querySelector<HTMLElement>('[data-word]');
  const logo = box.querySelector<HTMLElement>('[data-logo]');
  const input = box.querySelector<HTMLInputElement>('#cz-name');
  if (!form || !frame || !nameEl || !wordEl || !logo || !input) return;
  const checked = (name: string): string | undefined =>
    form.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`)?.value;

  const update = (): void => {
    const clean = input.value.toUpperCase().replace(/[^A-ZА-ЯҐЄІЇ0-9' ]/g, '').replace(/\s+/g, ' ').slice(0, 12);
    if (clean !== input.value) input.value = clean;
    const name = clean.trim() || DEFAULT_NAME;
    nameEl.textContent = name;
    wordEl.innerHTML = frameWord(name).value;
    const pal = PALETTES.find((p) => p.id === checked('palette')) ?? PALETTES[0];
    if (pal) frame.setAttribute('style', vars(pal));
    const mark = checked('mark');
    if (mark === 'letter') logo.textContent = name.charAt(0);
    else logo.innerHTML = STAR_ICON.value;
  };
  form.addEventListener('input', update);
  form.addEventListener('change', update);
}
