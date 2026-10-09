/**
 * Вхід застосунку в браузері.
 *
 * Кожна сторінка вже прийшла з сервера готовим HTML (prerender), тож при першому
 * відкритті ми лише вмикаємо поведінку. Далі переходи всередині сайту йдуть без
 * перезавантаження: History API + View Transitions (обкладинка картки «перетікає» в hero гри).
 */

import './styles/index.css';

import { qs } from '@/lib/dom';
import { hasFinePointer, motionLevel, prefersReducedMotion } from '@/lib/env';
import { legacyRedirect, parsePath } from '@/router';
import { resolveView } from '@/pages';
import { SITE_URL } from '@/data/site';
import type { Cleanup, MountContext, View } from '@/views/view';

const app = qs('#app');
const html = document.documentElement;
const ctx: MountContext = { motion: motionLevel(), finePointer: hasFinePointer() };
html.classList.add('js', `motion-${ctx.motion}`);
history.scrollRestoration = 'manual';

let current: View | null = null;
let cleanup: Cleanup | null = null;

function setMeta(view: View): void {
  document.title = view.meta.title;
  document.querySelector('meta[name="description"]')?.setAttribute('content', view.meta.description);
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', `${SITE_URL}${view.meta.path}`);
}

function setNav(view: View): void {
  html.dataset['navTone'] = view.navTone ?? 'light';
  const active = view.key === 'home' ? 'home' : view.key.startsWith('game') ? 'games' : '';
  document.querySelectorAll<HTMLAnchorElement>('[data-nav]').forEach((a) => {
    if (a.dataset['nav'] === active) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  const menu = document.querySelector<HTMLDetailsElement>('.menu');
  if (menu) menu.open = false;
}

function mount(view: View): void {
  cleanup?.();
  current = view;
  setNav(view);
  cleanup = view.mount?.(app, ctx) ?? null;
}

/** Висота липкої шапки: щоб заголовок секції не ховався під нею. */
const headerOffset = (): number => (document.querySelector<HTMLElement>('.nav')?.offsetHeight ?? 0) + 16;

/** Скрол нативний: колесо, PageDown, якорі й «Назад» працюють як звичайно. */
function scrollToY(y: number, smooth: boolean): void {
  window.scrollTo({ top: y, behavior: smooth && !prefersReducedMotion() ? 'smooth' : 'auto' });
}

function scrollToHash(hash: string, smooth: boolean): boolean {
  const el = hash.length > 1 ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
  if (!el) return false;
  scrollToY(el.getBoundingClientRect().top + window.scrollY - headerOffset(), smooth);
  return true;
}

function swap(view: View, opts: { y?: number; hash?: string }): void {
  cleanup?.();
  cleanup = null;
  app.innerHTML = view.markup.value;
  app.dataset['route'] = view.key;
  setMeta(view);
  mount(view);
  if (opts.y !== undefined) scrollToY(opts.y, false);
  else if (!(opts.hash && scrollToHash(opts.hash, false))) scrollToY(0, false);
  const h1 = app.querySelector<HTMLElement>('h1');
  if (h1) {
    h1.tabIndex = -1;
    h1.focus({ preventScroll: true });
  }
}

const gameIdOf = (key: string | undefined): string | undefined => (key?.startsWith('game:') ? key.slice(5) : undefined);

function go(pathname: string, opts: { y?: number; hash?: string }): void {
  const route = parsePath(pathname);
  const prevKey = current?.key;
  // Назад з гри в каталог: обкладинка цієї гри в каталозі отримує ім'я переходу.
  const backFrom = route.name === 'games' ? gameIdOf(prevKey) : undefined;
  const view = resolveView(route, { ...(backFrom ? { morphId: backFrom } : {}), path: pathname });
  // Уперед з каталогу в гру: ім'я переходу на обкладинці картки, на яку натиснули.
  if (prevKey === 'games' && route.name === 'game') {
    app.querySelector<HTMLElement>(`[data-cover="${CSS.escape(route.id)}"]`)?.style.setProperty('view-transition-name', 'game-cover');
  }
  if (prefersReducedMotion() || typeof document.startViewTransition !== 'function') swap(view, opts);
  else document.startViewTransition(() => swap(view, opts));
}

document.addEventListener('click', (e) => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = (e.target as Element | null)?.closest<HTMLAnchorElement>('a[href]');
  if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin) return;
  if (url.pathname.startsWith('/lab/') || /\.[a-z0-9]+$/i.test(url.pathname)) return;
  e.preventDefault();
  const same = parsePath(url.pathname).name === parsePath(location.pathname).name && url.pathname.replace(/\/$/, '') === location.pathname.replace(/\/$/, '');
  if (same) {
    if (url.hash) {
      scrollToHash(url.hash, true);
      history.replaceState(history.state, '', url.pathname + url.hash);
    } else scrollToY(0, true);
    return;
  }
  history.replaceState({ y: window.scrollY }, '');
  history.pushState({ y: 0 }, '', url.pathname + url.hash);
  go(url.pathname, url.hash ? { hash: url.hash } : {});
});

window.addEventListener('popstate', (e) => {
  // Старе hash-посилання, вставлене в адресний рядок уже відкритого сайту: теж перенаправляємо.
  const old = legacyRedirect(location.hash);
  if (old) {
    history.replaceState({ y: 0 }, '', old);
    go(old, {});
    return;
  }
  const state = e.state as { y?: number } | null;
  go(location.pathname, typeof state?.y === 'number' ? { y: state.y } : location.hash ? { hash: location.hash } : {});
});

/* ---------------------------------------------------------------- мобільне меню */
// <details> відкривається й закривається без JS; тут лише зручності: Escape і клік поза меню.
const menu = document.querySelector<HTMLDetailsElement>('.menu');
if (menu) {
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || !menu.open) return;
    menu.open = false;
    menu.querySelector<HTMLElement>('summary')?.focus();
  });
  document.addEventListener('click', (e) => {
    if (menu.open && !menu.contains(e.target as Node)) menu.open = false;
  });
}

/* ---------------------------------------------------------------- старт */
const legacy = legacyRedirect(location.hash);
if (legacy) history.replaceState({ y: 0 }, '', legacy);
const first = resolveView(parsePath(location.pathname), { path: location.pathname });
if (!legacy && app.dataset['route'] === first.key) {
  mount(first);
  if (location.hash) document.fonts?.ready.then(() => scrollToHash(location.hash, false)).catch(() => undefined);
} else {
  swap(first, location.hash && !legacy ? { hash: location.hash } : {});
}
