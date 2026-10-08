/** Напрям 1 «Денний чат»: світла тема, мова Telegram-інтерфейсу, Unbounded + Onest. */
import './fonts.css';
import './phone.css';
import './d1.css';
import { OFFERINGS } from '@/data/site';
import { getCategory } from '@/data';
import {
  LIVE, TELEGRAM_URL, dailyRange, formatDaysRange, formatUah, fromStars, html, mount, phone, reveal, rotator,
  shortName, siteHref, trustFacts, worldStyle, type Project, type SafeHtml,
} from './shared';

const logo = html`<a class="logo" href="${siteHref.home()}" aria-label="Business Kit, на головну">
  <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
    <rect width="32" height="32" rx="10" fill="#1769AA" />
    <path d="M7 15.6l15.4-6.1c.8-.3 1.5.2 1.3 1.1l-2.6 12.1c-.2.9-.8 1.1-1.5.7l-4-3-2 1.9c-.2.2-.4.3-.8.3l.3-4.1 7.4-6.7c.3-.3-.1-.4-.5-.2l-9.2 5.8-3.9-1.2c-.9-.3-.9-.9.1-1.3z" fill="#fff" />
    <circle cx="25" cy="7" r="4.2" fill="#FFC233" />
  </svg>
  <span>Business Kit</span>
</a>`;

const band = (p: Project, i: number): SafeHtml => {
  const stars = fromStars(p);
  return html`<article class="band ${i % 2 ? 'band--flip' : ''}" style="${worldStyle(p)}" aria-labelledby="b-${p.id}">
    <div class="band__inner">
      <div class="band__text" data-in>
        ${p.botUrl && html`<p class="band__live"><span class="dot" aria-hidden="true"></span>Працює в Telegram зараз</p>`}
        <h3 class="band__name" id="b-${p.id}">${shortName(p)}</h3>
        <p class="band__tag">${p.tagline}</p>
        <dl class="band__facts">
          <div><dt>Запуск під ключ</dt><dd>${formatUah(p.priceUah)}<small>+ ${formatUah(p.monthlyUah)} на місяць</small></dd></div>
          ${stars && html`<div><dt>Ваші клієнти платять</dt><dd>${stars}</dd></div>`}
          <div><dt>Перший клієнт</dt><dd>≈ ${formatDaysRange(p.firstClientDays)}</dd></div>
        </dl>
        <div class="band__actions">
          <a class="btn btn--world" href="${siteHref.project(p.id)}" aria-label="Детальніше про ${shortName(p)}">Детальніше</a>
          ${p.botUrl && html`<a class="btn btn--line" href="${p.botUrl}" target="_blank" rel="noopener">Спробувати бота</a>`}
        </div>
        <p class="band__cat">Напрям: ${getCategory(p.categoryId)?.name ?? ''}</p>
      </div>
      <div class="band__visual" data-in>${phone(p)}</div>
    </div>
  </article>`;
};

const sample = LIVE[0];

const markup = html`
  <header class="top">
    <div class="wrap top__in">
      ${logo}
      <nav class="top__nav" aria-label="Основна навігація"><a href="#bots">Боти</a><a href="#box">Що в коробці</a></nav>
      <a class="btn btn--small" href="${TELEGRAM_URL}" target="_blank" rel="noopener">Написати нам</a>
    </div>
  </header>

  <main>
    <section class="hero" aria-labelledby="hero-t">
      <div class="wrap hero__in">
        <div class="hero__text">
          <h1 id="hero-t">Свій бот у&nbsp;Telegram з&nbsp;планом заробітку</h1>
          <p class="hero__lead">
            Обираєте одного з живих ботів. Ми запускаємо його під вашою назвою, а ви працюєте за готовим планом ${dailyRange()}
            на день.
          </p>
          <div class="hero__cta">
            <a class="btn btn--main" href="#bots">Обрати бота</a>
            <a class="btn btn--line" href="#box">Як це працює</a>
          </div>
          <ul class="trust">${trustFacts().map((f) => html`<li>${f}</li>`)}</ul>
        </div>

        <div class="scene" data-rot>
          <div class="scene__stack">
            ${LIVE.map((p) => html`<div class="scene__item" data-rot-item>${phone(p)}</div>`)}
          </div>
          <div class="scene__tabs" role="group" aria-label="Показати бота">
            ${LIVE.map((p) => html`<button type="button" class="kbd" data-rot-tab style="${worldStyle(p)}">${shortName(p)}</button>`)}
          </div>
        </div>
      </div>
    </section>

    <section class="bots" id="bots" aria-labelledby="bots-t">
      <div class="wrap">
        <h2 class="h2" id="bots-t">Живі боти, які можна спробувати вже зараз</h2>
        <p class="sub">Кожен уже працює в Telegram. Ви отримуєте такого ж бота під своєю назвою разом із планом, як його розвивати.</p>
      </div>
      ${LIVE.map(band)}
    </section>

    <section class="box" id="box" aria-labelledby="box-t">
      <div class="wrap box__in">
        <div class="box__text">
          <h2 class="h2" id="box-t">У коробці не лише бот</h2>
          <ol class="box__list">
            ${OFFERINGS.map((o) => html`<li><h3>${o.title}</h3><p>${o.description}</p></li>`)}
          </ol>
        </div>
        ${sample &&
        html`<div class="book" data-book style="${worldStyle(sample)}">
          <div class="book__page book__page--back" aria-hidden="true"></div>
          <div class="book__page book__page--mid" aria-hidden="true"></div>
          <div class="book__page">
            <p class="book__title">План розвитку: ${shortName(sample)}</p>
            <div class="book__tabs" role="tablist" aria-label="Етапи плану">
              ${sample.plan.map(
                (ph, i) => html`<button type="button" role="tab" class="book__tab" aria-selected="${i === 0 ? 'true' : 'false'}" data-tab="${i}">${ph.period}</button>`,
              )}
            </div>
            ${sample.plan.map(
              (ph, i) => html`<div class="book__phase" role="tabpanel" data-panel="${i}" ${i === 0 ? '' : 'hidden'}>
                <h3>${ph.title}</h3>
                <ul>${ph.tasks.map((t) => html`<li>${t}</li>`)}</ul>
              </div>`,
            )}
            ${sample.channels[0] &&
            html`<div class="book__idea">
              <p class="book__idea-h">Ідея для відео з плану</p>
              <p><b>${sample.channels[0].title}.</b> ${sample.channels[0].description}</p>
            </div>`}
          </div>
        </div>`}
      </div>
    </section>
  </main>

  <footer class="foot"><div class="wrap">Прогнози на сайті є моделлю, а не гарантією доходу. Інтерфейси з позначкою «Демо» намальовані кодом.</div></footer>
`;

const app = mount(markup);
rotator(app.querySelector<HTMLElement>('[data-rot]') ?? app);
reveal();

const book = app.querySelector<HTMLElement>('[data-book]');
book?.addEventListener('click', (e) => {
  const tab = (e.target as Element).closest<HTMLElement>('[data-tab]');
  if (!tab) return;
  const k = tab.dataset['tab'];
  book.querySelectorAll('[data-tab]').forEach((t) => t.setAttribute('aria-selected', String(t === tab)));
  book.querySelectorAll<HTMLElement>('[data-panel]').forEach((p) => (p.hidden = p.dataset['panel'] !== k));
});
