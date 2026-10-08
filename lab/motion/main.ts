/**
 * Прототип руху напряму «Плитка» (етап 2). Залежність лише одна: lenis для плавного скролу.
 * GSAP не знадобився: сцена зі scrub працює на position: sticky і власному rAF-циклі.
 */
import 'lenis/dist/lenis.css';
import Lenis from 'lenis';
import { motion, finePointer, reducedMotion } from './env';
import { initKinetic } from './split';
import { initPath } from './path';
import { initColorFlow } from './flow';
import { initOdometers } from './odometer';
import { initMagnetic } from './magnetic';
import { initRouter, type Route } from './router';
import { EARN } from './data';
import { buildTiles } from './tiles';
import { requestFrame } from './scroll';

const html = document.documentElement;
html.classList.add('js', `motion-${motion}`);

const animate = motion !== 'none';

// Плитки hero: коротке падіння лише на нормальних пристроях, інакше одразу на місці.
const cross = document.querySelector<HTMLElement>('.cross');
cross?.classList.add(motion === 'full' ? 'tiles-drop' : 'tiles-still');

// «Як заробляємо ми» з даних.
const earn = document.querySelector<HTMLElement>('[data-earn]');
earn?.replaceChildren(
  ...EARN.map((row, i) => {
    const r = document.createElement('div');
    r.className = `earn__row${i % 2 ? ' earn__row--alt' : ''}`;
    const p = document.createElement('p');
    p.className = 'earn__text';
    p.textContent = row.text;
    r.append(buildTiles(row.figure, { odometer: true, className: 'tiles--odo tiles--lg' }), p);
    return r;
  }),
);

initKinetic(document, animate);
const pathRoot = document.querySelector<HTMLElement>('[data-path]');
if (pathRoot) initPath(pathRoot, motion);
initOdometers(document, animate);
initMagnetic(document, finePointer && !reducedMotion);

// Плавний скрол лише для миші й тачпада; на телефоні нативний. Колесо, клавіатура, якорі
// й кнопка «Назад» працюють як звичайно: Lenis не перехоплює ні клавіші, ні історію.
const lenis = finePointer && motion === 'full' ? new Lenis({ autoRaf: true, smoothWheel: true, syncTouch: false }) : null;
lenis?.on('scroll', requestFrame);

const stage = document.querySelector<HTMLElement>('.bg-stage');
const homeSections = (): HTMLElement[] => [...document.querySelectorAll<HTMLElement>('.view[data-view="home"] .sec[data-bg]')];
if (stage && animate) initColorFlow(stage, homeSections);

const onShow = (r: Route): void => {
  html.classList.toggle('flow-on', animate && r.view === 'home');
  requestFrame();
};

const router = initRouter({
  animate,
  magnetic: finePointer && !reducedMotion,
  onShow,
  scrollTop: () => {
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    else window.scrollTo(0, 0);
  },
});

// «Як це працює» і «Ціни»: прокрутка до секції головної (з будь-якої сторінки).
document.querySelectorAll<HTMLAnchorElement>('[data-scroll]').forEach((a) => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    const id = a.dataset['scroll'] ?? '';
    const go = (): void => {
      const target = document.getElementById(id);
      if (!target) return;
      if (lenis) lenis.scrollTo(target, { offset: -72 });
      else target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
    };
    if (router.current().view !== 'home') {
      location.hash = '#/';
      window.setTimeout(go, 450);
    } else go();
  });
});
