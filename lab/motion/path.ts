/**
 * Сцена «Шлях зірки».
 * - pin (десктоп): екран закріплено, зірка-плитка їде лінією, факт ліворуч змінюється синхронно.
 * - flow (телефон): вертикальна лінія без закріплення, заповнення й зірка рухаються зі скролом.
 * - static (prefers-reduced-motion): звичайний вертикальний список, усе видно одразу.
 * Анімуються лише transform і opacity.
 */
import { STAR_PATH } from './data';
import { buildTiles } from './tiles';
import { clamp, smoothstep, type MotionLevel } from './env';
import { onScrollFrame } from './scroll';

type Mode = 'pin' | 'flow' | 'static';

export function initPath(root: HTMLElement, level: MotionLevel): void {
  const section = root.closest<HTMLElement>('.path');
  const stopsEl = root.querySelector<HTMLOListElement>('[data-stops]');
  const factsEl = root.querySelector<HTMLElement>('[data-facts]');
  const rail = root.querySelector<HTMLElement>('[data-rail]');
  const fill = root.querySelector<HTMLElement>('[data-rail-fill]');
  const star = root.querySelector<HTMLElement>('[data-star]');
  if (!section || !stopsEl || !factsEl || !rail || !fill || !star) return;

  const n = STAR_PATH.length;
  section.style.setProperty('--n', String(n));

  // Станції: номер-плитка, підпис і факт (факт у списку читають екранні читачі й телефон).
  const stops: HTMLLIElement[] = STAR_PATH.map((s, i) => {
    const li = document.createElement('li');
    li.className = 'stop';
    li.style.setProperty('--i', String(i));
    const num = document.createElement('span');
    num.className = 'stop__tile';
    num.setAttribute('aria-hidden', 'true');
    num.textContent = String(i + 1);
    const label = document.createElement('span');
    label.className = 'stop__label';
    label.textContent = s.label;
    const fact = document.createElement('div');
    fact.className = 'stop__fact';
    fact.append(buildTiles(s.figure, s.prefix ? { prefix: s.prefix } : {}));
    const p = document.createElement('p');
    p.textContent = s.text;
    fact.append(p);
    li.append(num, label, fact);
    return li;
  });
  stopsEl.replaceChildren(...stops);

  // Велика панель фактів для десктопа (дублює список, тому прихована від читачів екрана).
  factsEl.setAttribute('aria-hidden', 'true');
  const facts: HTMLElement[] = STAR_PATH.map((s, i) => {
    const f = document.createElement('div');
    f.className = 'fact';
    const step = document.createElement('p');
    step.className = 'fact__step';
    step.textContent = `${i + 1} з ${n}. ${s.label}`;
    const p = document.createElement('p');
    p.className = 'fact__text';
    p.textContent = s.text;
    f.append(step, buildTiles(s.figure, s.prefix ? { prefix: s.prefix, className: 'tiles--xl' } : { className: 'tiles--xl' }), p);
    return f;
  });
  factsEl.replaceChildren(...facts);

  const desktop = window.matchMedia('(min-width: 900px)');
  let mode: Mode = 'static';
  let active = -1;
  let railSize = 0;
  let firstTop = 0;

  /** Розміри лінії: на десктопі ширина, на телефоні відстань від першої до останньої станції. */
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

  const setActive = (next: number): void => {
    if (next === active) return;
    const prev = active;
    facts.forEach((f, i) => {
      f.classList.toggle('on', i === next);
      f.classList.toggle('out-up', i !== next && i < next);
      f.classList.toggle('out-down', i !== next && i > next);
      if (i === prev && prev !== -1) f.classList.add('was');
      else f.classList.remove('was');
    });
    stops.forEach((s, i) => {
      s.classList.toggle('passed', i <= next);
      s.classList.toggle('current', i === next);
    });
    active = next;
  };

  const applyMode = (): void => {
    mode = level === 'none' ? 'static' : desktop.matches ? 'pin' : 'flow';
    section.classList.remove('is-pin', 'is-flow', 'is-static');
    section.classList.add(`is-${mode}`);
    measure();
    active = -1;
    if (mode === 'static') {
      setActive(n - 1);
      fill.style.transform = '';
      star.style.transform = '';
    }
  };

  const update = (): void => {
    if (mode === 'static' || section.offsetParent === null) return;
    const vh = window.innerHeight;
    if (mode === 'pin') {
      const track = root.getBoundingClientRect();
      const total = track.height - vh;
      const p = clamp((-track.top / total - 0.04) / 0.9);
      const seg = p * (n - 1);
      const i = Math.min(Math.floor(seg), n - 2);
      const move = smoothstep(clamp((seg - i - 0.2) / 0.6));
      const pos = (i + move) / (n - 1);
      fill.style.transform = `scaleX(${pos})`;
      star.style.transform = `translate3d(${pos * railSize}px, 0, 0)`;
      setActive(Math.round(i + move));
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
  desktop.addEventListener('change', applyMode);
  window.addEventListener('resize', measure);
  document.fonts.ready.then(measure).catch(() => undefined);
  onScrollFrame(update);
}
