/**
 * Сцена hero: телефони ботів перемикаються самі.
 *
 *   [data-rot]            контейнер
 *   [data-rot-item]       елементи; активний отримує .is-active і data-pos="0"
 *   [data-rot-tab]        кнопки ручного вибору (aria-pressed)
 *
 * Пауза при наведенні, фокусі й прихованій вкладці. Без автоперемикання,
 * якщо ввімкнено prefers-reduced-motion (кнопки працюють).
 */

import { prefersReducedMotion } from './motion';

export function mountRotator(root: HTMLElement, intervalMs = 5200): () => void {
  const items = [...root.querySelectorAll<HTMLElement>('[data-rot-item]')];
  const tabs = [...root.querySelectorAll<HTMLButtonElement>('[data-rot-tab]')];
  if (items.length < 2) {
    items[0]?.classList.add('is-active');
    return () => undefined;
  }

  let index = 0;
  let paused = false;

  const show = (next: number): void => {
    index = (next + items.length) % items.length;
    items.forEach((el, k) => {
      el.classList.toggle('is-active', k === index);
      el.dataset['pos'] = String((k - index + items.length) % items.length);
    });
    tabs.forEach((t, k) => t.setAttribute('aria-pressed', String(k === index)));
  };

  show(0);
  root.classList.add('is-ready');

  tabs.forEach((t, k) =>
    t.addEventListener('click', () => {
      show(k);
      paused = true; // людина обрала сама: не перебиваємо
    }),
  );
  root.addEventListener('pointerenter', () => (paused = true));
  root.addEventListener('pointerleave', () => (paused = false));
  root.addEventListener('focusin', () => (paused = true));

  if (prefersReducedMotion()) return () => undefined;
  const timer = window.setInterval(() => {
    if (!paused && !document.hidden) show(index + 1);
  }, intervalMs);
  return () => window.clearInterval(timer);
}
