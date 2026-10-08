/**
 * Сторінка проєкту відкривається в «кольоровому світі» продукту.
 *
 *   Hero у кольорі продукту: назва, користь, «Спробувати бота» / «Купити проєкт», великий телефон
 *   1. Ключові факти (перший клієнт, час на день, запуск, прогноз)
 *   2. Як бот заробляє + ціни для клієнтів
 *   3. Галерея скріншотів (свайп)
 *   4. Калькулятор
 *   5. Де шукати клієнтів
 *   6. План розвитку
 *   7. Куди рости далі
 *   8. Що входить і що від вас
 * Картка покупки: sticky на десктопі, нижня панель на телефоні.
 */

import type { Category, Project } from '@/types';
import { DEPLOY_TIME, PREVIEW_TRAFFIC, RATES, TELEGRAM_URL } from '@/data/site';
import { href } from '@/router';
import { breakEvenTraffic, forecast } from '@/lib/economics';
import { formatDaysRange, formatInt, formatMinutesRange, formatSignedUah, formatUah } from '@/lib/format';
import { html, qs, type SafeHtml } from '@/lib/dom';
import { icon, type IconName } from '@/lib/icons';
import { displayName, themeStyle } from '@/lib/theme';
import { calculatorMarkup, mountCalculator } from '@/components/calculator';
import { hasScreen, phone } from '@/components/phone';
import { backLink, liveBadge } from '@/components/ui';
import type { View } from './view';

/** Блок сторінки з заголовком. */
const block = (id: string, title: string, content: SafeHtml, lead?: string): SafeHtml => html`
  <section class="block" id="${id}" aria-labelledby="${id}-title" data-reveal>
    <h2 class="block__title" id="${id}-title">${title}</h2>
    ${lead && html`<p class="block__lead">${lead}</p>`}
    ${content}
  </section>
`;

const fact = (iconName: IconName, label: string, value: string, mod = ''): SafeHtml => html`
  <li class="fact ${mod}">
    <span class="fact__icon">${icon(iconName, 20)}</span>
    <span class="fact__label">${label}</span>
    <span class="fact__value">${value}</span>
  </li>
`;

function buyCard(p: Project, soon: boolean): SafeHtml {
  return html`
    <div class="buy">
      <div class="buy__head">
        <span class="buy__label">${soon ? 'Орієнтовна ціна запуску' : 'Запуск під ключ'}</span>
        <span class="buy__price">${formatUah(p.priceUah)}</span>
        <span class="buy__monthly">+ ${formatUah(p.monthlyUah)} на місяць за сервер і підтримку</span>
      </div>
      <ul class="buy__list">
        <li>${icon('check', 18)} Готовий бот під вашою назвою</li>
        <li>${icon('check', 18)} План розвитку з інструкціями</li>
        <li>${icon('check', 18)} Сервер і підтримка</li>
      </ul>
      <a class="btn btn--main btn--lg btn--block" href="${TELEGRAM_URL}" target="_blank" rel="noopener">
        ${soon ? 'Повідомити про запуск' : 'Купити проєкт'}
      </a>
      ${p.botUrl &&
      html`<a class="btn btn--line btn--block" href="${p.botUrl}" target="_blank" rel="noopener">${icon('send', 18)} Спробувати бота</a>`}
      ${!soon && html`<p class="buy__note">Запуск ${DEPLOY_TIME} після оплати. Бот і гроші належать вам.</p>`}
    </div>
  `;
}

export function projectView(p: Project, category: Category | undefined): View {
  const soon = p.status === 'soon';
  const preview = forecast(p, PREVIEW_TRAFFIC, p.economics.payerRate, RATES);
  const breakEven = breakEvenTraffic(p, RATES);
  const name = displayName(p);

  const facts = html`
    <ul class="facts" data-stagger>
      ${fact('clock', 'Перший клієнт', `≈ ${formatDaysRange(p.firstClientDays)}`)}
      ${fact('calendar', 'Час на день', formatMinutesRange(p.dailyMinutes))}
      ${fact('rocket', 'Запуск бота', DEPLOY_TIME)}
      ${preview.netUah > 0
        ? fact('coins', `Прибуток з ${formatInt(PREVIEW_TRAFFIC)} людей`, `${formatSignedUah(preview.netUah)} / міс`, 'fact--profit')
        : fact('coins', 'Вихід у плюс', breakEven === null ? 'див. калькулятор' : `від ≈ ${formatInt(breakEven)} людей/міс`)}
    </ul>
  `;

  const prices =
    p.customerPrices && p.customerPrices.length > 0
      ? html`<div class="prices">
          <h3 class="prices__title">Ціни для ваших клієнтів</h3>
          <ul class="prices__list">
            ${p.customerPrices.map(
              (c) => html`<li class="${c.label.toLowerCase().startsWith('безкоштов') ? 'is-free' : ''}"><span>${c.label}</span><b>${c.price}</b></li>`,
            )}
          </ul>
        </div>`
      : html``;

  const channels =
    p.channels.length > 0 &&
    block(
      'clients',
      'Де шукати клієнтів',
      html`<ul class="channels">
        ${p.channels.map(
          (c) => html`<li class="channel">
            <span class="channel__icon">${icon(c.icon, 22)}</span>
            <div>
              <h3>${c.title}</h3>
              <span class="tag ${c.cost === 'free' ? 'tag--free' : 'tag--star'}">${c.cost === 'free' ? 'Безкоштовно' : 'Платно, з прибутку'}</span>
              <p>${c.description}</p>
            </div>
          </li>`,
        )}
      </ul>`,
      'Почніть з безкоштовних способів. Платні підключайте, коли бот уже заробляє.',
    );

  const plan =
    p.plan.length > 0 &&
    block(
      'plan',
      'План розвитку',
      html`<ol class="plan">
          ${p.plan.map(
            (ph) => html`<li class="plan__phase">
              <span class="plan__period">${ph.period}</span>
              <h3 class="plan__title">${ph.title}</h3>
              <ul class="plan__tasks">${ph.tasks.map((t) => html`<li>${t}</li>`)}</ul>
            </li>`,
          )}
        </ol>
        <p class="plan__note">${icon('flag', 18)} Повний план з покроковими інструкціями, сценаріями й готовими текстами ви отримуєте разом з ботом.</p>`,
      'Короткий огляд. Ви знатимете, що робити кожного дня.',
    );

  const directions =
    p.directions.length > 0 &&
    block(
      'growth',
      'Куди рости далі',
      html`<ul class="growth">${p.directions.map((d) => html`<li><h3>${d.title}</h3><p>${d.description}</p></li>`)}</ul>`,
    );

  return {
    title: `${name}: готовий бот з планом | Business Kit`,
    markup: html`
      <article class="project" style="${themeStyle(p)}">
        <header class="phero">
          <div class="container phero__inner">
            <div class="phero__text">
              ${category ? backLink(href.category(category.id), category.name) : backLink(href.home(), 'Усі боти')}
              ${p.botUrl && !soon && liveBadge('Бот працює в Telegram зараз')}
              <h1 class="phero__title" tabindex="-1">${name} ${soon && html`<span class="tag">Скоро</span>`}</h1>
              <p class="phero__tagline">${p.tagline}</p>
              <div class="phero__actions">
                ${p.botUrl
                  ? html`<a class="btn btn--world btn--lg" href="${p.botUrl}" target="_blank" rel="noopener">${icon('send', 18)} Спробувати бота</a>
                      <a class="btn btn--line btn--lg" href="${TELEGRAM_URL}" target="_blank" rel="noopener">${soon ? 'Повідомити про запуск' : 'Купити проєкт'}</a>`
                  : html`<a class="btn btn--world btn--lg" href="${TELEGRAM_URL}" target="_blank" rel="noopener">${soon ? 'Повідомити про запуск' : 'Купити проєкт'}</a>`}
              </div>
              <p class="phero__price"><b>${formatUah(p.priceUah)}</b> запуск під ключ, далі ${formatUah(p.monthlyUah)} на місяць</p>
            </div>
            ${hasScreen(p) && html`<div class="phero__visual">${phone(p, 'lg')}</div>`}
          </div>
        </header>

        <div class="container project__layout">
          <div class="project__main">
            ${facts}

            ${block(
              'earn',
              'Як цей бот заробляє',
              html`<p class="block__text">${p.howItEarns}</p>${prices}`,
            )}

            ${p.screenshots &&
            p.screenshots.length > 0 &&
            block(
              'screens',
              'Як виглядає бот',
              html`<ul class="gallery" tabindex="0" aria-label="Скріншоти, гортайте вбік">
                ${p.screenshots.map(
                  (s) => html`<li><img src="${s.src}" alt="${s.alt}" width="590" height="1280" loading="lazy" decoding="async" /></li>`,
                )}
              </ul>`,
            )}

            ${!soon &&
            block(
              'income',
              'Скільки ви можете заробити',
              calculatorMarkup(p),
              'Оберіть, скільки людей плануєте привести за місяць. Почніть з малого: перші сотні людей цілком реальні.',
            )}

            ${channels} ${plan} ${directions}

            ${block(
              'includes',
              'Що входить',
              html`<ul class="includes">${p.includes.map((i) => html`<li>${icon('check', 18)}<span>${i}</span></li>`)}</ul>
                <p class="includes__you"><b>Від вас:</b> працювати за планом ${formatMinutesRange(p.dailyMinutes)} на день.</p>`,
            )}
          </div>

          <aside class="project__aside" aria-label="Ціна та покупка">${buyCard(p, soon)}</aside>
        </div>
      </article>

      <div class="buybar" style="${themeStyle(p)}">
        <div class="buybar__info">
          <span class="buybar__price">${formatUah(p.priceUah)}</span>
          <span class="buybar__note">+ ${formatUah(p.monthlyUah)}/міс</span>
        </div>
        <a class="btn btn--main" href="${TELEGRAM_URL}" target="_blank" rel="noopener">${soon ? 'Повідомити' : 'Купити проєкт'}</a>
      </div>
    `,
    mount: (root) => {
      document.body.classList.add('has-buybar');
      const stopCalc = soon ? undefined : mountCalculator(qs('#income', root), p);
      return () => {
        document.body.classList.remove('has-buybar');
        stopCalc?.();
      };
    },
  };
}
