/**
 * Scroll-triggered reveals (IntersectionObserver).
 *
 * Markup contract:
 *   [data-reveal]           → element fades up + un-blurs when it enters view.
 *   [data-reveal-delay="2"] → optional extra delay in 80 ms steps.
 *   [data-stagger]          → its *direct children* reveal one after another.
 *
 * The heavy lifting is pure CSS transitions on opacity/transform/filter
 * (compositor-friendly). JS only flips a class once — then unobserves.
 */

import { prefersReducedMotion } from './motion';
import { qsa } from './dom';

const VISIBLE = 'is-visible';
/** Cap the stagger index so long lists never wait seconds to appear. Step size lives in motion.css (`--stagger-step`). */
const MAX_STAGGERED = 12;

export function initReveal(root: ParentNode = document): () => void {
  const singles = qsa('[data-reveal]', root);
  const groups = qsa('[data-stagger]', root);

  // Index children so CSS can compute `transition-delay: calc(var(--i) * step)`.
  for (const group of groups) {
    Array.from(group.children).forEach((child, index) => {
      if (child instanceof HTMLElement) child.style.setProperty('--i', String(Math.min(index, MAX_STAGGERED)));
    });
  }
  for (const el of singles) {
    const delay = Number(el.dataset['revealDelay'] ?? 0);
    if (delay) el.style.setProperty('--i', String(delay));
  }

  const targets = [...singles, ...groups];

  // No observer support or reduced motion → show everything immediately.
  if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
    for (const el of targets) el.classList.add(VISIBLE);
    return () => undefined;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add(VISIBLE);
        observer.unobserve(entry.target); // one-shot: never re-hide content
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
  );

  for (const el of targets) observer.observe(el);

  // Teardown on route change: stop observing nodes that are about to be removed.
  return () => observer.disconnect();
}
