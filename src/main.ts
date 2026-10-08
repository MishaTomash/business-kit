/**
 * Application entry: a tiny SPA.
 *
 *   route change → resolve view → swap markup (View Transition when supported)
 *               → mount behaviour → reveal → focus page heading
 *
 * Every view returns a cleanup, so nothing leaks between pages.
 */

import './styles/index.css';

import type { Route } from '@/types';
import { getCategory, getProject } from '@/data';
import { parseRoute, startRouter } from '@/router';
import { qs, qsa, render } from '@/lib/dom';
import { icon, type IconName } from '@/lib/icons';
import { initReveal } from '@/lib/reveal';
import { prefersReducedMotion } from '@/lib/motion';
import { mountNavbar } from '@/components/navbar';
import { homeView } from '@/views/home';
import { categoryView } from '@/views/category';
import { projectView } from '@/views/project';
import { notFoundView } from '@/views/notFound';
import type { Cleanup, View } from '@/views/view';

const app = qs('#app');
let cleanups: Cleanup[] = [];
/** Section to scroll to after the next home render (set by nav links on inner pages). */
let pendingSection: string | null = null;
let firstRender = true;

function resolveView(route: Route): View {
  switch (route.name) {
    case 'home':
      return homeView();
    case 'category': {
      const category = getCategory(route.id);
      return category ? categoryView(category) : notFoundView();
    }
    case 'project': {
      const project = getProject(route.id);
      return project ? projectView(project, getCategory(project.categoryId)) : notFoundView();
    }
  }
}

function scrollToSection(id: string, smooth = true): void {
  document.getElementById(id)?.scrollIntoView({ behavior: smooth && !prefersReducedMotion() ? 'smooth' : 'auto' });
}

/** Replace `<span data-icon="name">` placeholders with inline SVGs. */
function hydrateIcons(root: ParentNode): void {
  for (const el of qsa('[data-icon]', root)) {
    const name = el.dataset['icon'] as IconName | undefined;
    if (name) render(el, icon(name, 20));
  }
}

function swap(view: View): void {
  cleanups.forEach((fn) => fn());
  cleanups = [];

  render(app, view.markup);
  document.title = view.title;
  hydrateIcons(app);

  const cleanup = view.mount?.(app);
  if (cleanup) cleanups.push(cleanup);
  cleanups.push(initReveal(app));

  if (pendingSection) {
    scrollToSection(pendingSection, false);
    pendingSection = null;
  } else {
    window.scrollTo(0, 0);
    // Move focus to the new page's heading for screen-reader & keyboard users.
    if (!firstRender) app.querySelector<HTMLElement>('h1')?.focus({ preventScroll: true });
  }
  firstRender = false;
}

function onRoute(route: Route): void {
  const view = resolveView(route);
  // Smooth cross-fade between pages where the View Transitions API exists.
  if (!firstRender && 'startViewTransition' in document && !prefersReducedMotion()) {
    document.startViewTransition(() => swap(view));
  } else {
    swap(view);
  }
}

/** In-page section links (`data-scroll="faq"`) work from any route. */
document.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const link = target.closest<HTMLElement>('[data-scroll]');
  const section = link?.dataset['scroll'];
  if (!section) return;

  event.preventDefault();
  if (parseRoute().name === 'home') {
    scrollToSection(section);
  } else {
    pendingSection = section;
    location.hash = '#/';
  }
});

history.scrollRestoration = 'manual';
document.documentElement.classList.add('js');
qsa('[data-year]').forEach((el) => (el.textContent = String(new Date().getFullYear())));
hydrateIcons(document);
mountNavbar();

/**
 * Перший рендер чекає на шрифти (кириличні файли попередньо завантажуються з HTML),
 * але не довше 700 мс: так заголовки не перебудовуються після появи шрифту.
 */
const fontsReady: Promise<unknown> =
  'fonts' in document
    ? Promise.race([
        Promise.all([
          document.fonts.load('800 1em Unbounded', 'Бот Telegram'),
          document.fonts.load('400 1em Onest', 'Обираєте Telegram'),
          document.fonts.load('600 1em Onest', 'Обрати'),
        ]),
        new Promise((resolve) => setTimeout(resolve, 700)),
      ]).catch(() => undefined)
    : Promise.resolve();

void fontsReady.then(() => startRouter(onRoute));
