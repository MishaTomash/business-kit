/**
 * Калькулятор доходу на сторінці гри, що працює (макет page-36/37, 42).
 *
 * Одне керування — повзунок «Гравців за місяць» (50–5 000, логарифмічна шкала). Частка тих, хто купує,
 * і зірки на покупця — умовні значення з даних гри (рішення власника: 4 % і 30 ★), показані з позначкою
 * «умовно». Уся математика — з src/lib/economics.ts (не змінюється): тут лише відображення.
 * Без JS видно розрахунок для початкових 500 гравців (prerender).
 */

import type { Project } from '@/types';
import { PREVIEW_TRAFFIC, RATES } from '@/data/site';
import { SLIDER_STEPS, TRAFFIC_MAX, TRAFFIC_MIN, breakEvenTraffic, forecast, sliderToTraffic, trafficToSlider } from '@/lib/economics';
import { AnimatedNumber } from '@/lib/animated-number';
import { formatInt, formatPercent, formatUah } from '@/lib/format';
import { html, qs, render, type SafeHtml } from '@/lib/dom';
import { STAR_ICON } from '@/lib/icons';
import type { Cleanup } from '@/views/view';

const decimal = (n: number, digits = 1): string => n.toFixed(digits).replace('.', ',');
const DAYS_PER_MONTH = 30;

/** Окупність у місяцях з днів, які рахує economics.ts. */
function paybackLine(project: Project, days: number | null): SafeHtml {
  if (days === null) {
    const n = breakEvenTraffic(project, RATES);
    return html`Поки що підписка більша за дохід.${n ? html` У плюс від <b class="num">≈&nbsp;${formatInt(n)}</b> гравців на місяць.` : ''}`;
  }
  return html`Запуск ${formatUah(project.priceUah)} окупиться за <b class="num calc__payback-value">≈&nbsp;${decimal(days / DAYS_PER_MONTH)}&nbsp;міс.</b>`;
}

const starsOut = (n: number): SafeHtml => html`<span class="star-sum">${formatInt(n)}&nbsp;<span class="calc__star">${STAR_ICON}</span></span>`;

export function calculatorMarkup(project: Project): SafeHtml {
  const econ = project.economics;
  const f0 = forecast(project, PREVIEW_TRAFFIC, econ.payerRate, RATES);
  const arppu = econ.kind === 'stars' ? econ.arppuStars : 0;
  return html`
    <div class="calc" data-calc>
      <div class="calc__inputs">
        <div class="calc__row calc__row--main">
          <label class="calc__label" for="traffic-range">Гравців за місяць</label>
          <output class="calc__output num" for="traffic-range" data-out="traffic">${formatInt(PREVIEW_TRAFFIC)}</output>
        </div>
        <input id="traffic-range" class="range" type="range" min="0" max="${SLIDER_STEPS}" step="1" value="${trafficToSlider(PREVIEW_TRAFFIC)}" data-input="traffic" aria-valuetext="${formatInt(PREVIEW_TRAFFIC)} гравців" />
        <div class="calc__scale" aria-hidden="true"><span>${formatInt(TRAFFIC_MIN)}</span><span>${formatInt(TRAFFIC_MAX)}</span></div>
        <dl class="calc__assume">
          <div><dt>Частка тих, хто купує <span class="calc__tag">умовно</span></dt><dd class="num">${formatPercent(econ.payerRate)}</dd></div>
          ${arppu ? html`<div><dt>Зірок на покупця за місяць <span class="calc__tag">умовно</span></dt><dd class="num">${starsOut(arppu)}</dd></div>` : ''}
          <div><dt>Курс</dt><dd class="num">${decimal(RATES.starPayoutUsd, 3)}&nbsp;$&nbsp;/&nbsp;<span class="calc__star">${STAR_ICON}</span> · ${decimal(RATES.uahPerUsd)}&nbsp;₴&nbsp;/&nbsp;$</dd></div>
        </dl>
      </div>

      <dl class="calc__result" aria-live="polite">
        ${f0.grossStars !== null ? html`<div><dt>Зірок за місяць</dt><dd class="calc__big num" data-out="stars">${starsOut(f0.grossStars)}</dd></div>` : ''}
        <div><dt><svg class="i-approx" aria-hidden="true"><use href="#i-approx"></use></svg> гривень за місяць</dt><dd class="calc__big num" data-out="gross">${formatUah(f0.grossUah)}</dd></div>
        <div><dt>Підписка</dt><dd class="calc__big num" data-out="costs">−${formatUah(f0.costsUah)}</dd></div>
        <div class="calc__net-row"><dt>Чистий прибуток за місяць</dt><dd class="calc__big calc__net num" data-out="net">${formatUah(f0.netUah)}</dd></div>
      </dl>
      <p class="calc__payback" data-out="payback">${paybackLine(project, f0.paybackDays)}</p>

      <p class="calc__note small muted">
        Розрахунок — модель, а не гарантія доходу. Значення з позначкою «умовно» — не статистика. Точна сума залежить від курсу в день виведення.
      </p>
    </div>
  `;
}

export function mountCalculator(root: HTMLElement, project: Project): Cleanup {
  const el = root.querySelector<HTMLElement>('[data-calc]');
  if (!el) return () => undefined;
  const out = (key: string): HTMLElement | null => el.querySelector<HTMLElement>(`[data-out="${key}"]`);
  const input = qs<HTMLInputElement>('[data-input="traffic"]', el);
  const rate = project.economics.payerRate;
  const f0 = forecast(project, PREVIEW_TRAFFIC, rate, RATES);

  const gross = out('gross') ? new AnimatedNumber(qs('[data-out="gross"]', el), formatUah, Math.round(f0.grossUah), 500) : null;
  const net = new AnimatedNumber(qs('[data-out="net"]', el), formatUah, Math.round(f0.netUah), 600);

  const setFill = (): void => {
    input.style.setProperty('--fill', `${(Number(input.value) / SLIDER_STEPS) * 100}%`);
  };

  const update = (): void => {
    const traffic = sliderToTraffic(Number(input.value));
    const f = forecast(project, traffic, rate, RATES);
    const t = out('traffic');
    if (t) t.textContent = formatInt(traffic);
    input.setAttribute('aria-valuetext', `${formatInt(traffic)} гравців`);
    const s = out('stars');
    if (s && f.grossStars !== null) render(s, starsOut(f.grossStars));
    gross?.set(Math.round(f.grossUah));
    const c = out('costs');
    if (c) c.textContent = `−${formatUah(f.costsUah)}`;
    net.set(Math.round(f.netUah));
    el.classList.toggle('is-negative', f.netUah < 0);
    const p = out('payback');
    if (p) render(p, paybackLine(project, f.paybackDays));
    setFill();
  };

  input.addEventListener('input', update);
  setFill();
  return () => input.removeEventListener('input', update);
}
