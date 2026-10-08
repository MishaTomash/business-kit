/**
 * Cards for categories (home) and projects (category page).
 * Both are real links, so they work with middle-click, "open in new tab"
 * and keyboard navigation without extra JS.
 */

import type { Category, Project } from '@/types';
import { picture } from './visuals';
import { PREVIEW_TRAFFIC, RATES } from '@/data/site';
import { availableCount, getCategory, minPriceIn } from '@/data';
import { href } from '@/router';
import { breakEvenTraffic, forecast } from '@/lib/economics';
import { formatDaysRange, formatInt, formatMinutesRange, formatSignedUah, formatUah, pluralProjects } from '@/lib/format';
import { html, type SafeHtml } from '@/lib/dom';
import { icon } from '@/lib/icons';
import { iconTile } from './ui';

export function categoryCard(category: Category): SafeHtml {
  const count = availableCount(category.id);
  const minPrice = minPriceIn(category.id);

  return html`
    <li>
      <a class="cat-card spotlight" href="${href.category(category.id)}" style="--accent: ${category.accent}">
        <div class="cat-card__art">${picture(category.art, category.image)}</div>
        <h3 class="cat-card__title">${iconTile(category.icon, category.accent)}${category.name}</h3>
        <p class="cat-card__text">${category.description}</p>
        <div class="cat-card__foot">
          ${count > 0
            ? html`<span class="cat-card__count">${count} ${pluralProjects(count)}</span>
                ${minPrice !== null && html`<span class="cat-card__price">від ${formatUah(minPrice)}</span>`}`
            : html`<span class="tag">Скоро</span>`}
          <span class="cat-card__arrow" aria-hidden="true">${icon('arrowRight', 18)}</span>
        </div>
      </a>
    </li>
  `;
}

/** Positive forecast in green; otherwise an honest break-even audience, never a green minus. */
function forecastLine(project: Project, netUah: number): SafeHtml {
  if (netUah > 0) {
    return html`<span class="project-card__forecast"
      ><strong>${formatSignedUah(netUah)}</strong> на місяць з ${formatInt(PREVIEW_TRAFFIC)} людей</span
    >`;
  }
  const be = breakEvenTraffic(project, RATES);
  return be === null
    ? html``
    : html`<span class="project-card__forecast">у плюс від ≈ ${formatInt(be)} людей на місяць</span>`;
}

export function projectCard(project: Project): SafeHtml {
  const soon = project.status === 'soon';
  const preview = forecast(project, PREVIEW_TRAFFIC, project.economics.payerRate, RATES);

  const artName = project.art ?? getCategory(project.categoryId)?.art ?? 'media';

  const body = html`
    <div class="project-card__main">
      <div class="project-card__thumb">${picture(artName, project.image)}</div>
      <div>
        <h3 class="project-card__title">${project.name} ${soon && html`<span class="tag">Скоро</span>`}</h3>
        <p class="project-card__text">${project.tagline}</p>
        <ul class="project-card__facts">
          <li>${icon('clock', 15)} Перший клієнт: ${formatDaysRange(project.firstClientDays)}</li>
          <li>${icon('calendar', 15)} ${formatMinutesRange(project.dailyMinutes)} на день</li>
        </ul>
      </div>
    </div>
    <div class="project-card__side">
      <span class="project-card__price">${formatUah(project.priceUah)}</span>
      ${!soon && forecastLine(project, preview.netUah)}
    </div>
    ${!soon && html`<span class="project-card__arrow" aria-hidden="true">${icon('arrowRight', 18)}</span>`}
  `;

  return soon
    ? html`<li><div class="project-card is-soon" style="--accent: ${project.accent}" aria-disabled="true">${body}</div></li>`
    : html`<li><a class="project-card" href="${href.project(project.id)}" style="--accent: ${project.accent}">${body}</a></li>`;
}
