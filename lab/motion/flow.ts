/**
 * Перетікання кольору тла між секціями. Фіксовані шари кольору під сторінкою
 * змінюють лише opacity, тому браузер не перемальовує вміст секцій.
 */
import { clamp } from './env';
import { onScrollFrame } from './scroll';

export function initColorFlow(stage: HTMLElement, getSections: () => HTMLElement[]): void {
  const layers = new Map<string, HTMLElement>();
  stage.querySelectorAll<HTMLElement>('[data-c]').forEach((l) => layers.set(l.dataset['c'] ?? '', l));
  const nav = document.querySelector<HTMLElement>('.nav');
  let lastKey = '';

  const update = (): void => {
    if (!document.documentElement.classList.contains('flow-on')) return;
    const sections = getSections();
    if (sections.length === 0) return;
    const vh = window.innerHeight;
    const tops = sections.map((s) => s.getBoundingClientRect().top);
    let cur = 0;
    tops.forEach((t, i) => {
      if (t <= vh * 0.45) cur = i;
    });
    const curC = sections[cur]?.dataset['bg'] ?? 'mint';
    const next = sections[cur + 1];
    const nextTop = tops[cur + 1];
    const nextC = next?.dataset['bg'];
    // Тло змінюється, поки межа секцій проходить середину екрана. Колір тексту всіх секцій
    // перемикається разом із переважним кольором тла (на mix = 0,5), тож текст завжди
    // контрастний до того кольору, якого на екрані більше.
    const mix = next && nextTop !== undefined ? clamp((vh * 0.75 - nextTop) / (vh * 0.3)) : 0;
    const dominant = mix >= 0.5 && nextC ? nextC : curC;
    document.documentElement.dataset['flowTone'] = dominant === 'forest' ? 'dark' : 'light';

    const key = `${curC}|${nextC ?? ''}|${mix.toFixed(3)}`;
    if (key !== lastKey) {
      layers.forEach((layer, c) => {
        if (c === curC) {
          layer.style.zIndex = '1';
          layer.style.opacity = '1';
        } else if (c === nextC) {
          layer.style.zIndex = '2';
          layer.style.opacity = String(mix);
        } else {
          layer.style.opacity = '0';
        }
      });
      lastKey = key;
    }

    // Тон шапки: світлий текст над хвоєю.
    if (nav) {
      const navMid = nav.offsetHeight / 2;
      let under = 0;
      tops.forEach((t, i) => {
        if (t <= navMid) under = i;
      });
      nav.dataset['tone'] = sections[under]?.dataset['bg'] === 'forest' ? 'dark' : 'light';
    }
  };

  onScrollFrame(update);
}
