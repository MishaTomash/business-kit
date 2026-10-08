/**
 * «Колірний світ» продукту.
 * Береться з `project.theme`; відсутні поля виводяться з `accent`,
 * колір тексту обирається за контрастом (WCAG), тож новий бот без `theme`
 * теж отримує читабельну панель.
 */

import type { HexColor, Project } from '@/types';

export interface ResolvedTheme {
  readonly bg: string;
  readonly ink: string;
  readonly accent: string;
  readonly onAccent: string;
}

const INK_DARK = '#0D1B2A';
const INK_LIGHT = '#FFFFFF';

function rgb(hex: string): readonly [number, number, number] {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? [...h].map((c) => c + c).join('') : h.slice(0, 6);
  const n = Number.parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Relative luminance (WCAG 2.x). */
export function luminance(hex: string): number {
  const [r, g, b] = rgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (l1 + 0.05) / (l2 + 0.05);
}

/** Темний або білий текст, що краще читається на `bg`. */
export const readableOn = (bg: string): string => (contrast(bg, INK_DARK) >= contrast(bg, INK_LIGHT) ? INK_DARK : INK_LIGHT);

export function projectTheme(p: Project): ResolvedTheme {
  const t = p.theme ?? {};
  const bg: HexColor = t.bg ?? p.accent;
  const ink = t.ink ?? readableOn(bg);
  const accent = t.accent ?? ink;
  const onAccent = t.onAccent ?? readableOn(accent);
  return { bg, ink, accent, onAccent };
}

/** CSS-змінні для `style="…"`: --w-bg, --w-ink, --w-accent, --w-on, --accent. */
export function themeStyle(p: Project): string {
  const t = projectTheme(p);
  return `--w-bg:${t.bg};--w-ink:${t.ink};--w-accent:${t.accent};--w-on:${t.onAccent};--accent:${p.accent}`;
}

/** Назва для великих заголовків: частина `name` до двокрапки. */
export const displayName = (p: Project): string => p.name.split(':')[0]?.trim() || p.name;

/** Коротка назва для кнопок і вкладок. */
export const shortLabel = (p: Project): string => p.shortName ?? displayName(p);
