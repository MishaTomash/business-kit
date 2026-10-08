/** Огляд дизайн-системи «Плитка»: токени, шрифти, плитки, кнопки, секції. Не входить у збірку. */
import '@/styles/index.css';
import './system.css';
import { html, raw } from '@/lib/dom';
import { tiles, wordTiles, starText } from '@/lib/tiles';
import { key, tlink } from '@/components/ui';
import { BRAND } from '@/data/site';

const colors = [
  ['М’ята', '--mint', '#D5EEDC', 'основне світле тло'],
  ['Хвоя', '--forest', '#0D2A1C', 'текст, темні секції'],
  ['Білий', '--white', '#FFFFFF', 'грань плитки, світлі секції'],
  ['Зірка', '--gold', '#FFB81C', 'Telegram Stars, лише з темним текстом'],
  ['Відгадано', '--green', '#1F7A47', 'гривні, «відгадано»; білий текст 5,3 : 1'],
  ['Приглушений', '--muted', '#38543F', 'другорядний текст: 6,4 : 1 на м’яті'],
];

const sizes = [
  ['--fs-h1', 'h1', 'Гра у вашому Telegram'],
  ['--fs-h2', 'h2', 'Як заробляємо ми'],
  ['--fs-h3', 'h3', 'Зірки на балансі ваші повністю'],
  ['--fs-lead', 'lead', 'Гравці купують підказки за Telegram Stars, а зірки йдуть на баланс вашого бота.'],
  ['--fs-md', 'текст', 'Ґанок, їжак, з’їв, є — основний текст 17 px.'],
  ['--fs-sm', 'дрібний', 'Найменший текст на сайті — 16 px.'],
];

const root = document.getElementById('sys');
if (root) {
  root.innerHTML = html`
    <section class="sec sec--mint">
      <div class="wrap">
        <p class="sys-meta">Лабораторія, етап 3. ${BRAND}.</p>
        <h1 class="h1">Дизайн-система «Плитка»</h1>
        <p class="lead">Усе, з чого складаються сторінки: кольори, дві родини шрифтів, шість розмірів тексту, плитки, кнопки й секції-«завіси».</p>
      </div>
    </section>

    <section class="sec sec--white">
      <div class="wrap">
        <h2 class="h2">Кольори</h2>
        <ul class="sys-colors">
          ${colors.map(([n, v, hex, role]) => html`<li><span class="sys-chip" style="background:var(${v ?? ''})"></span><b>${n}</b><code>${hex}, ${v}</code><span>${role}</span></li>`)}
        </ul>
        <h2 class="h2 sys-gap">Шрифти й шкала</h2>
        <p class="lead">Geologica — заголовки й плитки. Golos Text — текст. Обидві з повною українською (ґ, є, і, ї, апостроф).</p>
        <ul class="sys-type">
          ${sizes.map(([v, label, text]) => html`<li><code>${label}, ${v}</code><p style="font-size:var(${v ?? ''});${label?.startsWith('h') ? 'font-family:var(--f-display);font-weight:800;letter-spacing:-0.03em;line-height:1.05' : ''}">${text}</p></li>`)}
        </ul>
      </div>
    </section>

    <section class="sec sec--mint">
      <div class="wrap">
        <h2 class="h2">Плитки</h2>
        <p class="lead">Головний матеріал. На світлому тлі — темний контур і «дно», на темному — світле «дно». Вузька проставка групує розряди: «1 000».</p>
        <div class="sys-row">${tiles('1 500₴', { className: 'tiles--lg' })}${tiles('0%', { className: 'tiles--lg tiles--gold' })}</div>
        <div class="sys-row">${tiles('1 000★', { className: 'tiles--md' })}${tiles('540₴', { className: 'tiles--md', prefix: '≈' })}${wordTiles('ГРА', 'tiles--md')}</div>
        <p class="sys-note">${starText('Зірка в тексті — іконка, а не емодзі: підказка за 1 ★.')}</p>
      </div>
    </section>

    <section class="sec sec--forest">
      <div class="wrap">
        <h2 class="h2">Темна секція</h2>
        <div class="sys-row">${tiles('21', { className: 'tiles--lg' })}${tiles('1★', { className: 'tiles--lg' })}${tiles('99₴', { className: 'tiles--lg' })}</div>
        <div class="actions">${key('#', 'Головна дія', { tone: 'gold' })}${tlink('#', 'Другорядна дія')}</div>
      </div>
    </section>

    <section class="sec sec--white">
      <div class="wrap">
        <h2 class="h2">Кнопки</h2>
        <p class="lead">Одна головна дія на екран: кнопка-плитка з «дном», що просідає при натисканні й тягнеться за мишею. Другорядна дія — підкреслене посилання.</p>
        <div class="actions">${key('#', 'Обговорити гру')}${key('#', 'Пограти', { tone: 'gold' })}${key('#', 'Написати', { small: true })}${tlink('#', 'Переглянути ігри')}</div>
      </div>
    </section>

    <section class="sec sec--gold">
      <div class="wrap">
        <h2 class="h2">Секції-«завіси»</h2>
        <p class="lead">Кожна секція має власне суцільне тло й заходить на попередню заокругленим краєм. Кольори не змішуються, тому контраст тексту завжди AA. Чергування: м’ята, хвоя, білий, золото для фіналу.</p>
        ${raw('')}
      </div>
    </section>
  `.value;
}
