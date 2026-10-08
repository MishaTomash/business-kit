/**
 * Spotlight — cursor-following radial glow (Linear / Vercel style).
 *
 * Listens on a *container* (one listener for the whole grid) and writes the
 * pointer position, relative to every `.spotlight` card, into CSS custom
 * properties `--mx` / `--my`. Because the position is computed for every card,
 * the glow bleeds across neighbouring card borders as the cursor moves between
 * them — the signature "lit edge" effect. Writes are batched into one rAF.
 */

import { hasFinePointer } from './motion';
import { qsa } from './dom';

export function initSpotlight(container: HTMLElement, selector = '.spotlight'): () => void {
  if (!hasFinePointer()) return () => undefined;

  let frame = 0;
  let x = 0;
  let y = 0;

  const update = (): void => {
    frame = 0;
    for (const card of qsa(selector, container)) {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${x - rect.left}px`);
      card.style.setProperty('--my', `${y - rect.top}px`);
    }
  };

  const onMove = (event: PointerEvent): void => {
    x = event.clientX;
    y = event.clientY;
    if (!frame) frame = requestAnimationFrame(update);
  };

  container.addEventListener('pointermove', onMove, { passive: true });

  // Teardown handle for HMR / SPA reuse.
  return () => {
    container.removeEventListener('pointermove', onMove);
    cancelAnimationFrame(frame);
  };
}
