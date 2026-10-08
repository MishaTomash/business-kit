/**
 * Project page: everything a beginner needs to decide.
 *
 *   1. What it is & key facts (first client, time per day, launch, payback)
 *   2. How the bot earns money
 *   3. Calculator: how much YOU can earn
 *   4. Where to find clients
 *   5. Development plan preview (the full plan ships with the bot)
 *   6. Growth directions
 *   7. What's included
 *
 * A sticky price card (desktop) / bottom buy bar (mobile) keeps the CTA
 * one tap away at every point of the page.
 */

import type { Category, Project } from '@/types';
import { DEPLOY_TIME, PREVIEW_TRAFFIC, RATES, TELEGRAM_URL } from '@/data/site';
import { href } from '@/router';
import { breakEvenTraffic, forecast } from '@/lib/economics';
import { formatDaysRange, formatInt, formatMinutesRange, formatSignedUah, formatUah } from '@/lib/format';
import { html, qs, type SafeHtml } from '@/lib/dom';
import { icon, type IconName } from '@/lib/icons';
import { calculatorMarkup, mountCalculator } from '@/components/calculator';
import { backLink, iconTile } from '@/components/ui';
import { crosswordPhone, phone } from '@/components/visuals';
import type { View } from './view';

/** A titled block inside the project page. Empty content → nothing rendered. */
const block = (id: string, title: string, content: SafeHtml, lead?: string): SafeHtml => html`
  <section class="block" id="${id}" aria-labelledby="${id}-title" data-reveal>
    <h2 class="block__title" id="${id}-title">${title}</h2>
    ${lead && html`<p class="block__lead">${lead}</p>`}
    ${content}
  </section>
`;

const fact = (iconName: IconName, label: string, value: string, highlight = false): SafeHtml => html`
  <li class="fact ${highlight ? 'fact--profit' : ''}">
    <span class="fact__icon">${icon(iconName, 18)}</span>
    <span class="fact__label">${label}</span>
    <span class="fact__value">${value}</span>
  </li>
`;

function buyCard(project: Project, soon: boolean): SafeHtml {
  return html`
    <div class="buy-card">
      <span class="buy-card__label">${soon ? 'Орієнтовна ціна запуску' : 'Запуск під ключ'}</span>
      <span class="buy-card__price">${formatUah(project.priceUah)}</span>
      <span class="buy-card__monthly">+ ${formatUah(project.monthlyUah)} на місяць за сервер і підтримку</span>

      <ul class="buy-card__list">
        <li>${icon('check', 16)} Готовий бот під ваш бренд</li>
        <li>${icon('check', 16)} План розвитку з інструкціями</li>
        <li>${icon('check', 16)} Сервер і підтримка</li>
      </ul>

      <a class="btn btn--primary btn--lg btn--block" href="${TELEGRAM_URL}" target="_blank" rel="noopener" data-magnetic="0.15">
        ${soon ? 'Повідомити про запуск' : 'Купити проєкт'}
      </a>
      ${project.botUrl &&
      html`<a class="btn btn--ghost btn--block buy-card__try" href="${project.botUrl}" target="_blank" rel="noopener">
        ${icon('send', 16)} Спробувати бота
      </a>`}
      ${!soon && html`<span class="buy-card__note">Запуск ${DEPLOY_TIME} після оплати</span>`}
    </div>
  `;
}

export function projectView(project: Project, category: Category | undefined): View {
  const soon = project.status === 'soon';
  const preview = forecast(project, PREVIEW_TRAFFIC, project.economics.payerRate, RATES);
  const breakEven = breakEvenTraffic(project, RATES);

  const facts = html`
    <ul class="facts" data-stagger>
      ${fact('clock', 'Перший клієнт', `≈ ${formatDaysRange(project.firstClientDays)}`)}
      ${fact('calendar', 'Час на день', formatMinutesRange(project.dailyMinutes))}
      ${fact('rocket', 'Запуск бота', DEPLOY_TIME)}
      ${preview.netUah > 0
        ? fact('coins', `Прибуток з ${formatInt(PREVIEW_TRAFFIC)} людей`, `${formatSignedUah(preview.netUah)} / міс`, true)
        : fact('coins', 'Вихід у плюс', breakEven === null ? 'див. калькулятор' : `від ≈ ${formatInt(breakEven)} людей/міс`)}
    </ul>
  `;

  const channels =
    project.channels.length > 0 &&
    block(
      'clients',
      'Де шукати клієнтів',
      html`<ul class="channels">
        ${project.channels.map(
          (c) => html`
            <li class="channel">
              <span class="channel__icon">${icon(c.icon, 20)}</span>
              <div>
                <h3>${c.title} <span class="tag ${c.cost === 'free' ? 'tag--free' : ''}">${c.cost === 'free' ? 'Безкоштовно' : 'Платно'}</span></h3>
                <p>${c.description}</p>
              </div>
            </li>
          `,
        )}
      </ul>`,
      'Почніть з безкоштовних способів. Платні підключайте, коли бот уже заробляє.',
    );

  const plan =
    project.plan.length > 0 &&
    block(
      'plan',
      'План розвитку',
      html`<ol class="plan">
        ${project.plan.map(
          (phase) => html`
            <li class="plan__phase">
              <span class="plan__period">${phase.period}</span>
              <h3 class="plan__title">${phase.title}</h3>
              <ul class="plan__tasks">
                ${phase.tasks.map((t) => html`<li>${icon('check', 15)}<span>${t}</span></li>`)}
              </ul>
            </li>
          `,
        )}
      </ol>
      <p class="plan__note">${icon('flag', 16)} Повний план з покроковими інструкціями, сценаріями й готовими текстами ви отримуєте разом з ботом.</p>`,
      'Короткий огляд. Ви знатимете, що робити кожного дня.',
    );

  const directions =
    project.directions.length > 0 &&
    block(
      'growth',
      'Куди рости далі',
      html`<ul class="directions">
        ${project.directions.map((d) => html`<li><h3>${d.title}</h3><p>${d.description}</p></li>`)}
      </ul>`,
    );

  return {
    title: `${project.name} | Business Kit`,
    markup: html`
      <article class="page container project" style="--accent: ${project.accent}">
        <div class="project__glow" aria-hidden="true"></div>
        ${category ? backLink(href.category(category.id), category.name) : backLink(href.home(), 'Усі напрями')}

        <header class="project__head" data-reveal>
          ${iconTile(project.icon, project.accent, 'lg')}
          <div>
            <h1 class="project__title" tabindex="-1">${project.name} ${soon && html`<span class="tag">Скоро</span>`}</h1>
            <p class="project__tagline">${project.tagline}</p>
            ${project.botUrl &&
            html`<a class="project__live" href="${project.botUrl}" target="_blank" rel="noopener">
              <span class="pulse-dot" aria-hidden="true"></span> Бот працює: відкрити в Telegram ${icon('arrowRight', 14)}
            </a>`}
          </div>
        </header>

        <div class="project__layout">
          <div class="project__main">
            ${facts}

            ${block(
              'earn',
              'Як цей бот заробляє',
              html`<div class="earn ${project.demo || project.image || project.screen ? 'earn--with-visual' : ''}">
                <div>
                  <p class="block__text">${project.howItEarns}</p>
                  ${project.customerPrices &&
                  project.customerPrices.length > 0 &&
                  html`<div class="prices">
                    <h3 class="prices__title">Ціни для ваших клієнтів</h3>
                    <dl class="prices__list">
                      ${project.customerPrices.map((p) => html`<div><dt>${p.label}</dt><dd>${p.price}</dd></div>`)}
                    </dl>
                  </div>`}
                  ${(project.demo || project.image || project.screen) &&
                  html`<p class="earn__caption">${icon('arrowRight', 14)} ${project.screen ? 'Так гру бачить ваш гравець' : 'Так покупку бачить ваш клієнт'}</p>`}
                </div>
                ${project.image
                  ? html`<img class="earn__img" src="${project.image}" alt="Скріншот бота ${project.name}" loading="lazy" decoding="async" />`
                  : project.screen === 'crossword'
                    ? html`<div class="earn__phone">${crosswordPhone(project.name.split(':')[0] ?? project.name)}</div>`
                    : project.demo && html`<div class="earn__phone">${phone(project.demo, project.name, project.icon)}</div>`}
              </div>`,
            )}

            ${project.screenshots &&
            project.screenshots.length > 0 &&
            block(
              'screens',
              'Як виглядає бот',
              html`<ul class="gallery">
                ${project.screenshots.map(
                  (shot) => html`<li><img src="${shot.src}" alt="${shot.alt}" loading="lazy" decoding="async" /></li>`,
                )}
              </ul>`,
            )}

            ${!soon &&
            block(
              'income',
              'Скільки ви можете заробити',
              calculatorMarkup(project),
              'Оберіть, скільки людей плануєте привести за місяць. Почніть з малого: перші сотні людей цілком реальні.',
            )}

            ${channels} ${plan} ${directions}

            ${block(
              'includes',
              'Що входить',
              html`<ul class="includes">
                  ${project.includes.map((i) => html`<li>${icon('check', 16)}<span>${i}</span></li>`)}
                </ul>
                <p class="includes__you">
                  <strong>Від вас:</strong> працювати за планом ${formatMinutesRange(project.dailyMinutes)} на день.
                </p>`,
            )}
          </div>

          <aside class="project__aside" aria-label="Ціна та покупка">${buyCard(project, soon)}</aside>
        </div>
      </article>

      <!-- Mobile buy bar -->
      <div class="buybar">
        <div>
          <span class="buybar__price">${formatUah(project.priceUah)}</span>
          <span class="buybar__note">+ ${formatUah(project.monthlyUah)}/міс</span>
        </div>
        <a class="btn btn--primary" href="${TELEGRAM_URL}" target="_blank" rel="noopener">
          ${soon ? 'Повідомити' : 'Купити проєкт'}
        </a>
      </div>
    `,
    mount: (root) => (soon ? undefined : mountCalculator(qs('#income', root), project)),
  };
}
