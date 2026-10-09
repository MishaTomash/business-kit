/**
 * Числа-«фігури» (ціни, 0 %, 1 000 ★): розмітка рядком (SafeHtml), однакова в браузері й під час prerender.
 * Назва «tiles» лишилась від старого дизайну «Плитка»; у «ДНК» це великі числа Rubik 800 (styles/tiles.css).
 *
 * Токени фігури: '★' — значок зірки, ' ' — вузька проставка між групами розрядів,
 * '₴' — знак гривні, решта — звичайні символи.
 */

import { html, raw, type SafeHtml } from './dom';

export const STAR_ICON: SafeHtml = raw('<svg class="i-star" aria-hidden="true" focusable="false"><use href="#i-star"></use></svg>');

export interface TilesOptions {
  /** Маленький знак перед плитками, напр. «≈». */
  readonly prefix?: string;
  /** Додаткові класи контейнера: tiles--xl, tiles--lg… */
  readonly className?: string;
  /** Текст для читачів екрана. За замовчуванням береться з фігури. */
  readonly label?: string;
  /** Не озвучувати (коли поруч є той самий текст). */
  readonly decorative?: boolean;
}

/** «1 000★» → «1 000 зірок», «540₴» → «540 гривень». */
export function spokenFigure(figure: string, prefix = ''): string {
  return `${prefix ? `${prefix} ` : ''}${figure.replace('★', ' зірок').replace('₴', ' гривень').replace('%', ' відсотків')}`
    .replace(/\s+/g, ' ')
    .trim();
}

export function tiles(figure: string, opts: TilesOptions = {}): SafeHtml {
  const parts: SafeHtml[] = [];
  for (const ch of figure) {
    if (ch === ' ') {
      parts.push(html`<span class="tiles__gap"></span>`);
      continue;
    }
    if (ch === '★') parts.push(html`<span class="tile tile--star">${STAR_ICON}</span>`);
    else if (ch === '₴') parts.push(html`<span class="tile tile--cur">₴</span>`);
    else parts.push(html`<span class="tile">${ch}</span>`);
  }
  const cls = `tiles${opts.className ? ` ${opts.className}` : ''}`;
  const a11y = opts.decorative
    ? raw('aria-hidden="true"')
    : html`role="img" aria-label="${opts.label ?? spokenFigure(figure, opts.prefix)}"`;
  return html`<p class="${cls}" ${a11y}>${opts.prefix ? html`<span class="tiles__pre" aria-hidden="true">${opts.prefix}</span>` : ''}${parts}</p>`;
}

/** Слово з плиток для обкладинок і назв (без озвучування, поруч завжди є текст). */
export function wordTiles(word: string, className = ''): SafeHtml {
  return tiles(word.toUpperCase(), { decorative: true, className: `tiles--word ${className}`.trim() });
}

/** Українська множина для «зірка»: 1 зірка, 2 зірки, 5 зірок. */
export function pluralStars(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'зірка';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'зірки';
  return 'зірок';
}

/** Текст, де «★» (або «⭐») замінено на іконку зірки Telegram; читач екрана чує слово «зірка» в потрібній формі. */
export function starText(text: string): SafeHtml {
  const parts = text.replace(/⭐/g, '★').split('★');
  return html`${parts.map((p, i) => {
    if (i === parts.length - 1) return html`${p}`;
    const m = /(\d[\d\s\u00A0]*)\s*$/.exec(p);
    const n = m?.[1] ? Number(m[1].replace(/\D/g, '')) : 5;
    return html`${p}<span class="i-star-inline">${STAR_ICON}<span class="sr-only">${pluralStars(n)}</span></span>`;
  })}`;
}
