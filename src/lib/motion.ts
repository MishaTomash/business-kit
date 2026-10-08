/**
 * Motion & input capability queries.
 * Every animation in the app goes through these, so reduced-motion users
 * and touch devices automatically get the calm, static experience.
 */

const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)');

/** `true` when the OS asks for reduced motion. Evaluated live. */
export const prefersReducedMotion = (): boolean => reducedQuery.matches;

/** `true` for mouse/trackpad users — hover-only effects are skipped on touch. */
export const hasFinePointer = (): boolean => finePointerQuery.matches;

/** easeOutExpo: fast start, long silky tail. Feels "expensive" for counters. */
export const easeOutExpo = (t: number): number => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

/** Clamp helper used across interaction code. */
export const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));
