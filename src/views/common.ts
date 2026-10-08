/** Поведінка, спільна для всіх сторінок: заголовки, одометри, кнопки, завіса, плитки. */

import type { Cleanup, MountContext } from './view';
import { initKinetic } from '@/lib/split';
import { initOdometers } from '@/lib/odometer';
import { initMagnetic } from '@/lib/magnetic';
import { initCurtain } from '@/lib/curtain';

/** Плитки з [data-drop]: коротке падіння лише на нормальних пристроях, інакше одразу на місці. */
function initDrops(root: ParentNode, ctx: MountContext): Cleanup {
  const els = [...root.querySelectorAll<HTMLElement>('[data-drop]')];
  if (ctx.motion !== 'full') {
    els.forEach((el) => el.classList.add('drop-still'));
    return () => undefined;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('drop-go');
        io.unobserve(e.target);
      }
    },
    { threshold: 0.3 },
  );
  els.forEach((el) => {
    el.classList.add('drop-ready');
    io.observe(el);
  });
  return () => io.disconnect();
}

export function mountCommon(root: HTMLElement, ctx: MountContext): Cleanup {
  const animate = ctx.motion !== 'none';
  const offs: Cleanup[] = [
    initKinetic(root, animate),
    initOdometers(root, animate),
    initDrops(root, ctx),
    initCurtain(root, true),
  ];
  initMagnetic(root, ctx.finePointer && animate);
  initMagnetic(document.querySelector('.nav') ?? root, ctx.finePointer && animate);
  return () => offs.forEach((off) => off());
}
