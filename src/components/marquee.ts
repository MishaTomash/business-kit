/**
 * Біжучий рядок з фактами. Один на сторінку, пауза при наведенні.
 * Чотири однакові ряди: стрічка зсувається рівно на один ряд (-25%), тож зациклення без стрибка
 * і без порожнього місця навіть на дуже широкому екрані. Копії приховані від читачів екрана.
 */

import { MARQUEE } from '@/data/business';
import { html, type SafeHtml } from '@/lib/dom';
import { STAR_ICON, starText } from '@/lib/tiles';

export function marqueeMarkup(): SafeHtml {
  const row = MARQUEE.map((m) => html`<span class="marquee__item">${starText(m.text)}</span><span class="marquee__sep">${STAR_ICON}</span>`);
  return html`
    <div class="marquee">
      <p class="sr-only">${MARQUEE.map((m) => m.spoken).join('. ')}.</p>
      <div class="marquee__track" aria-hidden="true"><span class="marquee__row">${row}</span><span class="marquee__row marquee__row--copy">${row}</span><span class="marquee__row marquee__row--copy">${row}</span><span class="marquee__row marquee__row--copy">${row}</span></div>
    </div>
  `;
}
