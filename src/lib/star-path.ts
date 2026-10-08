/**
 * Поведінка сцени «Шлях зірки».
 * - pin (десктоп): екран закріплено, зірка-плитка їде лінією, факт ліворуч змінюється
 *   перевертанням плиток по черзі, баланс праворуч наповнюється до мінімуму виведення.
 * - flow (телефон): вертикальна лінія без закріплення, заповнення й зірка рухаються зі скролом.
 * - static (prefers-reduced-motion або без JS): звичайний список, усе видно.
 * Анімуються лише transform і opacity.
 */

import { clamp, smoothstep, isDesktop, type MotionLevel } from './env';
import { onScrollFrame } from './scroll';

type Mode = 'pin' | 'flow' | 'static';

export function initStarPath(root: ParentNode, level: MotionLevel): () => void {
  const track = root.querySelector<HTMLElement>('[data-path]');
  const section = track?.closest<HTMLElement>('.path');
  const rail = track?.querySelector<HTMLElement>('[data-rail]');
  const fill = track?.querySelector<HTMLElement>('[data-rail-fill]');
  const star = track?.querySelector<HTMLElement>('[data-star]');
  const balance = track?.querySelector<HTMLElement>('[data-balance]');
  if (!track || !section || !rail || !fill || !star || !balance) return () => undefined;

  const stops = [...track.querySelectorAll<HTMLElement>('.stop')];
  const facts = [...track.querySelectorAll<HTMLElement>('.fact')];
  const cells = [...balance.querySelectorAll<HTMLElement>('.cell')];
  const states = [...balance.querySelectorAll<HTMLElement>('[data-state]')];
  const n = stops.length;

  let mode: Mode = 'static';
  let active = -1;
  let railSize = 0;
  let firstTop = 0;
  let filled = -1;
  let stateIdx = -1;
  const timers = new Map<HTMLElement, number>();

  const measure = (): void => {
    if (mode === 'pin') {
      railSize = rail.clientWidth;
      rail.style.removeProperty('--rail-len');
      return;
    }
    firstTop = stops[0]?.offsetTop ?? 0;
    railSize = (stops[n - 1]?.offsetTop ?? 0) - firstTop;
    rail.style.setProperty('--rail-len', `${railSize}px`);
  };

  /** Старий факт перевертається геть, новий приходить; плитки по черзі, без накладання. */
  const showFact = (next: number): void => {
    facts.forEach((f, i) => {
      if (i === next) {
        const t = timers.get(f);
        if (t) window.clearTimeout(t);
        f.classList.remove('leaving', 'reset');
        f.classList.add('on');
      } else if (f.classList.contains('on')) {
        f.classList.remove('on');
        f.classList.add('leaving');
        timers.set(
          f,
          window.setTimeout(() => {
            f.classList.add('reset');
            f.classList.remove('leaving');
            requestAnimationFrame(() => requestAnimationFrame(() => f.classList.remove('reset')));
          }, 700),
        );
      }
    });
  };

  const setActive = (next: number): void => {
    if (next === active) return;
    if (mode === 'pin') showFact(next);
    stops.forEach((s, i) => {
      s.classList.toggle('passed', i <= next);
      s.classList.toggle('current', i === next);
    });
    active = next;
  };

  /** Баланс: клітинки наповнюються від станції «Купує підказку» до «Fragment». */
  const setBalance = (pos: number): void => {
    const p = clamp((pos - 2) / 3);
    const count = Math.round(p * cells.length);
    const cash = pos >= n - 1.5;
    if (count !== filled) {
      cells.forEach((c, i) => c.classList.toggle('is-star', i < count));
      filled = count;
    }
    balance.classList.toggle('is-cash', cash);
    const st = cash ? 3 : pos >= 4.5 ? 2 : pos >= 3.5 ? 1 : 0;
    if (st !== stateIdx) {
      states.forEach((s, i) => s.classList.toggle('on', i === st));
      stateIdx = st;
    }
  };

  const applyMode = (): void => {
    mode = level === 'none' ? 'static' : isDesktop() ? 'pin' : 'flow';
    section.classList.remove('is-pin', 'is-flow', 'is-static');
    section.classList.add(`is-${mode}`);
    measure();
    active = -1;
    filled = -1;
    stateIdx = -1;
    facts.forEach((f) => f.classList.remove('on', 'leaving'));
    if (mode === 'static') {
      setActive(n - 1);
      fill.style.transform = '';
      star.style.transform = '';
    }
  };

  const update = (): void => {
    if (mode === 'static' || !section.isConnected) return;
    const vh = window.innerHeight;
    if (mode === 'pin') {
      const r = track.getBoundingClientRect();
      const total = r.height - vh;
      const p = clamp((-r.top / total - 0.04) / 0.9);
      const seg = p * (n - 1);
      const i = Math.min(Math.floor(seg), n - 2);
      const move = smoothstep(clamp((seg - i - 0.2) / 0.6));
      const pos = i + move;
      fill.style.transform = `scaleX(${pos / (n - 1)})`;
      star.style.transform = `translate3d(${(pos / (n - 1)) * railSize}px, 0, 0)`;
      setActive(Math.round(pos));
      setBalance(pos);
    } else {
      const r = rail.getBoundingClientRect();
      const start = r.top + firstTop + 24;
      const p = railSize > 0 ? clamp((vh * 0.6 - start) / railSize) : 0;
      fill.style.transform = `scaleY(${p})`;
      star.style.transform = `translate3d(0, ${firstTop + p * railSize}px, 0)`;
      const reached = p * railSize;
      let idx = 0;
      stops.forEach((s, i) => {
        if (s.offsetTop - firstTop <= reached + 8) idx = i;
      });
      setActive(idx);
    }
  };

  applyMode();
  const mql = window.matchMedia('(min-width: 900px)');
  mql.addEventListener('change', applyMode);
  window.addEventListener('resize', measure);
  document.fonts?.ready.then(measure).catch(() => undefined);
  const off = onScrollFrame(update);
  return () => {
    off();
    mql.removeEventListener('change', applyMode);
    window.removeEventListener('resize', measure);
    timers.forEach((t) => window.clearTimeout(t));
  };
}
