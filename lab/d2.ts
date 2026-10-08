/** Напрям 2 «Планер»: сторінка зошита в клітинку, план як головний герой. Montserrat Alternates + Manrope. */
import './fonts.css';
import './phone.css';
import './d2.css';
import {
  DEPLOY_TIME, LIVE, TELEGRAM_URL, dailyRange, formatDaysRange, formatUah, fromStars, freeTier, html, mount, phone,
  reveal, rotator, shortName, siteHref, trustFacts, worldStyle, type Project, type SafeHtml,
} from './shared';

const heroPair = (p: Project): SafeHtml => {
  const week = p.plan[0];
  return html`<div class="pair" data-rot-item style="${worldStyle(p)}">
    <div class="sheet">
      <p class="sheet__head"><span>${week?.period ?? 'Тиждень 1'}</span><b>${shortName(p)}</b></p>
      <p class="sheet__title">${week?.title ?? ''}</p>
      <ul class="sheet__list">${(week?.tasks ?? []).map((t, i) => html`<li style="--k:${i}">${t}</li>`)}</ul>
      <p class="sheet__foot">Зі справжнього плану, який іде разом із ботом</p>
    </div>
    <div class="pair__phone">${phone(p)}</div>
  </div>`;
};

const section = (p: Project, i: number): SafeHtml => {
  const stars = fromStars(p);
  const free = freeTier(p);
  return html`<article class="sec sec--${i % 3}" style="${worldStyle(p)}" aria-labelledby="s-${p.id}">
    <span class="sec__tab" aria-hidden="true">${shortName(p)}</span>
    <div class="sec__in">
      <div class="sec__text" data-in>
        <h3 class="sec__name" id="s-${p.id}">${shortName(p)}</h3>
        <p class="sec__tag">${p.tagline}</p>
        <ul class="sec__facts">
          <li><span>Запуск під ключ</span><b>${formatUah(p.priceUah)}</b><small>і ${formatUah(p.monthlyUah)} на місяць за сервер</small></li>
          ${stars && html`<li><span>Клієнти платять</span><b>${stars}</b>${free && html`<small>безкоштовно: ${free}</small>`}</li>`}
          <li><span>Перший клієнт</span><b>≈ ${formatDaysRange(p.firstClientDays)}</b><small>якщо йти за планом</small></li>
        </ul>
        <div class="sec__actions">
          <a class="btn btn--world" href="${siteHref.project(p.id)}" aria-label="Детальніше про ${shortName(p)}">Детальніше</a>
          ${p.botUrl && html`<a class="btn btn--ghost" href="${p.botUrl}" target="_blank" rel="noopener">Спробувати бота</a>`}
        </div>
      </div>
      <div class="sec__visual" data-in>${phone(p)}</div>
    </div>
  </article>`;
};

const ref = LIVE[0];
const steps: readonly { when: string; title: string; text: string }[] = ref
  ? [
      { when: 'День 0', title: 'Обираєте бота', text: 'Пишете нам у Telegram, домовляємося про назву й аватар.' },
      { when: DEPLOY_TIME, title: 'Бот запущено', text: 'Бот працює під вашою назвою, у вас план і доступ до адмін-команд.' },
      { when: ref.plan[0]?.period ?? 'Тиждень 1', title: ref.plan[0]?.title ?? '', text: (ref.plan[0]?.tasks ?? []).join('. ') + '.' },
      { when: `≈ ${formatDaysRange(ref.firstClientDays)}`, title: 'Перший клієнт', text: 'Орієнтир за планом. Перша оплата в Stars приходить на баланс вашого бота.' },
      { when: ref.plan[1]?.period ?? 'Тижні 2–4', title: ref.plan[1]?.title ?? '', text: (ref.plan[1]?.tasks ?? []).join('. ') + '.' },
      { when: 'Від 21 дня', title: 'Перший вивід Stars', text: 'За правилами Telegram зароблені Stars виводяться через 21 день, від 1 000 ⭐, через Fragment.' },
    ]
  : [];

const markup = html`
  <header class="top">
    <div class="wrap top__in">
      <a class="logo" href="${siteHref.home()}" aria-label="Business Kit, на головну"><span class="logo__mark" aria-hidden="true">BK</span>Business Kit</a>
      <nav class="top__nav" aria-label="Основна навігація"><a href="#bots">Боти</a><a href="#path">Шлях за 30 днів</a></nav>
      <a class="btn btn--small" href="${TELEGRAM_URL}" target="_blank" rel="noopener">Написати нам</a>
    </div>
  </header>

  <main>
    <section class="hero" aria-labelledby="hero-t">
      <div class="wrap hero__in">
        <div class="hero__text">
          <h1 id="hero-t">Бот готовий. План на&nbsp;місяць теж.</h1>
          <p class="hero__lead">
            Ми запускаємо для вас копію бота, що вже працює в Telegram, і даємо план по днях: що зняти, де викласти, що
            відповісти клієнту. Від вас ${dailyRange()} на день.
          </p>
          <div class="hero__cta">
            <a class="btn btn--main" href="#bots">Обрати бота</a>
            <a class="btn btn--ghost" href="#path">Як це працює</a>
          </div>
          <ul class="trust">${trustFacts().map((f) => html`<li>${f}</li>`)}</ul>
        </div>
        <div class="scene" data-rot>
          <div class="scene__stage">${LIVE.map(heroPair)}</div>
          <div class="scene__tabs" role="group" aria-label="Показати бота">
            ${LIVE.map((p) => html`<button type="button" class="tabbtn" data-rot-tab style="${worldStyle(p)}">${shortName(p)}</button>`)}
          </div>
        </div>
      </div>
    </section>

    <section class="bots" id="bots" aria-labelledby="bots-t">
      <div class="wrap bots__head">
        <h2 class="h2" id="bots-t">Три розділи: три боти, які вже працюють</h2>
        <p class="sub">Відкрийте будь-якого в Telegram і спробуйте як клієнт. Такого ж ви отримаєте під своєю назвою.</p>
      </div>
      ${LIVE.map(section)}
    </section>

    <section class="path" id="path" aria-labelledby="path-t">
      <div class="wrap">
        <h2 class="h2" id="path-t">Шлях за 30 днів</h2>
        <p class="sub">На прикладі бота «${ref ? shortName(ref) : ''}». Терміни взяті з плану й правил Telegram, а не з обіцянок.</p>
        <ol class="line">
          ${steps.map(
            (s, i) => html`<li class="line__step" style="--k:${i}" data-in>
              <span class="line__when">${s.when}</span>
              <h3>${s.title}</h3>
              <p>${s.text}</p>
            </li>`,
          )}
        </ol>
      </div>
    </section>
  </main>

  <footer class="foot"><div class="wrap">Прогнози на сайті є моделлю, а не гарантією доходу. Інтерфейси з позначкою «Демо» намальовані кодом.</div></footer>
`;

const app = mount(markup);
rotator(app.querySelector<HTMLElement>('[data-rot]') ?? app, 6000);
reveal();
