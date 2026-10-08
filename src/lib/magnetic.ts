/**
 * Magnetic hover — the element leans toward the cursor.
 *
 * Usage: `<a class="btn" data-magnetic="0.3">` (value = pull strength 0..1).
 * Writes `--tx/--ty`, consumed by the CSS `translate` property, which composes
 * with `scale` on hover without fighting over the `transform` property.
 * The CSS transition on `translate` provides the springy easing.
 */

import { hasFinePointer, prefersReducedMotion } from './motion';
import { qsa } from './dom';

const DEFAULT_STRENGTH = 0.25;

export function initMagnetic(root: ParentNode = document): void {
  if (!hasFinePointer() || prefersReducedMotion()) return;

  for (const el of qsa('[data-magnetic]', root)) {
    const strength = Number(el.dataset['magnetic']) || DEFAULT_STRENGTH;
    let frame = 0;

    el.addEventListener(
      'pointermove',
      (event: PointerEvent) => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          const rect = el.getBoundingClientRect();
          const dx = event.clientX - (rect.left + rect.width / 2);
          const dy = event.clientY - (rect.top + rect.height / 2);
          el.style.setProperty('--tx', `${(dx * strength).toFixed(2)}px`);
          el.style.setProperty('--ty', `${(dy * strength).toFixed(2)}px`);
        });
      },
      { passive: true },
    );

    el.addEventListener('pointerleave', () => {
      cancelAnimationFrame(frame);
      el.style.setProperty('--tx', '0px');
      el.style.setProperty('--ty', '0px');
    });
  }
}
