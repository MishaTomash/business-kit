/** Горизонтальна стрічка: на десктопі секція тримає екран, а стрічка їде вбік зі скролом. */
import { clamp, isDesktop, type MotionLevel } from './env';
import { onScrollFrame } from './scroll';

export function initStrip(root: ParentNode, level: MotionLevel): () => void {
  const strip = root.querySelector<HTMLElement>('[data-strip]');
  const rail = strip?.querySelector<HTMLElement>('[data-strip-rail]');
  if (!strip || !rail) return () => undefined;
  let on = false;
  let shift = 0;

  const measure = (): void => {
    on = level !== 'none' && isDesktop();
    strip.classList.toggle('is-pinned', on);
    if (!on) {
      strip.style.height = '';
      rail.style.transform = '';
      return;
    }
    const stage = strip.firstElementChild as HTMLElement | null;
    const viewW = stage?.clientWidth ?? window.innerWidth;
    shift = Math.max(0, rail.scrollWidth - viewW);
    strip.style.height = `${window.innerHeight + shift}px`;
  };

  const update = (): void => {
    if (!on || !strip.isConnected) return;
    const r = strip.getBoundingClientRect();
    const total = r.height - window.innerHeight;
    const p = total > 0 ? clamp(-r.top / total) : 0;
    rail.style.transform = `translate3d(${-p * shift}px, 0, 0)`;
  };

  measure();
  window.addEventListener('resize', measure);
  document.fonts?.ready.then(measure).catch(() => undefined);
  const off = onScrollFrame(update);
  return () => {
    off();
    window.removeEventListener('resize', measure);
  };
}

/** Шкала запуску заповнюється, поки секція проходить екран. */
export function initTimeline(root: ParentNode, level: MotionLevel): () => void {
  const line = root.querySelector<HTMLElement>('[data-timeline]');
  const fill = line?.querySelector<HTMLElement>('[data-timeline-fill]');
  const steps = line ? [...line.querySelectorAll<HTMLElement>('.step')] : [];
  if (!line || !fill || level === 'none') {
    steps.forEach((s) => s.classList.add('on'));
    return () => undefined;
  }
  line.classList.add('is-live');
  const update = (): void => {
    if (!line.isConnected) return;
    const r = line.getBoundingClientRect();
    const p = clamp((window.innerHeight * 0.65 - r.top) / r.height);
    fill.style.transform = `scaleY(${p})`;
    const reached = p * r.height;
    steps.forEach((s) => s.classList.toggle('on', s.offsetTop <= reached + 10));
  };
  return onScrollFrame(update);
}
