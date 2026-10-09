/**
 * Рух спіралі в hero (DESIGN-SPEC, розділ 4).
 *
 * φ = 0.6 + 2π·t / 14 с (холостий оберт) + π·scrollY / висота екрана (скрол докручує спіраль).
 * Для перекладини i: θ = 0.52·i + φ; кінці зсуваються на ±44 % поперек осі (sin θ),
 * крапка 9 ± 5·cos θ px і прозорість 0.5 ± 0.5·cos θ, лінія — 88 % · sin θ.
 *
 * Кожен кадр JS пише лише transform і opacity крапкам і лініям видимих перекладин (inline-стилі).
 * Варіант «одна змінна --phi + sin() у CSS» міряли: у Chromium перерахунок стилів дорожчий у ~5 разів.
 *
 * - Один requestAnimationFrame-цикл на сторінку; пауза, коли спіраль поза екраном або вкладка прихована.
 * - Слабкий пристрій (deviceMemory ≤ 4, hardwareConcurrency ≤ 4 або FPS < 45 за перші 2 с):
 *   12 перекладин, холостий оберт вимкнено, спіраль крутиться лише від скролу.
 * - prefers-reduced-motion і без JS: спіраль статична з розмітки (φ = 0.6), JS нічого не вмикає.
 * Скрол не перехоплюється: лише читаємо scrollY.
 */

import type { MotionLevel } from './env';
import { onScrollFrame } from './scroll';
import { PHI_STATIC, RUNG_STEP } from '@/components/spiral';

const IDLE_PERIOD_MS = 14_000;
const FPS_PROBE_MS = 2_000;
const FPS_MIN = 45;
const AMP = 0.44;
const LINE = 0.88;
const DOT_PX = 9;
const DOT_SWING_PX = 5;

interface Rung {
  readonly i: number;
  readonly el: HTMLElement;
  readonly a: HTMLElement;
  readonly b: HTMLElement;
  readonly line: HTMLElement;
}

export function initSpiral(el: HTMLElement | null, level: MotionLevel): () => void {
  if (!el || level === 'none' || typeof IntersectionObserver === 'undefined') return () => undefined;

  const all: Rung[] = [...el.querySelectorAll<HTMLElement>('.sp-rung')].flatMap((r, i) => {
    const a = r.querySelector<HTMLElement>('.sp-a .sp-dot');
    const b = r.querySelector<HTMLElement>('.sp-b .sp-dot');
    const line = r.querySelector<HTMLElement>('.sp-line');
    return a && b && line ? [{ i, el: r, a, b, line }] : [];
  });

  let weak = level === 'lite';
  let visible = false;
  let raf = 0;
  const start = performance.now();
  let probeFrames = 0;
  let probeStart = 0;
  let probing = !weak;
  /** Холостий кут, на якому спіраль зупинилась, коли замір FPS перевів її в слабкий режим (без стрибка). */
  let frozenIdle = 0;

  // Геометрія: орієнтація з CSS (--kx), довжина поперек осі в px, видимі перекладини
  let horizontalAxis = false;
  let span = 0;
  let rungs: Rung[] = [];
  const measure = (): void => {
    horizontalAxis = getComputedStyle(el).getPropertyValue('--kx').trim() === '0';
    span = horizontalAxis ? el.clientHeight : el.clientWidth;
    rungs = all.filter((r) => r.el.offsetParent !== null);
  };

  el.classList.add('is-live');
  el.classList.toggle('is-weak', weak);

  const idleAt = (now: number): number => ((now - start) / IDLE_PERIOD_MS) * 2 * Math.PI;
  const phiAt = (now: number): number =>
    PHI_STATIC + (weak ? frozenIdle : idleAt(now)) + (Math.PI * window.scrollY) / Math.max(1, window.innerHeight);

  const draw = (now: number): void => {
    const phi = phiAt(now);
    const shiftOf = (px: number): string => (horizontalAxis ? `translate3d(0,${px.toFixed(1)}px,0)` : `translate3d(${px.toFixed(1)}px,0,0)`);
    for (const r of rungs) {
      const t = RUNG_STEP * r.i + phi;
      const s = Math.sin(t);
      const c = Math.cos(t);
      const dx = AMP * span * s;
      r.a.style.transform = `${shiftOf(dx)} scale(${((DOT_PX + DOT_SWING_PX * c) / DOT_PX).toFixed(3)})`;
      r.b.style.transform = `${shiftOf(-dx)} scale(${((DOT_PX - DOT_SWING_PX * c) / DOT_PX).toFixed(3)})`;
      r.a.style.opacity = (0.5 + 0.5 * c).toFixed(3);
      r.b.style.opacity = (0.5 - 0.5 * c).toFixed(3);
      const k = (LINE * s).toFixed(3);
      r.line.style.transform = horizontalAxis ? `scale(1,${k})` : `scale(${k},1)`;
    }
  };

  const tick = (now: number): void => {
    raf = 0;
    if (probing) {
      if (!probeStart) probeStart = now;
      probeFrames++;
      const elapsed = now - probeStart;
      if (elapsed >= FPS_PROBE_MS) {
        probing = false;
        if ((probeFrames * 1000) / elapsed < FPS_MIN) {
          frozenIdle = idleAt(now);
          weak = true;
          el.classList.add('is-weak');
          measure();
        }
      }
    }
    draw(now);
    if (!weak) loop();
  };

  function loop(): void {
    if (raf || !visible || document.hidden) return;
    raf = requestAnimationFrame(tick);
  }

  const stop = (): void => {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    // Замір FPS має сенс лише на безперервних кадрах: після паузи починаємо заново
    probeStart = 0;
    probeFrames = 0;
  };

  measure();
  draw(performance.now());

  // Слабкий режим: без холостого оберту, оновлення лише в кадрі після скролу
  const offScroll = onScrollFrame(() => {
    if (weak && visible) draw(performance.now());
  });

  const ro = new ResizeObserver(() => {
    measure();
    draw(performance.now());
  });
  ro.observe(el);

  const io = new IntersectionObserver((entries) => {
    visible = entries.some((e) => e.isIntersecting);
    if (visible && !weak) loop();
    else if (!visible) stop();
  });
  io.observe(el);

  const onVisibility = (): void => {
    if (document.hidden) stop();
    else if (!weak) loop();
  };
  document.addEventListener('visibilitychange', onVisibility);

  return () => {
    stop();
    io.disconnect();
    ro.disconnect();
    offScroll();
    document.removeEventListener('visibilitychange', onVisibility);
  };
}
