/**
 * Small shared UI fragments used by several views.
 */

import { html, type SafeHtml } from '@/lib/dom';
import { icon, type IconName } from '@/lib/icons';
import type { HexColor } from '@/types';

/** Rounded icon tile tinted with an accent color. */
export const iconTile = (name: IconName, accent: HexColor, size: 'md' | 'lg' = 'md'): SafeHtml =>
  html`<span class="tile tile--${size}" style="--accent: ${accent}">${icon(name, size === 'lg' ? 26 : 22)}</span>`;

/** "← Back" link at the top of inner pages. */
export const backLink = (to: string, label: string): SafeHtml =>
  html`<a class="back" href="${to}">${icon('arrowRight', 16)}<span>${label}</span></a>`;

/** Section heading with optional lead paragraph. */
export const sectionHead = (title: string, lead?: string, id?: string): SafeHtml =>
  html`<header class="section-head" data-reveal>
    <h2 ${id ? html`id="${id}"` : ''}>${title}</h2>
    ${lead && html`<p>${lead}</p>`}
  </header>`;
