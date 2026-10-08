/** Дрібні спільні елементи: кнопка з «дном», текстове посилання, обкладинка гри. */

import type { Game } from '@/types';
import { html, raw, type SafeHtml } from '@/lib/dom';
import { wordTiles } from '@/lib/tiles';

export interface KeyOptions {
  readonly external?: boolean;
  readonly small?: boolean;
  /** Колір кнопки: forest (за замовчуванням), gold, light. */
  readonly tone?: 'forest' | 'gold' | 'light';
}

/** Головна дія: кнопка-плитка з «дном», магнітна для миші. */
export function key(href: string, label: string, opts: KeyOptions = {}): SafeHtml {
  const cls = `key${opts.small ? ' key--sm' : ''}${opts.tone && opts.tone !== 'forest' ? ` key--${opts.tone}` : ''}`;
  return html`<a class="${cls}" href="${href}" ${opts.external ? raw('target="_blank" rel="noopener"') : ''} data-magnetic><span class="key__face">${label}</span></a>`;
}

/** Другорядна дія: підкреслене посилання. */
export function tlink(href: string, label: string, external = false): SafeHtml {
  return html`<a class="tlink" href="${href}" ${external ? raw('target="_blank" rel="noopener"') : ''}>${label}</a>`;
}

export function themeVars(g: Game): string {
  const t = g.theme;
  return `--g-bg:${t.bg};--g-ink:${t.ink};--g-tile:${t.tile};--g-tile-ink:${t.tileInk}`;
}

/** Обкладинка: справжня картинка або слово з плиток у кольорі гри. */
export function cover(g: Game, opts: { hero?: boolean; morph?: boolean } = {}): SafeHtml {
  const style = `${themeVars(g)};--n:${[...g.coverWord].length}${opts.morph ? ';view-transition-name:game-cover' : ''}`;
  const inner = g.cover
    ? html`<img src="${g.cover}" alt="" width="800" height="600" loading="lazy" decoding="async" />`
    : wordTiles(g.coverWord, 'tiles--cover');
  return html`<div class="cover${opts.hero ? ' cover--hero' : ''}" style="${style}" data-cover="${g.id}">${inner}</div>`;
}
