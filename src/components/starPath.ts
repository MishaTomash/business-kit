/**
 * «Шлях зірки»: 7 кроків від гравця до гривень. Тексти й числа — з src/data/business.ts (STAR_PATH),
 * заголовок і примітка — з src/data/home.ts; у розмітці нічого не захардкоджено.
 *
 * На десктопі поруч із кроками стоїть спіраль із 21 перекладини (7 кроків × 3), колонка липне
 * (position: sticky). Коли крок перетинає 60 % висоти екрана, його три перекладини, номер і крапка
 * стають кораловими (src/lib/star-path.ts). На телефоні роль спіралі грають коралові крапки біля номерів.
 * Без JS і з prefers-reduced-motion усі кроки одразу підсвічені.
 */

import { STAR_PATH } from '@/data/business';
import { HOME } from '@/data/home';
import { html, type SafeHtml } from '@/lib/dom';
import { STAR_ICON, pluralStars } from '@/lib/icons';
import { spiralMarkup } from './spiral';

export const RUNGS_PER_STEP = 3;

const APPROX_ICON = html`<svg class="i-approx" aria-hidden="true" focusable="false"><use href="#i-approx"></use></svg>`;

/** Значення кроку: суми в зірках золотом зі значком, гривні кольором тексту, «≈» значком (його немає у шрифтах). */
function figure(fig: string, prefix?: string): SafeHtml {
  const stars = Number(fig.replace(/\D/g, '')) || 0;
  const spoken = `${prefix ? 'приблизно ' : ''}${fig.replace('★', ` ${pluralStars(stars)}`).replace('₴', ' гривень')}`.replace(/\s+/g, ' ').trim();
  const pre = prefix === '≈' ? html`${APPROX_ICON} ` : prefix ? html`${prefix} ` : '';
  if (fig.includes('★')) {
    const [num = ''] = fig.split('★');
    return html`<p class="pstep__value star-sum"><span aria-hidden="true">${pre}${num}<span class="pstep__star">${STAR_ICON}</span></span><span class="sr-only">${spoken}</span></p>`;
  }
  const text = fig.replace('₴', ' ₴');
  return html`<p class="pstep__value"><span aria-hidden="true">${pre}${text}</span><span class="sr-only">${spoken}</span></p>`;
}

export function starPathMarkup(): SafeHtml {
  return html`
    <section class="sec path" id="how" aria-labelledby="how-t" data-path>
      <div class="wrap path__grid">
        <div class="path__aside">
          <p class="eyebrow">${HOME.path.eyebrow}</p>
          <h2 class="h2" id="how-t">${HOME.path.title}</h2>
          <div class="path__spiral">${spiralMarkup({ rungs: STAR_PATH.length * RUNGS_PER_STEP, name: 'path', className: 'spiral--path', perStep: RUNGS_PER_STEP })}</div>
        </div>
        <div class="path__list">
        <ol class="path__steps">
          ${STAR_PATH.map(
            (s, i) => html`
              <li class="pstep" data-step="${i}">
                <span class="pstep__num" aria-hidden="true"><span class="pstep__dot"></span>${String(i + 1).padStart(2, '0')}</span>
                <div class="pstep__body">
                  <h3 class="pstep__title">${s.label}</h3>
                  <p class="pstep__text">${s.text}</p>
                </div>
                ${figure(s.figure, s.prefix)}
              </li>
            `,
          )}
        </ol>
        <p class="path__note small muted">${HOME.path.disclaimer}</p>
        </div>
      </div>
    </section>
  `;
}
