/** Напрям 3 «Стікерпак»: синє полотно Telegram, наліпки, жирні контури. Dela Gothic One + Golos Text. Звертання на «ти». */
import './fonts.css';
import './phone.css';
import './d3.css';
import {
  DEPLOY_TIME, LIVE, TELEGRAM_URL, dailyRange, formatDaysRange, formatUah, fromStars, html, mount, phone, reveal,
  rotator, shortName, siteHref, trustFacts, worldStyle, type Project, type SafeHtml,
} from './shared';

const card = (p: Project, i: number): SafeHtml => {
  const stars = fromStars(p);
  return html`<article class="card card--${i % 2 ? 'r' : 'l'}" style="${worldStyle(p)}" aria-labelledby="c-${p.id}" data-in>
    <div class="card__text">
      <h3 class="card__name" id="c-${p.id}">${shortName(p)}</h3>
      <p class="card__tag">${p.tagline}</p>
      <ul class="card__facts">
        ${stars && html`<li>Клієнти платять <b>${stars}</b></li>`}
        <li>Перший клієнт <b>≈ ${formatDaysRange(p.firstClientDays)}</b></li>
        <li>Сервер і підтримка <b>${formatUah(p.monthlyUah)}/міс</b></li>
      </ul>
      <div class="card__actions">
        <a class="btn btn--ink" href="${siteHref.project(p.id)}" aria-label="Детальніше про ${shortName(p)}">Детальніше</a>
        ${p.botUrl && html`<a class="btn btn--paper" href="${p.botUrl}" target="_blank" rel="noopener">Спробувати бота</a>`}
      </div>
    </div>
    <div class="card__visual">
      ${phone(p)}
      <p class="price" aria-label="Запуск під ключ ${formatUah(p.priceUah)}"><small>запуск</small>${formatUah(p.priceUah)}</p>
    </div>
  </article>`;
};

const needs: readonly { big: string; text: string }[] = [
  { big: dailyRange(), text: 'щодня на відео й відповіді клієнтам. Скільки саме, написано на сторінці кожного бота.' },
  { big: 'Телефон', text: 'Знімати, викладати й дивитися статистику бота можна з нього. Комп’ютер не потрібен.' },
  { big: 'Регулярність', text: 'План працює, коли робиш потроху щодня. Тиждень пропусків, і результат відкладається.' },
];

const markup = html`
  <header class="top">
    <div class="wrap top__in">
      <a class="logo" href="${siteHref.home()}" aria-label="Business Kit, на головну"><span class="logo__star" aria-hidden="true"></span>Business Kit</a>
      <a class="btn btn--small" href="${TELEGRAM_URL}" target="_blank" rel="noopener">Написати нам</a>
    </div>
  </header>

  <main>
    <section class="hero" aria-labelledby="hero-t">
      <div class="wrap hero__in">
        <div class="hero__text">
          <h1 id="hero-t">Бот під ключ. План у&nbsp;комплекті.</h1>
          <p class="hero__lead">
            Обираєш бота, який уже працює в Telegram. Ми запускаємо такого ж під твоєю назвою ${DEPLOY_TIME}, а ти
            розвиваєш його за планом.
          </p>
          <div class="hero__cta">
            <a class="btn btn--ink btn--big" href="#bots">Обрати бота</a>
            <a class="btn btn--paper btn--big" href="#you">Як це працює</a>
          </div>
          <ul class="stickers">${trustFacts().map((f, i) => html`<li class="sticker sticker--${i}">${f}</li>`)}</ul>
        </div>
        <div class="scene" data-rot>
          <div class="scene__stage">${LIVE.map((p) => html`<div class="scene__item" data-rot-item>${phone(p)}</div>`)}</div>
          <div class="scene__tabs" role="group" aria-label="Показати бота">
            ${LIVE.map((p) => html`<button type="button" class="chip" data-rot-tab style="${worldStyle(p)}">${shortName(p)}</button>`)}
          </div>
        </div>
      </div>
    </section>

    <section class="bots" id="bots" aria-labelledby="bots-t">
      <div class="wrap">
        <h2 class="h2" id="bots-t">Ось вони. Працюють просто зараз.</h2>
        <div class="cards">${LIVE.map(card)}</div>
      </div>
    </section>

    <section class="you" id="you" aria-labelledby="you-t">
      <div class="wrap">
        <h2 class="h2" id="you-t">Що потрібно від тебе</h2>
        <p class="you__lead">Технічну частину робимо ми. Але заробляє бот тоді, коли про нього дізнаються люди, і це вже твоя частина.</p>
        <ul class="needs">${needs.map((n, i) => html`<li class="need need--${i}" data-in><b>${n.big}</b><p>${n.text}</p></li>`)}</ul>
      </div>
    </section>

    <section class="final" aria-labelledby="final-t">
      <div class="wrap final__in">
        <h2 id="final-t">Не знаєш, якого бота взяти?</h2>
        <p>Напиши, скільки часу маєш на день, і ми підкажемо, який бот підійде.</p>
        <a class="btn btn--ink btn--big" href="${TELEGRAM_URL}" target="_blank" rel="noopener">Написати в Telegram</a>
      </div>
    </section>
  </main>

  <footer class="foot"><div class="wrap">Прогнози на сайті є моделлю, а не гарантією доходу. Інтерфейси з позначкою «Демо» намальовані кодом.</div></footer>
`;

const app = mount(markup);
rotator(app.querySelector<HTMLElement>('[data-rot]') ?? app);
reveal();
