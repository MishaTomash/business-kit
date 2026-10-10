/**
 * Каталог /games за макетом «ДНК» (design/pages/page-25…32): чіпи жанрів із кількістю, рядки ігор
 * з генетичним відбитком, наприкінці картка «Немає потрібної гри?».
 * Фільтр — посилання /games?genre=<жанр>: без JS видно всі ігри, з JS список фільтрується на місці.
 * Порядок: спершу ігри, що працюють, далі «у розробці» (src/data/index.ts → catalog()).
 */

import type { View } from './view';
import type { Game, GenreId } from '@/types';
import { BRAND, TELEGRAM_URL } from '@/data/site';
import { CATALOG } from '@/data/pages';
import { HOME } from '@/data/home';
import { GENRE_LABELS } from '@/data/genres';
import { catalog, isPlayable, liveCount, soonCount } from '@/data';
import { GENRE_IDS } from '@/lib/fingerprint';
import { html, type SafeHtml } from '@/lib/dom';
import { href } from '@/router';
import { badge, button, tlink } from '@/components/ui';
import { fingerprintStrip } from '@/components/fingerprint';
import { LASTMOD } from '@/data/seo';
import { breadcrumbs } from '@/lib/schema';
import { mountCommon } from './common';

function row(g: Game, morphId?: string): SafeHtml {
  const live = isPlayable(g);
  return html`
    <li class="crow" data-genre="${g.dna.genre}">
      <div class="crow__fp" ${morphId === g.id ? html`style="view-transition-name:game-cover"` : ''} data-cover="${g.id}">${fingerprintStrip(g, 'row')}</div>
      <div class="crow__name">
        <h2 class="crow__title"><a href="${href.game(g.id)}">${g.name}</a></h2>
        <p class="crow__genre">${GENRE_LABELS[g.dna.genre]}</p>
      </div>
      <p class="crow__line">${g.tagline}</p>
      <div class="crow__act">
        ${badge(live)}
        ${live && g.botUrl ? button(g.botUrl, CATALOG.play, { variant: 'ghost', small: true, external: true }) : ''}
        ${live ? '' : tlink(TELEGRAM_URL, CATALOG.notify, true)}
      </div>
    </li>
  `;
}

function filter(list: readonly Game[]): SafeHtml {
  const counts = new Map<GenreId, number>();
  for (const g of list) counts.set(g.dna.genre, (counts.get(g.dna.genre) ?? 0) + 1);
  const present = GENRE_IDS.filter((id) => counts.has(id));
  return html`
    <nav class="chips cfilter" aria-label="${CATALOG.filterLabel}" data-filter>
      <a class="chip" href="${href.games()}" data-genre="" aria-current="true">${CATALOG.allLabel}<span class="chip__count">${list.length}</span></a>
      ${present.map((id) => html`<a class="chip" href="${href.games()}?genre=${id}" data-genre="${id}" aria-current="false">${GENRE_LABELS[id]}<span class="chip__count">${counts.get(id) ?? 0}</span></a>`)}
    </nav>
  `;
}

/** Фільтр жанру: читає ?genre= з адреси, перемикає чіпи й рядки, оновлює адресу без перезавантаження. */
function mountFilter(root: ParentNode): void {
  const box = root.querySelector<HTMLElement>('[data-filter]');
  if (!box) return;
  const rows = [...root.querySelectorAll<HTMLElement>('.crow')];
  const known = new Set<string>(GENRE_IDS);
  const apply = (genre: string): void => {
    const g = known.has(genre) ? genre : '';
    box.querySelectorAll<HTMLElement>('[data-genre]').forEach((c) => c.setAttribute('aria-current', String(c.dataset['genre'] === g)));
    rows.forEach((r) => (r.hidden = g !== '' && r.dataset['genre'] !== g));
  };
  apply(new URLSearchParams(location.search).get('genre') ?? '');
  box.addEventListener('click', (e) => {
    const chip = (e.target as Element | null)?.closest<HTMLAnchorElement>('a[data-genre]');
    if (!chip || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    const genre = chip.dataset['genre'] ?? '';
    apply(genre);
    history.replaceState(history.state, '', genre ? `${href.games()}?genre=${genre}` : href.games());
  });
}

export function gamesView(morphId?: string): View {
  const list = catalog();
  return {
    key: 'games',
    navTone: 'dark',
    meta: {
      title: `${CATALOG.meta.title} — ${BRAND}`,
      ogTitle: CATALOG.meta.ogTitle,
      description: CATALOG.meta.description(liveCount(), soonCount()),
      ogImage: '/og/default.png',
      path: href.games(),
      ...(LASTMOD['/games'] ? { lastmod: LASTMOD['/games'] } : {}),
      jsonLd: [breadcrumbs([['Головна', href.home()], [CATALOG.title, href.games()]])],
    },
    markup: html`
      <section class="sec catalog" aria-labelledby="games-t">
        <div class="wrap">
          <h1 class="h1 catalog__title" id="games-t">${CATALOG.title}</h1>
          <p class="lead">${CATALOG.lead} ${HOME.catalog.status(liveCount(), soonCount())}.</p>
          ${filter(list)}
          <ul class="crows">${list.map((g) => row(g, morphId))}</ul>
          <aside class="cwish" aria-labelledby="wish-t">
            <div>
              <h2 class="cwish__title" id="wish-t">${CATALOG.wish.title}</h2>
              <p class="muted">${CATALOG.wish.text}</p>
            </div>
            ${button(TELEGRAM_URL, CATALOG.wish.cta, { variant: 'ghost', external: true })}
          </aside>
        </div>
      </section>
    `,
    mount(root, ctx) {
      mountFilter(root);
      return mountCommon(root, ctx);
    },
  };
}
