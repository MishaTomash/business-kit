/** Що дозволяє пристрій: повний рух, легкий або жодного. */
type NavigatorWithMemory = Navigator & { readonly deviceMemory?: number };

const mq = (q: string): boolean => window.matchMedia(q).matches;

export const reducedMotion = mq('(prefers-reduced-motion: reduce)');
/** Миша або тачпад (для магнітних кнопок і плавного скролу). */
export const finePointer = mq('(hover: hover) and (pointer: fine)');
/** Слабкий пристрій: мало ядер або пам'яті. Тоді лише найпотрібніший рух. */
export const weakDevice =
  (navigator.hardwareConcurrency || 8) <= 4 || ((navigator as NavigatorWithMemory).deviceMemory ?? 8) <= 4;

export type MotionLevel = 'full' | 'lite' | 'none';
export const motion: MotionLevel = reducedMotion ? 'none' : weakDevice && !finePointer ? 'lite' : 'full';

export const clamp = (v: number, min = 0, max = 1): number => Math.min(max, Math.max(min, v));
export const smoothstep = (t: number): number => t * t * (3 - 2 * t);
