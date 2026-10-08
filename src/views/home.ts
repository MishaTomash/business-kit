/**
 * Головна:
 *   1. Hero з живою сценою ботів
 *   2. Живі боти: спершу вибір напряму, потім панелі проєктів
 *   3. Що в коробці (бот + план + підтримка, план можна погортати)
 *   4. Шлях за 30 днів
 *   5. Що потрібно від вас
 *   6. Статистика (лише коли PROOF заповнений)
 *   7. FAQ
 *   8. Фінальний заклик
 * Калькулятора тут немає навмисно: гроші показуємо на сторінці проєкту.
 */

import type { Project } from '@/types';
import { CATEGORIES, PROJECTS, availableCount, minPriceIn } from '@/data';
import { DAILY_TIME, DEPLOY_TIME, JOURNEY, OFFERINGS, PROOF, REQUIREMENTS, TELEGRAM_URL } from '@/data/site';
import { html, qs, qsa, type SafeHtml } from '@/lib/dom';
import { icon } from '@/lib/icons';
import { pluralBots } from '@/lib/format';
import { mountRotator } from '@/lib/rotator';
import { shortLabel, themeStyle } from '@/lib/theme';
import { directionTile, productBand } from '@/components/cards';
import { faqMarkup } from '@/components/faq';
import { hasScreen, phone } from '@/components/phone';
import { sectionHead } from '@/components/ui';
import type { View } from './view';

/** Доступні проєкти в порядку напрямів. */
const live = (): Project[] => {
  const order = new Map(CATEGORIES.map((c, i) => [c.id, i] as const));
  return PROJECTS.filter((p) => p.status === 'available').sort(
    (a, b) => (order.get(a.categoryId) ?? 99) - (order.get(b.categoryId) ?? 99),
  );
};

function trustFacts(liveCount: number, workingCount: number): readonly string[] {
  const n = workingCount || liveCount;
  return [
    `${n} ${pluralBots(n)} уже ${n === 1 ? 'працює' : 'працюють'} у Telegram`,
    `Запуск ${DEPLOY_TIME}`,
    'План на перший місяць у комплекті',
  ];
}

function heroScene(all: readonly Project[]): SafeHtml {
  // У сцені лише боти, яким є що показати в телефоні (демо, гра або скріншот).
  const projects = all.filter(hasScreen);
  if (!projects.length) return html``;
  return html`
    <div class="scene" data-rot>
      <div class="scene__stack">
        ${projects.map((p) => html`<div class="scene__item" data-rot-item>${phone(p, 'lg')}</div>`)}
      </div>
      ${projects.length > 1 &&
      html`<div class="scene__tabs" role="group" aria-label="Показати екран бота">
        ${projects.map((p) => html`<button type="button" class="key" data-rot-tab aria-pressed="false" style="${themeStyle(p)}">${shortLabel(p)}</button>`)}
      </div>`}
    </div>
  `;
}

function botsSection(projects: readonly Project[]): SafeHtml {
  const active = CATEGORIES.filter((c) => availableCount(c.id) > 0);
  const soon = CATEGORIES.filter((c) => availableCount(c.id) === 0);
  return html`
    <section class="section section--paper bots" id="bots" aria-labelledby="bots-title">
      <div class="container">
        ${sectionHead(
          'Живі боти, які можна спробувати вже зараз',
          'Оберіть напрям, який вам ближчий, і нижче з’являться його боти. Кожен уже працює в Telegram, а ви отримуєте такого ж під своєю назвою разом із планом.',
          'bots-title',
        )}
        <div class="dirs" role="group" aria-label="Напрями" data-dirs>
          <button type="button" class="dir dir--all" data-filter="all" aria-pressed="false">
            <span class="dir__name">Усі напрями</span>
            <span class="dir__meta">${projects.length} ${pluralBots(projects.length)}</span>
          </button>
          ${active.map((c) => directionTile(c, availableCount(c.id), minPriceIn(c.id), pluralBots(availableCount(c.id))))}
        </div>
        ${soon.length > 0 &&
        html`<p class="dirs__soon">
          <span>Готуємо: ${soon.map((c) => c.name).join(', ')}.</span>
          <a href="${TELEGRAM_URL}" target="_blank" rel="noopener">Повідомити мене про запуск</a>
        </p>`}
        <p class="dirs__hint" data-dirs-hint hidden>Натисніть на напрям, і тут з’являться його боти з цінами та кнопкою «Спробувати бота».</p>
        <p class="sr-only" aria-live="polite" data-dirs-status></p>
      </div>
      <div class="bands" data-bands>${projects.map(productBand)}</div>
      <div class="container bands__back" data-dirs-back hidden>
        <a class="btn btn--line" href="#/" data-scroll="bots">Обрати інший напрям</a>
      </div>
    </section>
  `;
}

function boxSection(sample: Project | undefined): SafeHtml {
  return html`
    <section class="section box" id="box" aria-labelledby="box-title">
      <div class="container box__inner">
        <div class="box__text">
          ${sectionHead('У коробці не лише бот', 'Головне, що відрізняє нас від «просто бота»: план, що робити кожного дня.', 'box-title')}
          <ol class="box__list" data-stagger>
            ${OFFERINGS.map((o) => html`<li><h3>${o.title}</h3><p>${o.description}</p></li>`)}
          </ol>
        </div>
        ${sample &&
        html`<div class="book" data-book data-reveal>
          <div class="book__sheet book__sheet--back" aria-hidden="true"></div>
          <div class="book__sheet book__sheet--mid" aria-hidden="true"></div>
          <div class="book__page">
            <p class="book__title">План розвитку бота «${shortLabel(sample)}»</p>
            <div class="book__tabs" role="group" aria-label="Етапи плану">
              ${sample.plan.map(
                (ph, i) => html`<button type="button" class="book__tab" data-tab="${i}" aria-pressed="${i === 0 ? 'true' : 'false'}" aria-controls="phase-${i}">${ph.period}</button>`,
              )}
            </div>
            ${sample.plan.map(
              (ph, i) => html`<div class="book__phase" id="phase-${i}" data-panel="${i}" ${i === 0 ? '' : 'hidden'}>
                <h3>${ph.title}</h3>
                <ul>${ph.tasks.map((t) => html`<li>${t}</li>`)}</ul>
              </div>`,
            )}
            ${sample.channels[0] &&
            html`<div class="book__idea">
              <p class="book__idea-title">Ідея для відео з плану</p>
              <p><b>${sample.channels[0].title}.</b> ${sample.channels[0].description}</p>
            </div>`}
            <p class="book__note">Це короткий огляд. Повний план зі сценаріями й готовими текстами ви отримуєте разом із ботом.</p>
          </div>
        </div>`}
      </div>
    </section>
  `;
}

const journeySection = (): SafeHtml => html`
  <section class="section section--ink journey" id="journey" aria-labelledby="journey-title">
    <div class="container">
      ${sectionHead('Шлях за 30 днів', 'Від оплати до першого виводу Stars. Терміни взяті з плану й правил Telegram, а не з обіцянок.', 'journey-title')}
      <ol class="journey__line" data-stagger>
        ${JOURNEY.map(
          (s, i) => html`<li class="journey__step ${i === JOURNEY.length - 1 ? 'is-goal' : ''}">
            <span class="journey__when">${s.when}</span>
            <h3>${s.title}</h3>
            <p>${s.text}</p>
          </li>`,
        )}
      </ol>
    </div>
  </section>
`;

const youSection = (): SafeHtml => html`
  <section class="section section--paper you" id="you" aria-labelledby="you-title">
    <div class="container">
      ${sectionHead(
        'Що потрібно від вас',
        'Технічну частину робимо ми. Але бот заробляє тоді, коли про нього дізнаються люди, і це ваша частина роботи.',
        'you-title',
      )}
      <ul class="you__list" data-stagger>
        ${REQUIREMENTS.map((r) => html`<li><b>${r.value}</b><p>${r.text}</p></li>`)}
      </ul>
    </div>
  </section>
`;

const proofSection = (): SafeHtml =>
  PROOF.length > 0
    ? html`<section class="section proof" aria-labelledby="proof-title">
        <div class="container">
          ${sectionHead('Цифри наших ботів', 'Дані з адмін-панелей ботів, без округлень на свою користь.', 'proof-title')}
          <ul class="proof__list" data-stagger>${PROOF.map((s) => html`<li><b>${s.value}</b><span>${s.label}</span></li>`)}</ul>
        </div>
      </section>`
    : html``;

/**
 * «Спочатку напрям, потім боти»: до вибору видно лише плитки напрямів і підказку.
 * Без JS видно всі панелі, тож нічого не ховається назавжди.
 */
function mountDirections(root: HTMLElement): void {
  const group = root.querySelector<HTMLElement>('[data-dirs]');
  if (!group) return;
  const buttons = qsa<HTMLButtonElement>('[data-filter]', group);
  const bands = qsa<HTMLElement>('[data-bands] > .band', root);
  const status = qs('[data-dirs-status]', root);
  const hint = root.querySelector<HTMLElement>('[data-dirs-hint]');
  const section = root.querySelector<HTMLElement>('#bots');
  const back = root.querySelector<HTMLElement>('[data-dirs-back]');

  // Стартовий стан: жоден напрям не обрано, панелі сховані.
  bands.forEach((b) => (b.hidden = true));
  if (hint) hint.hidden = false;
  section?.classList.add('is-picking');

  const apply = (filter: string, scroll: boolean): void => {
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset['filter'] === filter)));
    let shown = 0;
    for (const band of bands) {
      const visible = filter === 'all' || band.dataset['cat'] === filter;
      band.hidden = !visible;
      // Чергування сторін рахуємо лише серед видимих панелей.
      band.classList.toggle('band--flip', visible && shown % 2 === 1);
      if (visible) shown += 1;
    }
    if (hint) hint.hidden = true;
    if (back) back.hidden = false;
    section?.classList.remove('is-picking');
    status.textContent = `Показано ${shown} ${pluralBots(shown)}`;
    if (scroll) {
      const first = bands.find((b) => !b.hidden);
      first?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  group.addEventListener('click', (e) => {
    const btn = (e.target as Element).closest<HTMLButtonElement>('[data-filter]');
    if (btn?.dataset['filter']) apply(btn.dataset['filter'], true);
  });
}

function mountBook(root: HTMLElement): void {
  const book = root.querySelector<HTMLElement>('[data-book]');
  book?.addEventListener('click', (e) => {
    const tab = (e.target as Element).closest<HTMLElement>('[data-tab]');
    if (!tab) return;
    qsa('[data-tab]', book).forEach((t) => t.setAttribute('aria-pressed', String(t === tab)));
    qsa('[data-panel]', book).forEach((p) => (p.hidden = p.dataset['panel'] !== tab.dataset['tab']));
  });
}

export function homeView(): View {
  const projects = live();
  const working = projects.filter((p) => p.botUrl).length;
  const sample = projects.find((p) => p.plan.length > 0);

  return {
    title: 'Business Kit: готові Telegram-боти з планом заробітку',
    markup: html`
      <section class="hero" aria-labelledby="hero-title">
        <div class="container hero__inner">
          <div class="hero__text">
            <h1 id="hero-title" class="hero__title" tabindex="-1">Свій бот у&nbsp;Telegram з&nbsp;планом заробітку</h1>
            <p class="hero__lead">
              Обираєте одного з живих ботів. Ми запускаємо його під вашою назвою, а ви працюєте за готовим планом
              <span class="nowrap">${DAILY_TIME || 'трохи часу'}</span> на день.
            </p>
            <div class="hero__cta">
              <a class="btn btn--main btn--lg" href="#/" data-scroll="bots">Обрати бота</a>
              <a class="btn btn--line btn--lg" href="#/" data-scroll="box">Як це працює</a>
            </div>
            <ul class="trust">${trustFacts(projects.length, working).map((f) => html`<li>${f}</li>`)}</ul>
          </div>
          ${heroScene(projects)}
        </div>
      </section>

      ${botsSection(projects)} ${boxSection(sample)} ${journeySection()} ${youSection()} ${proofSection()}

      <section class="section faq-section" id="faq" aria-labelledby="faq-title">
        <div class="container container--narrow">
          ${sectionHead('Питання перед стартом', undefined, 'faq-title')}
          ${faqMarkup()}
        </div>
      </section>

      <section class="final" aria-labelledby="final-title">
        <div class="container final__inner" data-reveal>
          <h2 id="final-title" class="final__title">Не знаєте, якого бота взяти?</h2>
          <p class="final__text">Напишіть, скільки часу маєте на день, і ми підкажемо, який бот вам підійде.</p>
          <a class="btn btn--star btn--lg" href="${TELEGRAM_URL}" target="_blank" rel="noopener">${icon('send', 20)} Написати в Telegram</a>
        </div>
      </section>
    `,
    mount: (root) => {
      const scene = root.querySelector<HTMLElement>('[data-rot]');
      const stop = scene ? mountRotator(scene) : undefined;
      mountDirections(root);
      mountBook(root);
      return stop;
    },
  };
}
