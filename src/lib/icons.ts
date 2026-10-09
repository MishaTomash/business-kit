/** Значки зі спрайту в index.html (у шрифтах сайту немає ★, ≈ і →) і множина слова «зірка». */

import { raw, type SafeHtml } from './dom';

export const STAR_ICON: SafeHtml = raw('<svg class="i-star" aria-hidden="true" focusable="false"><use href="#i-star"></use></svg>');

/** Українська множина для «зірка»: 1 зірка, 2 зірки, 5 зірок. */
export function pluralStars(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'зірка';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'зірки';
  return 'зірок';
}
