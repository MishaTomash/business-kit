/**
 * FingerprintStrip: генетичний відбиток гри у двох розмірах.
 * - row: смужка для рядка каталогу (≈200 × 30 px), без підпису;
 * - card: велика картка на сторінці гри з підписом «генетичний відбиток» і ключем.
 * Відбиток рахується з назви, жанру й кольору гри (game.dna) і ніде не зберігається:
 * нова гра в games.ts отримує його автоматично. SVG декоративний (aria-hidden): назву й жанр
 * поруч завжди дає текст.
 */

import type { Game } from '@/types';
import { fingerprint, renderFingerprintSvg, type Fingerprint } from '@/lib/fingerprint';
import { html, raw, type SafeHtml } from '@/lib/dom';

export const gameFingerprint = (g: Game): Fingerprint => fingerprint({ name: g.name, genre: g.dna.genre, color: g.dna.color });

/** Ключ для підпису: «слововир | slova | #ee8466». */
export const fingerprintCaption = (fp: Fingerprint): string => fp.key.split('|').join(' | ');

export function fingerprintStrip(g: Game, size: 'row' | 'card' = 'row'): SafeHtml {
  const fp = gameFingerprint(g);
  const svg = raw(renderFingerprintSvg(fp, g.dna.genre));
  if (size === 'row') return html`<div class="fp-strip fp-strip--row">${svg}</div>`;
  return html`
    <figure class="fp-strip fp-strip--card">
      <div class="fp-strip__field">${svg}</div>
      <figcaption class="fp-strip__cap"><span>генетичний відбиток</span><span class="fp-strip__key">${fingerprintCaption(fp)}</span></figcaption>
    </figure>
  `;
}
