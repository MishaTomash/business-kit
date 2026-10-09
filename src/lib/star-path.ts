/**
 * Підсвічування «Шляху зірки» синхронно зі скролом.
 * Крок «засвічується», коли його верх перетинає 60 % висоти екрана, і гасне, коли скрол
 * повертає його нижче цієї лінії. Разом із кроком засвічуються його три перекладини спіралі.
 * Один IntersectionObserver, без обробників скролу й без перехоплення скролу.
 * prefers-reduced-motion і без JS: секція не «озброюється», усі кроки одразу коралові (CSS).
 */

import type { MotionLevel } from './env';

export function initStarPath(root: ParentNode, level: MotionLevel): () => void {
  const section = root.querySelector<HTMLElement>('[data-path]');
  if (!section || level === 'none' || typeof IntersectionObserver === 'undefined') return () => undefined;

  const steps = [...section.querySelectorAll<HTMLElement>('.pstep')];
  const rungs = [...section.querySelectorAll<HTMLElement>('.sp-rung[data-step]')];
  const setLit = (step: string, lit: boolean): void => {
    for (const r of rungs) if (r.dataset['step'] === step) r.classList.toggle('is-lit', lit);
  };

  section.classList.add('is-armed');
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const el = e.target as HTMLElement;
        // Вище лінії 60 % — або в смузі над нею, або вже прокручений за верх екрана
        const lit = e.isIntersecting || e.boundingClientRect.top < (e.rootBounds?.top ?? 0);
        el.classList.toggle('is-lit', lit);
        setLit(el.dataset['step'] ?? '', lit);
      }
    },
    { rootMargin: '0px 0px -40% 0px', threshold: 0 },
  );
  steps.forEach((s) => io.observe(s));

  return () => {
    io.disconnect();
    section.classList.remove('is-armed');
  };
}
