/**
 * Сцена «Шлях зірки» (головна сцена сайту). Розмітка повна вже в HTML:
 * без JS і на телефоні це вертикальний список станцій з фактами.
 * Велика панель факту й баланс гри для десктопа — декоративні (aria-hidden),
 * бо дублюють список.
 */

import { STAR_PATH, MIN_WITHDRAW_UAH, textNumber } from '@/data/business';
import { STARS_RULES } from '@/data/site';
import { html, type SafeHtml } from '@/lib/dom';
import { STAR_ICON, tiles } from '@/lib/tiles';

const BALANCE_CELLS = 10;

export function starPathMarkup(): SafeHtml {
  const n = STAR_PATH.length;
  return html`
    <section class="sec sec--forest path" id="how" aria-labelledby="how-t">
      <div class="wrap path__head">
        <h2 class="h2" id="how-t">Шлях однієї зірки від гравця до вашої картки</h2>
      </div>
      <div class="path__track" data-path style="--n:${n}">
        <div class="path__stage">
          <div class="wrap path__grid">
            <div class="path__facts" aria-hidden="true">
              ${STAR_PATH.map(
                (s, i) => html`
                  <div class="fact" data-fact="${i}">
                    <p class="fact__step"><span>${i + 1} з ${n}. ${s.label}</span></p>
                    ${tiles(s.figure, { className: 'tiles--xl', decorative: true, ...(s.prefix ? { prefix: s.prefix } : {}) })}
                    <p class="fact__text"><span>${s.text}</span></p>
                  </div>
                `,
              )}
            </div>

            <div class="balance" aria-hidden="true" data-balance>
              <p class="balance__title">Баланс вашої гри</p>
              <p class="balance__goal">${textNumber(STARS_RULES.minWithdraw)} ★ — мінімум для виведення</p>
              <div class="balance__meter">
                ${Array.from({ length: BALANCE_CELLS }, (_, i) => html`<span class="cell" style="--c:${i}"><span class="cell__face cell__face--empty"></span><span class="cell__face cell__face--star">${STAR_ICON}</span><span class="cell__face cell__face--cash">₴</span></span>`)}
              </div>
              <p class="balance__state">
                <span data-state="0">Зірки надходять від гравців</span>
                <span data-state="1">Зірки чекають ${STARS_RULES.holdDays} день</span>
                <span data-state="2">Можна виводити</span>
                <span data-state="3">На картці ≈ ${textNumber(MIN_WITHDRAW_UAH)} ₴</span>
              </p>
            </div>

            <div class="rail" data-rail>
              <span class="rail__base" aria-hidden="true"></span>
              <span class="rail__fill" data-rail-fill aria-hidden="true"></span>
              <ol class="rail__stops">
                ${STAR_PATH.map(
                  (s, i) => html`
                    <li class="stop" style="--i:${i}">
                      <span class="stop__tile" aria-hidden="true">${i + 1}</span>
                      <span class="stop__label">${s.label}</span>
                      <div class="stop__fact">
                        ${tiles(s.figure, { className: 'tiles--md', ...(s.prefix ? { prefix: s.prefix } : {}) })}
                        <p>${s.text}</p>
                      </div>
                    </li>
                  `,
                )}
              </ol>
              <span class="rail__star" data-star aria-hidden="true">${STAR_ICON}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

export { BALANCE_CELLS };
