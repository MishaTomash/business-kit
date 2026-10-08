/**
 * Етап 3: дизайн-система «Денний чат» на справжніх стилях і компонентах сайту.
 * Відкрити: npm run dev → /lab/system.html. Папка lab/ не потрапляє в збірку сайту.
 */
import '../src/styles/index.css';
import { CATEGORIES, PROJECTS, availableCount, minPriceIn } from '@/data';
import { html } from '@/lib/dom';
import { icon } from '@/lib/icons';
import { pluralBots } from '@/lib/format';
import { directionTile, productBand, projectCard } from '@/components/cards';
import { phone } from '@/components/phone';
import { iconTile, liveBadge, logoMark } from '@/components/ui';

const live = PROJECTS.filter((p) => p.status === 'available');

const swatches: readonly [string, string, string][] = [
  ['--c-sky', '#E8F1FA', 'Тло сторінки'],
  ['--c-paper', '#FFFFFF', 'Картки, світлі секції'],
  ['--c-ink', '#0D1B2A', 'Текст, темні секції'],
  ['--c-muted', '#44566B', 'Другорядний текст, 6.4 : 1 на небі'],
  ['--c-tg-deep', '#1769AA', 'Кнопки, посилання, 5.6 : 1 з білим'],
  ['--c-tg', '#2AABEE', 'Синій Telegram: декор'],
  ['--c-star', '#FFC233', 'Золото Stars: плашки з темним текстом'],
  ['--c-ok', '#157F43', '«Працює», «безкоштовно»'],
];

const type: readonly [string, string, string][] = [
  ['h1', 'var(--fs-h1)', 'Свій бот у Telegram'],
  ['display', 'var(--fs-display)', 'Слововир'],
  ['h2', 'var(--fs-h2)', 'Живі боти'],
  ['h3', 'var(--fs-h3)', 'План розвитку'],
];

const sec = (title: string, body: ReturnType<typeof html>, note?: string) => html`
  <section class="ds-sec">
    <div class="container">
      <h2 class="h2">${title}</h2>
      ${note && html`<p class="section-head__lead">${note}</p>`}
      <div class="ds-body">${body}</div>
    </div>
  </section>`;

const app = document.getElementById('app');
if (app) {
  app.innerHTML = html`
    <style>
      .ds-sec { padding: 56px 0; border-bottom: 1px solid var(--c-line); }
      .ds-body { margin-top: 28px; display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-start; }
      .ds-sw { width: 200px; border-radius: 16px; overflow: hidden; background: #fff; }
      .ds-sw i { display: block; height: 72px; }
      .ds-sw div { padding: 10px 12px; font-size: 15px; line-height: 1.35; }
      .ds-type { width: 100%; display: grid; gap: 14px; }
      .ds-type p { display: flex; gap: 20px; align-items: baseline; }
      .ds-type small { width: 90px; flex: none; font: 600 15px var(--f-text); color: var(--c-muted); }
      .ds-row { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; width: 100%; }
      .ds-dark { padding: 20px; border-radius: 20px; background: var(--c-ink); color: #fff; }
      .ds-full { width: 100%; }
      .ds-tok { width: 100%; font: 15px/1.6 ui-monospace, monospace; white-space: pre-wrap; background: #fff; padding: 16px; border-radius: 16px; }
    </style>
    <section class="hero"><div class="container">
      <a class="logo" href="../">${logoMark(40)}<span>Business Kit</span></a>
      <h1 class="hero__title" style="margin-top:24px">Дизайн-система «Денний чат»</h1>
      <p class="hero__lead">Токени в src/styles/tokens.css, компоненти в src/components. Кольори продуктів задаються в даних (project.theme).</p>
    </div></section>

    ${sec('Знак', html`<div class="ds-row">${[16, 24, 32, 48, 64, 96].map((s) => logoMark(s))}<span class="logo" style="font-size:1.4rem">${logoMark(44)}Business Kit</span></div>`, 'Відкрита коробка («кит»), з якої вилітає зірка Telegram Stars. Читається від 16 px (фавікон).')}

    ${sec('Кольори', html`${swatches.map(([t, hex, use]) => html`<div class="ds-sw"><i style="background:${hex}"></i><div><b>${t}</b><br />${hex}<br />${use}</div></div>`)}`, 'Усі пари тексту перевірені на WCAG AA.')}

    ${sec('Колірні світи продуктів', html`${live.map((p) => phone(p, 'md'))}`, 'project.theme: bg, ink, accent, onAccent. Без theme кольори виводяться з accent, текст обирається за контрастом.')}

    ${sec('Типографіка', html`<div class="ds-type">
      ${type.map(([n, size, sample]) => html`<p><small>${n}</small><span style="font:800 ${size}/1.02 var(--f-display);letter-spacing:-0.045em">${sample}</span></p>`)}
      <p><small>Лід</small><span style="font-size:var(--fs-lg);color:var(--c-muted)">Обираєте одного з живих ботів. Ґанок, їжак, з’їв, Євген, Ївга.</span></p>
      <p><small>Текст</small><span>Основний текст Onest 17 px. Найменший текст на сайті 16 px. Апостроф: п’ятниця, комп’ютер.</span></p>
    </div>`, 'Unbounded (заголовки) і Onest (текст), обидва OFL, лише латиниця й кирилиця.')}

    ${sec('Кнопки', html`<div class="ds-row">
        <a class="btn btn--main btn--lg" href="#">Обрати бота</a>
        <a class="btn btn--line btn--lg" href="#">Як це працює</a>
        <a class="btn btn--ink" href="#">${icon('send', 18)} Написати нам</a>
        <a class="btn btn--main btn--sm" href="#">Мала</a>
      </div>
      <div class="ds-dark ds-row"><a class="btn btn--star btn--lg" href="#">${icon('send', 18)} Написати в Telegram</a><a class="btn btn--line" href="#">Контурна на темному</a></div>`)}

    ${sec('Бейджі й атоми', html`<div class="ds-row">
      ${liveBadge()}
      <span class="tag">Скоро</span><span class="tag tag--free">Безкоштовно</span><span class="tag tag--star">Платно, з прибутку</span>
      ${CATEGORIES.map((c) => iconTile(c.icon, c.accent))}
      <button class="key" aria-pressed="true" style="--w-bg:#1747C9;--w-ink:#fff">Вкладка активна</button><button class="key" aria-pressed="false">Вкладка</button>
    </div>`)}

    ${sec('Вибір напряму', html`<div class="dirs ds-full">
      <button type="button" class="dir dir--all" aria-pressed="true"><span class="dir__name">Усі напрями</span><span class="dir__meta">${live.length} ${pluralBots(live.length)}</span></button>
      ${CATEGORIES.filter((c) => availableCount(c.id) > 0).map((c) => directionTile(c, availableCount(c.id), minPriceIn(c.id), pluralBots(availableCount(c.id))))}
    </div>`)}

    ${sec('Картка проєкту (сторінка напряму)', html`<ul class="pcards ds-full">${[live[0], PROJECTS.find((p) => p.status === 'soon')].filter((p) => p !== undefined).map(projectCard)}</ul>`)}
  <div style="padding-top:56px"><div class="container"><h2 class="h2">Панель продукту</h2></div><div class="bands" style="margin-top:28px">${live[1] ? productBand(live[1], 0) : ''}</div></div>

  ${sec('Рух', html`<p class="ds-tok">--ease-out: cubic-bezier(.2,.8,.2,1)  появи, перемикання
--ease-pop: cubic-bezier(.2,.9,.3,1.2)   «підскок» повідомлень у чаті
--dur-fast 160ms · --dur-base 320ms · --dur-slow 700ms
Лише transform і opacity. prefers-reduced-motion вимикає все.</p>
<p class="ds-tok">Радіуси: 10 вкладки · 16 кнопки · 24 картки · 32 панелі · 999 пігулки
Відступи: 8 · 12 · 16 · 24 · 32 · 48 · секції clamp(64–120 px) · поля clamp(16–40 px)
Тіні: --sh-card (картки) · --sh-phone (телефони) · --sh-btn (головна кнопка)</p>`)}
  `.value;
  document.querySelectorAll('[data-reveal],[data-stagger]').forEach((e) => e.classList.add('is-visible'));
}
