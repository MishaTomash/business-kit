/**
 * «Завіса» між секціями: кожна секція має власне суцільне тло, і наступна наїжджає
 * на попередню. Секція липне (position: sticky), коли її низ доходить до низу екрана,
 * тож кольори ніколи не змішуються, а текст завжди на своєму тлі (контраст AA і під час переходу).
 * Без JS секції просто йдуть одна за одною.
 */
export function initCurtain(root: HTMLElement, enabled: boolean): () => void {
  if (!enabled) return () => undefined;
  const secs = [...root.querySelectorAll<HTMLElement>(':scope > .sec, :scope > * > .sec')];
  if (secs.length < 2) return () => undefined;

  const measure = (): void => {
    const vh = window.innerHeight;
    for (const s of secs) s.style.top = `${Math.min(0, vh - s.offsetHeight)}px`;
  };

  root.classList.add('has-curtain');
  measure();
  const ro = new ResizeObserver(measure);
  secs.forEach((s) => ro.observe(s));
  window.addEventListener('resize', measure);
  return () => {
    ro.disconnect();
    window.removeEventListener('resize', measure);
    root.classList.remove('has-curtain');
    secs.forEach((s) => (s.style.top = ''));
  };
}
