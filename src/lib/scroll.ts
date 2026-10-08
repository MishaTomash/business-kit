/** Один rAF-цикл на скрол і зміну розміру: усі сцени оновлюються в одному кадрі. */
type Sub = () => void;
const subs = new Set<Sub>();
let queued = false;
let bound = false;

function flush(): void {
  queued = false;
  subs.forEach((fn) => fn());
}

export function requestFrame(): void {
  if (queued) return;
  queued = true;
  requestAnimationFrame(flush);
}

/** Підписка на кадр після скролу. Повертає відписку. */
export function onScrollFrame(fn: Sub): () => void {
  if (!bound) {
    window.addEventListener('scroll', requestFrame, { passive: true });
    window.addEventListener('resize', requestFrame);
    bound = true;
  }
  subs.add(fn);
  requestFrame();
  return () => subs.delete(fn);
}
