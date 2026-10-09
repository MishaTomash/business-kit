/** Дрібні спільні елементи: кнопки, текстове посилання, бейдж статусу, чіп, обкладинка гри. */

import type { Game } from '@/types';
import { html, raw, type SafeHtml } from '@/lib/dom';
import { fingerprintStrip } from './fingerprint';

/** Стрілка зі спрайту (у шрифтах сайту немає знака →). */
export const ARROW_ICON: SafeHtml = raw('<svg class="i-arrow" aria-hidden="true" focusable="false"><use href="#i-arrow"></use></svg>');

export interface ButtonOptions {
  readonly external?: boolean;
  readonly small?: boolean;
  /** primary — суцільна (корал; на кораловій секції темна), ghost — прозора з рамкою. */
  readonly variant?: 'primary' | 'ghost';
  /** Стрілка після тексту, для переходів «далі». */
  readonly arrow?: boolean;
}

const externalAttrs = (external?: boolean): SafeHtml => (external ? raw('target="_blank" rel="noopener"') : raw(''));

/** Кнопка-посилання. */
export function button(href: string, label: string, opts: ButtonOptions = {}): SafeHtml {
  const cls = `btn btn--${opts.variant ?? 'primary'}${opts.small ? ' btn--sm' : ''}`;
  return html`<a class="${cls}" href="${href}" ${externalAttrs(opts.external)}><span>${label}</span>${opts.arrow ? ARROW_ICON : ''}</a>`;
}

export interface KeyOptions {
  readonly external?: boolean;
  readonly small?: boolean;
  /** Старі тони дизайну «Плитка»: light стає прозорою кнопкою, решта — основною. */
  readonly tone?: 'forest' | 'gold' | 'light';
}

/**
 * Головна дія. Назва лишилась від старого дизайну, щоб сторінки, які ще не перебудовано
 * (етапи S5–S6), працювали без змін. Нова розмітка — `button()`.
 */
export function key(href: string, label: string, opts: KeyOptions = {}): SafeHtml {
  return button(href, label, {
    variant: opts.tone === 'light' ? 'ghost' : 'primary',
    ...(opts.external ? { external: true } : {}),
    ...(opts.small ? { small: true } : {}),
  });
}

/** Другорядна дія: підкреслене посилання. */
export function tlink(href: string, label: string, external = false): SafeHtml {
  return html`<a class="link" href="${href}" ${externalAttrs(external)}>${label}</a>`;
}

/** Бейдж статусу гри. */
export function badge(live: boolean): SafeHtml {
  return live ? html`<span class="badge badge--live">працює</span>` : html`<span class="badge badge--soon">у розробці</span>`;
}

/** Чіп фільтра. Стан — aria-pressed, кількість — дрібним поруч. */
export function chip(label: string, opts: { pressed?: boolean; count?: number; value?: string } = {}): SafeHtml {
  return html`<button type="button" class="chip" aria-pressed="${opts.pressed ? 'true' : 'false'}" ${opts.value !== undefined ? html`data-value="${opts.value}"` : ''}>${label}${opts.count !== undefined ? html`<span class="chip__count">${opts.count}</span>` : ''}</button>`;
}

/**
 * Обкладинка гри: справжня картинка або генетичний відбиток (S3).
 * У каталозі — смужка на темному тлі, у hero сторінки гри — велика картка з ключем.
 */
export function cover(g: Game, opts: { hero?: boolean; morph?: boolean } = {}): SafeHtml {
  const style = opts.morph ? 'view-transition-name:game-cover' : '';
  const inner = g.cover
    ? html`<img src="${g.cover}" alt="" width="800" height="600" loading="lazy" decoding="async" />`
    : fingerprintStrip(g, opts.hero ? 'card' : 'row');
  return html`<div class="cover${opts.hero ? ' cover--hero' : ''}${g.cover ? '' : ' cover--fp'}" style="${style}" data-cover="${g.id}">${inner}</div>`;
}
