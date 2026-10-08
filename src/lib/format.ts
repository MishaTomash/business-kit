/**
 * Locale-aware number formatting (Ukrainian grouping: "12 500").
 * Formatters are created once — `Intl.NumberFormat` construction is expensive
 * and the calculator formats numbers on every animation frame.
 */

const integer = new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 0 });
const percent = new Intl.NumberFormat('uk-UA', { style: 'percent', maximumFractionDigits: 0 });

/** 12500 → "12 500" */
export const formatInt = (n: number): string => integer.format(Math.round(n));

/** 12500 → "12 500 ₴" (non-breaking space keeps the sign attached). */
export const formatUah = (n: number): string => `${integer.format(Math.round(n))}\u00A0₴`;

/** Signed variant for profit: "+12 500 ₴" / "−300 ₴" (true minus sign). */
export const formatSignedUah = (n: number): string => {
  const rounded = Math.round(n);
  if (rounded === 0) return formatUah(0);
  return `${rounded > 0 ? '+' : '\u2212'}${formatUah(Math.abs(rounded))}`;
};

/** 0.12 → "12 %" */
export const formatPercent = (n: number): string => percent.format(n);

/** Ukrainian plural for "день": 1 день, 2 дні, 5 днів. */
export function pluralDays(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'день';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'дні';
  return 'днів';
}

/** [3, 10] → "3–10 днів" (plural agrees with the upper bound). */
export const formatDaysRange = ([min, max]: readonly [number, number]): string =>
  min === max ? `${min} ${pluralDays(min)}` : `${min}–${max} ${pluralDays(max)}`;

/** [30, 60] → "30–60 хв", [60, 120] → "1–2 год". */
export function formatMinutesRange([min, max]: readonly [number, number]): string {
  if (min >= 60 && min % 60 === 0 && max % 60 === 0) return `${min / 60}–${max / 60} год`;
  return min === max ? `${min} хв` : `${min}–${max} хв`;
}

/** Ukrainian plural for "проєкт". */
export function pluralProjects(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'проєкт';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'проєкти';
  return 'проєктів';
}
