/**
 * Подання проєктів:
 *   productBand   повноширинна панель у кольорі продукту (головна)
 *   projectCard   велика картка з мініатюрою (сторінка напряму)
 *   directionTile плитка вибору напряму (головна)
 * Усе будується з даних: новий об'єкт у projects.ts з'являється тут сам.
 */

import type { Category, Project } from '@/types';
import { PREVIEW_TRAFFIC, RATES } from '@/data/site';
import { getCategory } from '@/data';
import { href } from '@/router';
import { breakEvenTraffic, forecast } from '@/lib/economics';
import { formatDaysRange, formatInt, formatMinutesRange, formatSignedUah, formatUah } from '@/lib/format';
import { html, type SafeHtml } from '@/lib/dom';
import { icon } from '@/lib/icons';
import { displayName, themeStyle } from '@/lib/theme';
import { phone } from './phone';
import { iconTile, liveBadge } from './ui';

/** Найнижча ціна в Stars для клієнтів, напр. «від 1 ⭐». */
export function fromStars(p: Project): string | null {
  const stars = (p.customerPrices ?? [])
    .map((c) => /^(\d[\d\s]*)\s*⭐/.exec(c.price)?.[1])
    .filter((v): v is string => v !== undefined)
    .map((v) => Number(v.replace(/\s/g, '')));
  return stars.length ? `від ${Math.min(...stars)} ⭐` : null;
}

/** Плюсовий прогноз або чесне «у плюс від ≈ N людей», ніколи не зелений мінус. */
export function forecastText(p: Project): string | null {
  const net = forecast(p, PREVIEW_TRAFFIC, p.economics.payerRate, RATES).netUah;
  if (net > 0) return `${formatSignedUah(net)} на місяць з ${formatInt(PREVIEW_TRAFFIC)} людей`;
  const be = breakEvenTraffic(p, RATES);
  return be === null ? null : `у плюс від ≈ ${formatInt(be)} людей на місяць`;
}

export function productBand(p: Project, index: number): SafeHtml {
  const stars = fromStars(p);
  const category = getCategory(p.categoryId);
  return html`
    <article class="band ${index % 2 ? 'band--flip' : ''}" style="${themeStyle(p)}" data-cat="${p.categoryId}" aria-labelledby="band-${p.id}">
      <div class="container band__inner">
        <div class="band__text" data-reveal>
          ${p.botUrl && liveBadge()}
          <h3 class="band__name" id="band-${p.id}">${displayName(p)}</h3>
          <p class="band__tag">${p.tagline}</p>
          <dl class="band__facts">
            <div><dt>Запуск під ключ</dt><dd>${formatUah(p.priceUah)}<small>+ ${formatUah(p.monthlyUah)} на місяць</small></dd></div>
            ${stars && html`<div><dt>Ваші клієнти платять</dt><dd>${stars}</dd></div>`}
            <div><dt>Перший клієнт</dt><dd>≈ ${formatDaysRange(p.firstClientDays)}</dd></div>
          </dl>
          <div class="band__actions">
            <a class="btn btn--world btn--lg" href="${href.project(p.id)}" aria-label="Детальніше про ${displayName(p)}">Детальніше</a>
            ${p.botUrl && html`<a class="btn btn--line btn--lg" href="${p.botUrl}" target="_blank" rel="noopener">${icon('send', 18)} Спробувати бота</a>`}
          </div>
          ${category && html`<p class="band__cat">Напрям: <a href="${href.category(category.id)}">${category.name}</a></p>`}
        </div>
        <div class="band__visual" data-reveal>${phone(p, 'md')}</div>
      </div>
    </article>
  `;
}

export function projectCard(p: Project): SafeHtml {
  const soon = p.status === 'soon';
  const forecastLine = !soon ? forecastText(p) : null;
  const body = html`
    <div class="pcard__thumb" aria-hidden="true">${phone(p, 'md')}</div>
    <div class="pcard__body">
      <h2 class="pcard__title">${displayName(p)} ${soon && html`<span class="tag">Скоро</span>`}</h2>
      <p class="pcard__text">${p.tagline}</p>
      <ul class="pcard__facts">
        <li>${icon('clock', 18)} Перший клієнт ≈ ${formatDaysRange(p.firstClientDays)}</li>
        <li>${icon('calendar', 18)} ${formatMinutesRange(p.dailyMinutes)} на день</li>
        ${p.botUrl && html`<li class="pcard__live">${icon('send', 18)} Бот працює в Telegram</li>`}
      </ul>
    </div>
    <div class="pcard__side">
      <span class="pcard__price">${formatUah(p.priceUah)}</span>
      <span class="pcard__monthly">+ ${formatUah(p.monthlyUah)} на місяць</span>
      ${forecastLine && html`<span class="pcard__forecast">${forecastLine}</span>`}
      ${!soon && html`<span class="pcard__more">Детальніше ${icon('arrowRight', 18)}</span>`}
    </div>
  `;
  return soon
    ? html`<li><div class="pcard is-soon" style="${themeStyle(p)}" aria-disabled="true">${body}</div></li>`
    : html`<li><a class="pcard" style="${themeStyle(p)}" href="${href.project(p.id)}">${body}</a></li>`;
}

export function directionTile(c: Category, count: number, minPrice: number | null, botWord: string): SafeHtml {
  return html`<button type="button" class="dir" data-filter="${c.id}" aria-pressed="false" style="--accent: ${c.accent}">
    ${iconTile(c.icon, c.accent)}
    <span class="dir__name">${c.name}</span>
    <span class="dir__meta">${count} ${botWord}${minPrice !== null ? `, від ${formatUah(minPrice)}` : ''}</span>
  </button>`;
}
