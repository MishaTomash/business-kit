/** Плитки з тексту фігури: '★' — плитка-зірка, ' ' — проміжок, '₴' — плитка гривні. */
const SVG_NS = 'http://www.w3.org/2000/svg';

export function starSvg(): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('aria-hidden', 'true');
  const use = document.createElementNS(SVG_NS, 'use');
  use.setAttribute('href', '#star');
  svg.append(use);
  return svg;
}

export interface TilesOptions {
  readonly prefix?: string;
  /** Цифри стають барабанами одометра. */
  readonly odometer?: boolean;
  readonly className?: string;
}

/** Текст для читачів екрана: «1 000★» → «1 000 зірок». */
export function spoken(figure: string, prefix = ''): string {
  return `${prefix ? `${prefix} ` : ''}${figure.replace('★', ' зірок').replace('₴', ' гривень')}`.replace(/\s+/g, ' ').trim();
}

export function buildTiles(figure: string, opts: TilesOptions = {}): HTMLElement {
  const wrap = document.createElement('p');
  wrap.className = `tiles${opts.className ? ` ${opts.className}` : ''}`;
  wrap.setAttribute('role', 'img');
  wrap.setAttribute('aria-label', spoken(figure, opts.prefix));
  if (opts.prefix) {
    const pre = document.createElement('span');
    pre.className = 'tiles__pre';
    pre.textContent = opts.prefix;
    wrap.append(pre);
  }
  let digitIndex = 0;
  for (const ch of figure) {
    if (ch === ' ') {
      const gap = document.createElement('span');
      gap.className = 'tiles__gap';
      wrap.append(gap);
      continue;
    }
    const tile = document.createElement('span');
    tile.className = 'tile';
    if (ch === '★') {
      tile.classList.add('tile--star');
      tile.append(starSvg());
    } else if (ch === '₴') {
      tile.classList.add('tile--cur');
      tile.textContent = ch;
    } else if (opts.odometer && /\d/.test(ch)) {
      tile.classList.add('tile--odo');
      const strip = document.createElement('span');
      strip.className = 'odo-strip';
      strip.dataset['digit'] = ch;
      strip.style.setProperty('--d', String(digitIndex++));
      // два кола цифр, щоб барабан прокрутився більше ніж на один оберт
      strip.textContent = '';
      for (let k = 0; k < 20; k++) {
        const s = document.createElement('span');
        s.textContent = String(k % 10);
        strip.append(s);
      }
      const still = document.createElement('span');
      still.className = 'odo-still';
      still.textContent = ch;
      tile.append(still, strip);
    } else {
      tile.textContent = ch;
    }
    wrap.append(tile);
  }
  return wrap;
}
