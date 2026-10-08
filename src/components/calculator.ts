/**
 * Calculator — lives on each project page and models only that project.
 *
 * Kept deliberately simple for beginners:
 * - one main control: how many people you bring per month (presets + slider),
 * - the conversion assumption is tucked into "Налаштувати припущення",
 * - one big answer: net profit per month, plus payback in days.
 *
 * Each instance owns a local store, so the component is self-contained and
 * cleans up completely when the route changes.
 */

import type { CalculatorState, Project } from '@/types';
import { PREVIEW_TRAFFIC, RATES } from '@/data/site';
import { createStore } from '@/store/store';
import { SLIDER_STEPS, TRAFFIC_MAX, TRAFFIC_MIN, forecast, sliderToTraffic, trafficToSlider } from '@/lib/economics';
import { AnimatedNumber } from '@/lib/animated-number';
import { formatInt, formatPercent, formatSignedUah, formatUah, pluralDays } from '@/lib/format';
import { html, qs, qsa, render, type SafeHtml } from '@/lib/dom';
import { icon } from '@/lib/icons';
import { prefersReducedMotion } from '@/lib/motion';
import type { Cleanup } from '@/views/view';

/** Quick picks: small, achievable numbers first. */
const PRESETS = [100, 300, 500, 1000, 3000] as const;
const RATE_MIN_PCT = 1;
const RATE_MAX_PCT = 30;

const payWhat = (project: Project): string =>
  project.economics.kind === 'orders' ? 'роблять замовлення' : 'платять';

export function calculatorMarkup(project: Project): SafeHtml {
  return html`
    <div class="calc" data-calc>
      <div class="calc__inputs">
        <div class="calc__row">
          <label class="calc__label" for="traffic-range">
            Скільки людей прийде з ${project.trafficSource} за місяць
          </label>
          <output class="calc__output" for="traffic-range" data-out="traffic"></output>
        </div>

        <div class="presets" role="group" aria-label="Швидкий вибір">
          ${PRESETS.map((n) => html`<button type="button" class="preset" data-preset="${n}">${formatInt(n)}</button>`)}
        </div>

        <input id="traffic-range" class="range" type="range" min="0" max="${SLIDER_STEPS}" step="1" data-input="traffic" />
        <div class="calc__scale" aria-hidden="true">
          <span>${formatInt(TRAFFIC_MIN)}</span><span>${formatInt(TRAFFIC_MAX)}</span>
        </div>

        <details class="calc__more">
          <summary>Налаштувати припущення</summary>
          <div class="calc__row">
            <label class="calc__label" for="rate-range">Скільки з них ${payWhat(project)}</label>
            <output class="calc__output calc__output--sm" for="rate-range" data-out="rate"></output>
          </div>
          <input id="rate-range" class="range" type="range" min="${RATE_MIN_PCT}" max="${RATE_MAX_PCT}" step="1" data-input="rate" />
          <p class="calc__hint">За замовчуванням стоїть обережна оцінка для цього проєкту.</p>
        </details>
      </div>

      <div class="calc__result">
        <span class="calc__result-label">Чистий прибуток на місяць</span>
        <span class="calc__net" data-out="net"></span>
        <span class="calc__year">≈ <span data-out="year"></span> за рік</span>

        <dl class="calc__rows">
          <div><dt>Покупців</dt><dd data-out="payers"></dd></div>
          <div><dt>Виручка</dt><dd data-out="gross"></dd></div>
          <div><dt>Витрати${project.economics.kind === 'orders' ? ' і собівартість' : ''}</dt><dd data-out="costs"></dd></div>
        </dl>

        <p class="calc__payback" data-out="payback"></p>
      </div>

      <p class="calc__note">
        Це модель, а не обіцянка. Stars рахуємо за курсом виплати Telegram ≈ $${RATES.starPayoutUsd}, 1 $ = ${RATES.uahPerUsd} ₴.
      </p>
    </div>
  `;
}

export function mountCalculator(root: HTMLElement, project: Project): Cleanup {
  const el = qs('[data-calc]', root);
  const out = (key: string): HTMLElement => qs(`[data-out="${key}"]`, el);
  const trafficInput = qs<HTMLInputElement>('[data-input="traffic"]', el);
  const rateInput = qs<HTMLInputElement>('[data-input="rate"]', el);
  const presets = qsa<HTMLButtonElement>('[data-preset]', el);

  const store = createStore<CalculatorState>({
    traffic: PREVIEW_TRAFFIC,
    payerRate: project.economics.payerRate,
  });

  const net = new AnimatedNumber(out('net'), formatSignedUah, 0, 800);
  const year = new AnimatedNumber(out('year'), formatUah, 0, 900);
  const payers = new AnimatedNumber(out('payers'), formatInt, 0, 600);
  const gross = new AnimatedNumber(out('gross'), formatUah, 0, 600);
  const costs = new AnimatedNumber(out('costs'), (n) => `\u2212${formatUah(n)}`, 0, 600);

  const setFill = (input: HTMLInputElement): void => {
    const min = Number(input.min);
    const max = Number(input.max);
    input.style.setProperty('--fill', `${((Number(input.value) - min) / (max - min)) * 100}%`);
  };

  let lastPulse = 0;
  const pulse = (): void => {
    const now = performance.now();
    if (prefersReducedMotion() || now - lastPulse < 300) return;
    lastPulse = now;
    // Лише transform: легкий «підскок» числа, коли прибуток зростає.
    out('net').animate([{ transform: 'scale(1.06)' }, { transform: 'scale(1)' }], {
      duration: 500,
      easing: 'cubic-bezier(.2,.9,.3,1.2)',
    });
  };

  const update = (state: CalculatorState, prev?: CalculatorState): void => {
    const f = forecast(project, state.traffic, state.payerRate, RATES);

    trafficInput.value = String(trafficToSlider(state.traffic));
    trafficInput.setAttribute('aria-valuetext', `${formatInt(state.traffic)} людей`);
    rateInput.value = String(Math.round(state.payerRate * 100));
    rateInput.setAttribute('aria-valuetext', formatPercent(state.payerRate));
    setFill(trafficInput);
    setFill(rateInput);
    presets.forEach((b) => b.classList.toggle('is-active', Number(b.dataset['preset']) === state.traffic));

    out('traffic').textContent = formatInt(state.traffic);
    out('rate').textContent = formatPercent(state.payerRate);

    net.set(Math.round(f.netUah));
    year.set(Math.max(0, Math.round(f.netYearUah)));
    payers.set(f.payers);
    gross.set(Math.round(f.grossUah));
    costs.set(Math.round(f.costsUah));
    el.classList.toggle('is-negative', f.netUah < 0);

    render(
      out('payback'),
      f.paybackDays === null
        ? html`${icon('trend', 18)}<span>Поки що витрати більші за дохід. Збільште кількість людей, щоб вийти в плюс.</span>`
        : html`${icon('rocket', 18)}<span>Запуск окупиться приблизно за <strong>${formatInt(f.paybackDays)} ${pluralDays(f.paybackDays)}</strong>, далі прибуток ваш.</span>`,
    );

    if (prev) {
      const prevNet = forecast(project, prev.traffic, prev.payerRate, RATES).netUah;
      if (f.netUah > prevNet && f.netUah > 0) pulse();
    }
  };

  const unsubscribe = store.subscribe(update);
  update(store.getState());

  // View → store. Listeners live on elements inside the view, so they are
  // garbage-collected with the DOM on route change.
  trafficInput.addEventListener('input', () => store.setState({ traffic: sliderToTraffic(Number(trafficInput.value)) }));
  rateInput.addEventListener('input', () => store.setState({ payerRate: Number(rateInput.value) / 100 }));
  el.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const preset = target.closest<HTMLElement>('[data-preset]')?.dataset['preset'];
    if (preset) store.setState({ traffic: Number(preset) });
  });

  return unsubscribe;
}
