/** Каталог ігор /games. Гарно виглядає з 1, 3, 5, 12 і 20 іграми; фільтр жанрів — коли ігор більше шести. */

import type { View } from './view';
import type { Game } from '@/types';
import { BRAND } from '@/data/site';
import { FILTER_FROM, catalog, genres, isPlayable, liveCount, soonCount } from '@/data';
import { html, raw, type SafeHtml } from '@/lib/dom';
import { href } from '@/router';
import { cover } from '@/components/ui';
import { mountCommon } from './common';

function card(g: Game, morphId?: string): SafeHtml {
  const live = isPlayable(g);
  return html`
    <li class="cards__item" data-genre="${g.genre}">
      <a class="card" href="${href.game(g.id)}" data-game-link="${g.id}">
        ${cover(g, { morph: morphId === g.id })}
        <div class="card__body">
          <h2 class="card__name">${g.name}</h2>
          <p class="card__genre">${g.genre}</p>
          <p class="card__line">${g.tagline}</p>
          <p class="card__status${live ? ' is-live' : ''}">${live ? 'Доступна' : 'У розробці'}</p>
        </div>
      </a>
    </li>
  `;
}

function filter(): SafeHtml {
  return html`
    <div class="filter" role="group" aria-label="Жанр" data-filter>
      <button type="button" class="chip" aria-pressed="true" data-genre="">Усі</button>
      ${genres().map((g) => html`<button type="button" class="chip" aria-pressed="false" data-genre="${g}">${g}</button>`)}
    </div>
  `;
}

function mountFilter(root: ParentNode): void {
  const box = root.querySelector<HTMLElement>('[data-filter]');
  if (!box) return;
  const items = [...root.querySelectorAll<HTMLElement>('.cards__item')];
  box.addEventListener('click', (e) => {
    const btn = (e.target as Element | null)?.closest<HTMLButtonElement>('button[data-genre]');
    if (!btn) return;
    const genre = btn.dataset['genre'] ?? '';
    box.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    items.forEach((it) => (it.hidden = genre !== '' && it.dataset['genre'] !== genre));
  });
}

export function gamesView(morphId?: string): View {
  const list = catalog();
  return {
    key: 'games',
    meta: {
      title: `Ігри для вашого Telegram-каналу — ${BRAND}`,
      ogTitle: `Ігри для вашого Telegram-каналу`,
      description: `Каталог ігор у Telegram під ключ. Доступно зараз: ${liveCount()}, у розробці: ${soonCount()}. Кожна гра запускається під назвою й кольорами вашого каналу.`,
      ogImage: '/og/default.png',
      path: href.games(),
    },
    markup: html`
      <section class="sec sec--white catalog" aria-labelledby="games-t">
        <div class="wrap">
          <h1 class="h1 kinetic" id="games-t" data-kinetic="now">Ігри для вашого каналу</h1>
          <p class="lead">Доступно зараз: ${liveCount()}. У розробці: ${soonCount()}. Кожна гра запускається під назвою й кольорами вашого каналу.</p>
          ${list.length >= FILTER_FROM ? filter() : raw('')}
          <ul class="cards" data-count="${list.length > 3 ? 'many' : list.length}">${list.map((g) => card(g, morphId))}</ul>
        </div>
      </section>
    `,
    mount(root, ctx) {
      mountFilter(root);
      return mountCommon(root, ctx);
    },
  };
}
