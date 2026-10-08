/**
 * Navbar: transparent at the top, frosted after scrolling (rAF-throttled).
 * Lives outside the routed area, so it is mounted once.
 */

import { qs } from '@/lib/dom';

export function mountNavbar(): void {
  const nav = qs('[data-nav]');
  let ticking = false;

  const update = (): void => {
    nav.classList.toggle('is-scrolled', window.scrollY > 8);
    ticking = false;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    },
    { passive: true },
  );
  update();
}
