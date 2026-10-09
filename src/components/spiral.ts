/**
 * Спіраль ДНК (DESIGN-SPEC, розділ 4): перекладини з двома крапками й лінією між ними.
 *
 * Для перекладини i: θ = 0.52·i + φ. Кінці: 50 ± 44·sin θ (% поперек осі), розмір крапки
 * 9 ± 5·cos θ px, прозорість 0.5 ± 0.5·cos θ. Об'єм без WebGL і 3D-трансформацій.
 *
 * Розмітка повна й статична (φ = 0.6): так спіраль видно без JS і з prefers-reduced-motion.
 * Значення sin/cos для φ = 0.6 записані в кожну перекладину (--s, --c). Коли JS вмикає рух,
 * блок отримує клас is-live і змінну --phi, а CSS рахує sin()/cos() сам (styles/spiral.css):
 * один запис стилю на кадр, анімуються лише transform і opacity.
 */

import { html, type SafeHtml } from '@/lib/dom';

/** Кут у статичному стані й на старті руху. */
export const PHI_STATIC = 0.6;
export const RUNG_STEP = 0.52;

export interface SpiralOptions {
  /** Скільки перекладин у розмітці (найбільша кількість; менші екрани ховають зайві через CSS). */
  readonly rungs: number;
  /** Додаткові класи: spiral--hero, spiral--path… */
  readonly className?: string;
  /** Атрибути даних для поведінки, напр. data-spiral="hero". */
  readonly name: string;
  /** Скільки перекладин на крок «Шляху зірки» (для підсвічування). 0 — без кроків. */
  readonly perStep?: number;
}

const r4 = (v: number): string => (Math.round(v * 10000) / 10000).toString();

export function spiralMarkup(opts: SpiralOptions): SafeHtml {
  const rungs: SafeHtml[] = [];
  for (let i = 0; i < opts.rungs; i++) {
    const t = RUNG_STEP * i + PHI_STATIC;
    const step = opts.perStep ? Math.floor(i / opts.perStep) : -1;
    rungs.push(html`<span class="sp-rung" style="--i:${i};--s:${r4(Math.sin(t))};--c:${r4(Math.cos(t))}"${step >= 0 ? html` data-step="${step}"` : ''}><span class="sp-line"><span class="sp-lit"></span></span><span class="sp-a"><span class="sp-dot"></span></span><span class="sp-b"><span class="sp-dot"></span></span></span>`);
  }
  return html`<div class="spiral ${opts.className ?? ''}" data-spiral="${opts.name}" aria-hidden="true">${rungs}</div>`;
}
