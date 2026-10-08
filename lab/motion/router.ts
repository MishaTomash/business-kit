/**
 * Маршрути прототипу: #/, #/games, #/games/<id>. Перехід через View Transitions API:
 * обкладинка картки «перетікає» в hero гри. Без підтримки API сторінка просто змінюється.
 */
import { GAMES, TELEGRAM_URL, type LabGame } from './data';
import { buildTiles } from './tiles';
import { initKinetic } from './split';
import { initMagnetic } from './magnetic';

export type Route = { readonly view: 'home' } | { readonly view: 'games' } | { readonly view: 'game'; readonly id: string };

export function parseRoute(hash: string): Route {
  const m = /^#\/games(?:\/([\w-]+))?\/?$/.exec(hash);
  if (!m) return { view: 'home' };
  return m[1] ? { view: 'game', id: m[1] } : { view: 'games' };
}

/** Заглушка завжди поводиться як «скоро», навіть якщо помилково available. */
const playable = (g: LabGame): boolean => g.status === 'available' && !g.mock;

/** Темне тло: відносна яскравість нижче 0,2. */
function isDark(hex: string): boolean {
  const v = hex.replace('#', '');
  const ch = [0, 2, 4].map((i) => {
    const c = parseInt(v.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const [r = 0, g = 0, b = 0] = ch;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.2;
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, text?: string): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

function cover(g: LabGame, big = false): HTMLElement {
  const c = el('div', `cover${big ? ' cover--hero' : ''}`);
  c.style.setProperty('--g-bg', g.bg);
  c.style.setProperty('--g-tile', g.tile);
  c.style.setProperty('--g-tile-ink', g.tileInk);
  const t = buildTiles(g.word, { className: 'tiles--cover' });
  t.setAttribute('aria-hidden', 'true');
  t.removeAttribute('role');
  t.removeAttribute('aria-label');
  c.append(t);
  return c;
}

function key(href: string, label: string, external = false): HTMLAnchorElement {
  const a = el('a', 'key');
  a.href = href;
  a.dataset['magnetic'] = '';
  if (external) {
    a.target = '_blank';
    a.rel = 'noopener';
  }
  a.append(el('span', 'key__face', label));
  return a;
}

export interface RouterDeps {
  readonly animate: boolean;
  readonly magnetic: boolean;
  readonly onShow: (route: Route) => void;
  readonly scrollTop: () => void;
}

export function initRouter(deps: RouterDeps): { current: () => Route } {
  const views = new Map<string, HTMLElement>();
  document.querySelectorAll<HTMLElement>('[data-view]').forEach((v) => views.set(v.dataset['view'] ?? '', v));
  const cardsEl = document.querySelector<HTMLElement>('[data-cards]');
  const countEl = document.querySelector<HTMLElement>('[data-games-count]');
  const gameEl = document.querySelector<HTMLElement>('[data-game]');
  const coverByCard = new Map<string, HTMLElement>();

  if (import.meta.env.DEV) {
    const mocks = GAMES.filter((g) => g.mock).map((g) => g.id);
    if (mocks.length) console.warn(`[ігри] Досі заглушки (mock): ${mocks.join(', ')}`);
  }

  // Каталог: спершу доступні, потім «скоро».
  const sorted = [...GAMES].sort((a, b) => Number(playable(b)) - Number(playable(a)));
  if (countEl) {
    const live = sorted.filter(playable).length;
    countEl.textContent = `Доступно зараз: ${live}. У розробці: ${sorted.length - live}.`;
  }
  cardsEl?.replaceChildren(
    ...sorted.map((g) => {
      const li = el('li');
      const a = el('a', 'card');
      a.href = `#/games/${g.id}`;
      const c = cover(g);
      coverByCard.set(g.id, c);
      const body = el('div', 'card__body');
      body.append(
        el('h2', 'card__name', g.name),
        el('p', 'card__genre', g.genre),
        el('p', 'card__line', g.line),
        el('p', `card__status${playable(g) ? ' is-live' : ''}`, playable(g) ? 'Доступна' : 'У розробці'),
      );
      a.append(c, body);
      li.append(a);
      return li;
    }),
  );

  const renderGame = (id: string): void => {
    if (!gameEl) return;
    const g = GAMES.find((x) => x.id === id);
    gameEl.replaceChildren();
    if (!g) {
      const wrap = el('div', 'wrap game__missing');
      const back = el('a', 'tlink', 'До ігор');
      back.href = '#/games';
      wrap.append(el('h1', 'h1', 'Такої гри немає'), el('p', 'lead', 'Можливо, адреса змінилась. Усі ігри зібрані в каталозі.'), back);
      gameEl.append(wrap);
      return;
    }
    gameEl.style.setProperty('--g-bg', g.bg);
    gameEl.style.setProperty('--g-ink', g.ink);
    gameEl.classList.toggle('game--dark', isDark(g.bg));
    const wrap = el('div', 'wrap game__in');
    const back = el('a', 'tlink game__back', 'До всіх ігор');
    back.href = '#/games';
    const c = cover(g, true);
    c.style.viewTransitionName = 'game-cover';
    const text = el('div', 'game__text');
    text.append(el('p', 'game__genre', g.genre), el('h1', 'h1 kinetic', g.name), el('p', 'lead', g.line));
    const actions = el('div', 'actions');
    if (playable(g) && g.botUrl) {
      actions.append(key(g.botUrl, 'Пограти', true));
      const want = el('a', 'tlink', 'Хочу таку гру');
      want.href = TELEGRAM_URL;
      want.target = '_blank';
      want.rel = 'noopener';
      actions.append(want);
    } else {
      text.append(el('p', 'game__soon', 'У розробці'));
      actions.append(key(TELEGRAM_URL, 'Повідомити про запуск', true));
    }
    text.append(actions);
    if (playable(g) && g.prices?.length) {
      const dl = el('dl', 'prices');
      for (const pr of g.prices) {
        const row = el('div');
        row.append(el('dt', '', pr.label), el('dd', '', pr.price.replace('⭐', '★')));
        dl.append(row);
      }
      text.append(dl);
    }
    wrap.append(back, c, text);
    gameEl.append(wrap);
    initKinetic(gameEl, deps.animate);
    initMagnetic(gameEl, deps.magnetic);
  };

  let route = parseRoute(location.hash);

  const show = (r: Route): void => {
    if (r.view === 'game') renderGame(r.id);
    views.forEach((v, name) => (v.hidden = name !== r.view));
    document.documentElement.dataset['route'] = r.view;
    const nav = document.querySelector<HTMLElement>('.nav');
    const g = r.view === 'game' ? GAMES.find((x) => x.id === r.id) : undefined;
    const pageBg = r.view === 'home' ? '#d5eedc' : g ? g.bg : '#ffffff';
    document.documentElement.style.setProperty('--page-bg', pageBg);
    document.documentElement.dataset['pageTone'] = isDark(pageBg) ? 'dark' : 'light';
    if (nav && r.view !== 'home') nav.dataset['tone'] = isDark(pageBg) ? 'dark' : 'light';
    document.querySelectorAll<HTMLAnchorElement>('[data-nav]').forEach((a) => {
      const on = a.dataset['nav'] === (r.view === 'game' ? 'games' : r.view);
      if (on) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    deps.scrollTop();
    deps.onShow(r);
  };

  const navigate = (next: Route): void => {
    const prev = route;
    route = next;
    // Ім'я переходу лише на одній обкладинці: тій, що веде в гру або з гри.
    coverByCard.forEach((c) => (c.style.viewTransitionName = ''));
    const pairId = next.view === 'game' && prev.view === 'games' ? next.id : prev.view === 'game' && next.view === 'games' ? prev.id : null;
    const pair = pairId ? coverByCard.get(pairId) : undefined;
    if (pair) pair.style.viewTransitionName = 'game-cover';
    if (prev.view === 'game' && next.view !== 'games') {
      gameEl?.querySelector<HTMLElement>('.cover--hero')?.style.setProperty('view-transition-name', 'none');
    }

    const swap = (): void => {
      show(next);
      if (pair && next.view === 'game') pair.style.viewTransitionName = '';
    };
    if (!deps.animate || typeof document.startViewTransition !== 'function') {
      swap();
      return;
    }
    const vt = document.startViewTransition(swap);
    vt.finished.finally(() => coverByCard.forEach((c) => (c.style.viewTransitionName = ''))).catch(() => undefined);
  };

  window.addEventListener('hashchange', () => navigate(parseRoute(location.hash)));
  show(route);
  return { current: () => route };
}
