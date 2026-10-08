/**
 * Плитки — головний матеріал дизайну «Плитка». Розмітка рядком (SafeHtml), тож вона
 * однаково будується в браузері й під час prerender.
 *
 * Токени фігури: '★' — плитка-зірка, ' ' — вузька проставка між групами розрядів,
 * '₴' — плитка гривні, решта — літера чи цифра на білій плитці.
 */

import { html, raw, type SafeHtml } from './dom';

export const STAR_ICON: SafeHtml = raw('<svg class="i-star" aria-hidden="true" focusable="false"><use href="#i-star"></use></svg>');

export interface TilesOptions {
  /** Маленький знак перед плитками, напр. «≈». */
  readonly prefix?: string;
  /** Цифри стають барабанами одометра (src/lib/odometer.ts). */
  readonly odometer?: boolean;
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

function strip(digit: string, d: number): SafeHtml {
  const cells: SafeHtml[] = [];
  for (let k = 0; k < 20; k++) cells.push(html`<span>${k % 10}</span>`);
  return html`<span class="odo-strip" data-digit="${digit}" style="--d:${d}" aria-hidden="true">${cells}</span>`;
}

export function tiles(figure: string, opts: TilesOptions = {}): SafeHtml {
  const parts: SafeHtml[] = [];
  let t = 0;
  let d = 0;
  for (const ch of figure) {
    if (ch === ' ') {
      parts.push(html`<span class="tiles__gap"></span>`);
      continue;
    }
    const i = t++;
    if (ch === '★') parts.push(html`<span class="tile tile--star" style="--t:${i}">${STAR_ICON}</span>`);
    else if (ch === '₴') parts.push(html`<span class="tile tile--cur" style="--t:${i}">₴</span>`);
    else if (opts.odometer && /\d/.test(ch)) {
      parts.push(html`<span class="tile tile--odo" style="--t:${i}"><span class="odo-still">${ch}</span>${strip(ch, d++)}</span>`);
    } else parts.push(html`<span class="tile" style="--t:${i}">${ch}</span>`);
  }
  const cls = `tiles${opts.odometer ? ' tiles--odo' : ''}${opts.className ? ` ${opts.className}` : ''}`;
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
