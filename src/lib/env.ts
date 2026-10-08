/**
 * Можливості пристрою. Усі перевірки — функції, бо модулі виконуються і в браузері,
 * і під час prerender у Node, де window немає.
 */

const mq = (q: string): boolean => typeof window !== 'undefined' && window.matchMedia(q).matches;

export const prefersReducedMotion = (): boolean => mq('(prefers-reduced-motion: reduce)');

/** Миша або тачпад: магнітні кнопки, hover-стани й плавний скрол. */
export const hasFinePointer = (): boolean => mq('(hover: hover) and (pointer: fine)');

export const isDesktop = (): boolean => mq('(min-width: 900px)');

type NavigatorWithMemory = Navigator & { readonly deviceMemory?: number };

/** Слабкий сенсорний пристрій: мало ядер або пам'яті. */
export function isWeakDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const cores = navigator.hardwareConcurrency || 8;
  const memory = (navigator as NavigatorWithMemory).deviceMemory ?? 8;
  return (cores <= 4 || memory <= 4) && !hasFinePointer();
}

export type MotionLevel = 'full' | 'lite' | 'none';

/** full — увесь рух; lite — без падіння плиток і плавного скролу; none — prefers-reduced-motion. */
export function motionLevel(): MotionLevel {
  if (prefersReducedMotion()) return 'none';
  return isWeakDevice() ? 'lite' : 'full';
}

export const clamp = (v: number, min = 0, max = 1): number => Math.min(max, Math.max(min, v));
export const smoothstep = (t: number): number => t * t * (3 - 2 * t);
/** easeOutExpo для лічильників калькулятора. */
export const easeOutExpo = (t: number): number => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
