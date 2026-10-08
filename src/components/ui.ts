/**
 * Дрібні спільні фрагменти: знак логотипа, «назад», заголовок секції, позначка «бот працює».
 */

import { html, raw, type SafeHtml } from '@/lib/dom';
import { icon, type IconName } from '@/lib/icons';
import type { HexColor } from '@/types';
import { readableOn } from '@/lib/theme';

let logoId = 0;

/**
 * Знак Business Kit: відкрита коробка («кит»), з якої вилітає зірка Telegram Stars.
 * Той самий малюнок лежить у public/favicon.svg і в index.html.
 */
export function logoMark(size = 32): SafeHtml {
  const id = `lg${++logoId}`;
  return raw(`<svg class="logo__mark" width="${size}" height="${size}" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2AABEE"/><stop offset="1" stop-color="#1665A8"/></linearGradient></defs>
    <rect width="40" height="40" rx="12" fill="url(#${id})"/>
    <path d="M9.5 21.5 6.8 16.6h10.8l2.4 4.9z" fill="#BFE3F8"/>
    <path d="M30.5 21.5l2.7-4.9H22.4L20 21.5z" fill="#BFE3F8"/>
    <path d="M9.5 21.5h21V30a3 3 0 0 1-3 3h-15a3 3 0 0 1-3-3z" fill="#fff"/>
    <path d="M20 21.5V33" stroke="#1665A8" stroke-opacity=".18" stroke-width="1.6"/>
    <polygon points="20.00,4.60 21.70,8.85 26.28,9.16 22.76,12.10 23.88,16.54 20.00,14.10 16.12,16.54 17.24,12.10 13.72,9.16 18.30,8.85" fill="#FFC233" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/>
  </svg>`);
}

/** Плитка з іконкою в кольорі напряму. */
export const iconTile = (name: IconName, accent: HexColor, size: 'md' | 'lg' = 'md'): SafeHtml =>
  html`<span class="tile tile--${size}" style="--accent: ${accent}; color: ${readableOn(accent)}">${icon(name, size === 'lg' ? 26 : 22)}</span>`;

/** «← Назад» угорі внутрішніх сторінок. */
export const backLink = (to: string, label: string): SafeHtml =>
  html`<a class="back" href="${to}">${icon('arrowRight', 18)}<span>${label}</span></a>`;

/** Заголовок секції з необов'язковим підзаголовком. */
export const sectionHead = (title: string, lead?: string, id?: string): SafeHtml =>
  html`<header class="section-head" data-reveal>
    <h2 class="h2" ${id ? html`id="${id}"` : ''}>${title}</h2>
    ${lead && html`<p class="section-head__lead">${lead}</p>`}
  </header>`;

/** Зелена позначка «Працює в Telegram» (лише коли є `botUrl`). */
export const liveBadge = (label = 'Працює в Telegram зараз'): SafeHtml =>
  html`<p class="live"><span class="live__dot" aria-hidden="true"></span>${label}</p>`;
