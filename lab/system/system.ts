/** Огляд дизайн-системи «ДНК»: токени, шрифти, кнопки, чіпи, бейджі, логотип. Не входить у збірку сайту. */
import '@/styles/index.css';
import './system.css';
import { html, type SafeHtml } from '@/lib/dom';
import { contrast } from '@/lib/theme';
import { tiles } from '@/lib/tiles';
import { ARROW_ICON, badge, button, chip, tlink } from '@/components/ui';
import { BRAND } from '@/data/site';
import { GAMES } from '@/data';
import { GENRE_LABELS } from '@/data/genres';
import { fingerprintStrip, gameFingerprint } from '@/components/fingerprint';

type Swatch = readonly [name: string, token: string, hex: string, role: string, on: string];

const dark: readonly Swatch[] = [
  ['Ґрунт', '--ground', '#0E1714', 'основне тло', '#F1ECE1'],
  ['Шар', '--layer', '#15221E', 'секції-вставки, картки', '#F1ECE1'],
  ['Слонова кістка', '--ivory', '#F1ECE1', 'основний текст на темному', '#0E1714'],
  ['Слонова кістка м’яка', '--ivory-soft', '#C9CFC6', 'вступні абзаци', '#0E1714'],
  ['Лишайник', '--lichen', '#A9B3AA', 'другорядний текст', '#0E1714'],
  ['Корал', '--coral', '#EE8466', 'кнопки, активні стани', '#0E1714'],
  ['Зірка', '--star', '#F0B44C', 'лише ★ і суми в зірках', '#0E1714'],
];

const light: readonly Swatch[] = [
  ['Папір', '--paper', '#F1ECE1', 'тло світлої секції', '#0E1714'],
  ['Картка', '--paper-card', '#FAF7F0', 'картки на світлому', '#0E1714'],
  ['Чорнило', '--ink', '#0E1714', 'текст на світлому', '#F1ECE1'],
  ['Чорнило приглушене', '--ink-muted', '#4E5A53', 'другорядний на світлому', '#F1ECE1'],
  ['Корал-текст', '--coral-text', '#A63E26', 'корал як текст на світлому', '#F1ECE1'],
  ['Зірка на світлому', '--star-on-light', '#8F5B00', '★ на світлому тлі', '#F1ECE1'],
];

const genres: readonly Swatch[] = [
  ['Слова', '--genre-slova', '#E9D8A6', 'slova', '#0E1714'],
  ['Вікторини', '--genre-viktoryny', '#A9C79A', 'viktoryny', '#0E1714'],
  ['Головоломки', '--genre-holovolomky', '#E0A9B8', 'holovolomky', '#0E1714'],
  ['Пам’ять і реакція', '--genre-pamiat', '#D6B98C', 'pamiat', '#0E1714'],
  ['З друзями', '--genre-druzi', '#9FC1CF', 'druzi', '#0E1714'],
];

/** Контраст кольору з тлом, на якому він живе: темні кольори — зі Слоновою кісткою, світлі — з Ґрунтом. */
const ratio = (a: string, b: string): string => `${contrast(a, b).toFixed(2).replace('.', ',')} : 1`;

function swatches(list: readonly Swatch[]): SafeHtml {
  return html`<ul class="sys-colors">
    ${list.map(
      ([n, v, hex, role, on]) =>
        html`<li><span class="sys-chip" style="background:var(${v})"></span><b>${n}</b><code>${hex} · ${v}</code><span>${role}; з ${on}: ${ratio(hex, on)}</span></li>`,
    )}
  </ul>`;
}

const sizes = [
  ['--fs-h1', 'h1', 'Ґава ґелґоче, єнот їсть інжир'],
  ['--fs-h2', 'h2', 'Від підказки до гривень'],
  ['--fs-h3', 'h3', 'Зірки на балансі ваші повністю'],
  ['--fs-lead', 'lead', 'Гравці платять зірками Telegram, зірки йдуть на баланс вашого бота.'],
  ['--fs-body', 'текст', 'Ґанок, їжак, з’їв, є, 1 500 ₴ — основний текст 16 px, Golos Text 400.'],
  ['--fs-small', 'дрібний', 'Найменший текст на сайті — 14 px: примітки й дисклеймери.'],
] as const;

function buttonsRow(): SafeHtml {
  return html`
    <div class="sys-grid">
      <div><p class="code">звичайна</p>${button('#', 'Обрати гру')}</div>
      <div><p class="code">наведення</p>${html`<a class="btn btn--primary is-hover" href="#"><span>Обрати гру</span></a>`}</div>
      <div><p class="code">натиснута</p>${html`<a class="btn btn--primary is-active" href="#"><span>Обрати гру</span></a>`}</div>
      <div><p class="code">фокус</p>${html`<a class="btn btn--primary is-focus" href="#"><span>Обрати гру</span></a>`}</div>
      <div><p class="code">вимкнена</p>${html`<a class="btn btn--primary" aria-disabled="true"><span>Обрати гру</span></a>`}</div>
      <div><p class="code">прозора</p>${button('#', 'Написати в Telegram', { variant: 'ghost' })}</div>
      <div><p class="code">прозора, наведення</p>${html`<a class="btn btn--ghost is-hover" href="#"><span>Каталог ігор</span></a>`}</div>
      <div><p class="code">мала</p>${button('#', 'Написати', { small: true })}</div>
      <div><p class="code">зі стрілкою</p>${button('#', 'Весь каталог', { variant: 'ghost', arrow: true })}</div>
      <div><p class="code">посилання</p>${tlink('#', 'Повідомити про запуск')}</div>
    </div>
  `;
}

function controlsRow(): SafeHtml {
  return html`
    <div class="chips">
      ${chip('Усі', { pressed: true, count: 10 })}${chip('Слова', { count: 3 })}${chip('Вікторини', { count: 2 })}
      ${html`<button type="button" class="chip is-hover" aria-pressed="false">Головоломки<span class="chip__count">2</span></button>`}
      ${html`<button type="button" class="chip is-focus" aria-pressed="false">Пам’ять і реакція<span class="chip__count">2</span></button>`}
      ${html`<button type="button" class="chip" aria-pressed="false" disabled>З друзями<span class="chip__count">0</span></button>`}
    </div>
    <div class="sys-row">${badge(true)}${badge(false)}</div>
  `;
}

function logos(): SafeHtml {
  const mark = (s: number): SafeHtml => html`<svg width="${s}" height="${s}" aria-hidden="true"><use href="#i-logo"></use></svg>`;
  return html`
    <div class="sys-row sys-logos">
      ${[16, 32, 64].map((s) => html`<figure>${mark(s)}<figcaption class="code">${s} px</figcaption></figure>`)}
      <figure class="tone-light sys-light-box">${mark(16)}${mark(32)}${mark(64)}<figcaption class="code">на світлому</figcaption></figure>
      <figure><img src="/favicon.svg" width="32" height="32" alt="" /><figcaption class="code">favicon.svg</figcaption></figure>
      <figure><img src="/favicon-32.png" width="32" height="32" alt="" /><figcaption class="code">favicon-32.png</figcaption></figure>
      <figure><img src="/apple-touch-icon.png" width="60" height="60" alt="" /><figcaption class="code">apple-touch 180</figcaption></figure>
    </div>
    <p class="logo sys-gap-sm"><svg width="30" height="30" aria-hidden="true"><use href="#i-logo"></use></svg><span>${BRAND}</span></p>
  `;
}

const root = document.getElementById('sys');
if (root) {
  root.innerHTML = html`
    <section class="sec">
      <div class="wrap">
        <p class="eyebrow">Лабораторія · етап S2</p>
        <h1 class="h1">Дизайн-система «ДНК»</h1>
        <p class="lead">Кольори, шрифти, кнопки, чіпи, бейджі й логотип сайту ${BRAND}. Джерела: design/DESIGN-SPEC.md і docs/DESIGN-IMPORT.md.</p>
      </div>
    </section>

    <section class="sec tone-layer">
      <div class="wrap">
        <h2 class="h2">Кольори</h2>
        <h3 class="h3 sys-gap-sm">Темна тема (основна)</h3>
        ${swatches(dark)}
        <h3 class="h3 sys-gap-sm">Світлі секції</h3>
        ${swatches(light)}
        <h3 class="h3 sys-gap-sm">Жанри (відбиток гри)</h3>
        ${swatches(genres)}
        <p class="small muted sys-gap-sm">Золото — лише знак ★ і суми в зірках. Гривні завжди кольором тексту. Корал на світлому — лише тло кнопки.</p>
      </div>
    </section>

    <section class="sec">
      <div class="wrap">
        <h2 class="h2">Шрифти й шкала</h2>
        <p class="lead">Rubik 800 — заголовки, назви й великі числа. Golos Text 400 і 600 — текст. Розміри плавно ростуть від 390 до 1440 px.</p>
        <ul class="sys-type">
          ${sizes.map(([v, label, text]) => html`<li><code class="code">${label} · ${v}</code><p class="${label.startsWith('h') ? label : ''}" style="font-size:var(${v})">${text}</p></li>`)}
        </ul>
        <div class="sys-row">
          ${tiles('1 500₴', { className: 'tiles--lg' })}${tiles('1 000★', { className: 'tiles--lg' })}${tiles('540₴', { className: 'tiles--md', prefix: '≈' })}
        </div>
        <p class="eyebrow sys-gap-sm">Надзаголовок · шлях зірки</p>
        <p class="code">слововир | slova | #ee8466 — службовий підпис</p>
        <p class="sys-gap-sm">Значки зі спрайту: <span class="star"><svg class="i-inline" aria-hidden="true"><use href="#i-star"></use></svg></span> зірка, <svg class="i-inline" aria-hidden="true"><use href="#i-approx"></use></svg> приблизно, ${ARROW_ICON} стрілка (цих знаків немає у шрифтах).</p>
      </div>
    </section>

    <section class="sec tone-layer">
      <div class="wrap">
        <h2 class="h2">Кнопки й посилання</h2>
        <p class="lead">Прямі кути, без тіней. Наведення змінює лише прозорість шару, натискання зсуває кнопку на 1 px.</p>
        ${buttonsRow()}
      </div>
    </section>

    <section class="sec tone-light">
      <div class="wrap">
        <h2 class="h2">На світлому</h2>
        <p class="lead">Ті самі класи: кольори беруться з тону секції.</p>
        ${buttonsRow()}
        <div class="sys-gap-sm">${controlsRow()}</div>
      </div>
    </section>

    <section class="sec tone-coral">
      <div class="wrap">
        <h2 class="h2">Коралова секція-заклик</h2>
        <p class="lead">Темна кнопка, темний текст: 7,1 : 1.</p>
        <div class="actions">${button('#', 'Написати в Telegram')}${button('#', 'Каталог ігор', { variant: 'ghost' })}</div>
      </div>
    </section>

    <section class="sec">
      <div class="wrap">
        <h2 class="h2">Чіпи й бейджі</h2>
        <p class="lead">Чіп фільтра — кнопка зі станом aria-pressed і кількістю. Межа неактивного чіпа — 3,3 : 1.</p>
        <div class="sys-gap-sm">${controlsRow()}</div>
        <h3 class="h3 sys-gap">Список із маркером</h3>
        <ul class="rows sys-list">
          <li><span class="dna-mark" aria-hidden="true"><span></span></span>Гра під вашою назвою, кольорами й знаком.</li>
          <li><span class="dna-mark" aria-hidden="true"><span></span></span>Адмін-панель: гравці, оплати, де гравці застрягають.</li>
        </ul>
      </div>
    </section>

    <section class="sec" id="fingerprints">
      <div class="wrap">
        <h2 class="h2">Відбитки</h2>
        <p class="lead">Усі ігри з src/data/games.ts. Візерунок рахується з назви, жанру й кольору гри (поле dna) і ніде не зберігається: нова гра отримує його сама.</p>
        <ul class="rows sys-fp">
          ${GAMES.map((g) => {
            const fp = gameFingerprint(g);
            return html`<li>
              ${fingerprintStrip(g, 'row')}
              <div><p class="h3">${g.name}</p><p class="small muted">${GENRE_LABELS[g.dna.genre]} · ${g.dna.color}${fp.colorReplaced ? ' · темний колір замінено кольором жанру' : ''}</p></div>
              <code class="code">seed ${fp.seed}</code>
            </li>`;
          })}
        </ul>
        <div class="sys-fp-cards">${GAMES.map((g) => fingerprintStrip(g, 'card'))}</div>
      </div>
    </section>

    <section class="sec tone-layer">
      <div class="wrap">
        <h2 class="h2">Логотип</h2>
        <p class="lead">Мембрана-кільце й два ланцюги ДНК: корал і лишайник. На світлому тлі — темна версія.</p>
        ${logos()}
      </div>
    </section>
  `.value;
}
