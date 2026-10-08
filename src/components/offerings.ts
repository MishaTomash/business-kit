/**
 * «Що ми надаємо»: на десктопі горизонтальна стрічка, закріплена під час скролу,
 * на телефоні — свайп-каруселька (CSS scroll-snap, без JS).
 */

import { OFFERINGS } from '@/data/business';
import { html, type SafeHtml } from '@/lib/dom';
import { wordTiles } from '@/lib/tiles';

export function offeringsStrip(): SafeHtml {
  return html`
    <div class="strip" data-strip>
      <div class="strip__stage">
        <ul class="strip__rail" data-strip-rail aria-label="Що входить у запуск">
          ${OFFERINGS.map(
            (o, i) => html`
              <li class="panel panel--${i % 3}">
                ${wordTiles(o.word, 'tiles--panel')}
                <h3 class="panel__title">${o.title}</h3>
                <p class="panel__text">${o.text}</p>
              </li>
            `,
          )}
        </ul>
      </div>
    </div>
  `;
}
