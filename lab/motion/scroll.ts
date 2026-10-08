/** Один rAF-цикл на скрол і зміну розміру: усі сцени оновлюються в одному кадрі. */
type Sub = () => void;
const subs: Sub[] = [];
let queued = false;

function flush(): void {
  queued = false;
  for (const fn of subs) fn();
}

export function requestFrame(): void {
  if (queued) return;
  queued = true;
  requestAnimationFrame(flush);
}

export function onScrollFrame(fn: Sub): void {
  subs.push(fn);
  requestFrame();
}

window.addEventListener('scroll', requestFrame, { passive: true });
window.addEventListener('resize', requestFrame);
