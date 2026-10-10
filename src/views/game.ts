/**
 * Сторінка гри /games/<id> за макетами «ДНК».
 * - Працює (макет page-33…44): крихти, бейдж «працює», «Хочу таку гру» й «Пограти», великий відбиток,
 *   ціни для гравців, калькулятор, що входить, план просування, коралова картка запуску.
 * - У розробці або заглушка (page-45…48): бейдж «у розробці», «Повідомити про запуск» з чесною фразою
 *   власника, відбиток, як гра працюватиме, тема під вас, за що гравці платитимуть. Без цін, калькулятора
 *   й «Пограти». Заглушки (mock) не індексуються й не потрапляють у sitemap.xml.
 * Тексти — з src/data (pages.ts, games.ts, business.ts).
 */

import type { View } from './view';
import type { Game } from '@/types';
import { BRAND, TELEGRAM_URL } from '@/data/site';
import { CATALOG, GAME_PAGE } from '@/data/pages';
import { OFFERINGS } from '@/data/business';
import { GENRE_LABELS } from '@/data/genres';
import { isPlayable } from '@/data';
import { html, type SafeHtml } from '@/lib/dom';
import { STAR_ICON } from '@/lib/icons';
import { href } from '@/router';
import { badge, button, cover } from '@/components/ui';
import { calculatorMarkup, mountCalculator } from '@/components/calculator';
import { LASTMOD } from '@/data/seo';
import { breadcrumbs } from '@/lib/schema';
import { mountCommon } from './common';

const dnaMark = html`<span class="dna-mark" aria-hidden="true"><span></span></span>`;

/** Ціна для гравців: «10 ★» → золоте число зі значком зірки; інший текст — як є. */
function playerPrice(price: string): SafeHtml {
  const m = /^(\d[\d\s ]*)\s*[★⭐]$/.exec(price.trim());
  if (!m?.[1]) return html`<span>${price}</span>`;
  const n = m[1].trim();
  return html`<span class="star-sum num">${n}&nbsp;<span class="gp-star">${STAR_ICON}</span><span class="sr-only"> зірок</span></span>`;
}

function hero(g: Game, live: boolean): SafeHtml {
  const genre = GENRE_LABELS[g.dna.genre];
  return html`
    <section class="sec ghero" aria-labelledby="game-t">
      <div class="wrap ghero__in">
        <div class="ghero__text">
          <nav class="crumbs" aria-label="Навігація"><a href="${href.games()}">${GAME_PAGE.crumbs}</a><span aria-hidden="true">/</span><span>${genre}</span></nav>
          <p class="ghero__meta">${badge(live)}<span class="muted">${genre}</span></p>
          <h1 class="h1" id="game-t">${g.name}</h1>
          <p class="lead">${g.tagline}</p>
          ${live
            ? html`
                <div class="actions">${button(TELEGRAM_URL, GAME_PAGE.want, { external: true })}${g.botUrl ? button(g.botUrl, GAME_PAGE.play, { variant: 'ghost', external: true }) : ''}</div>
                <p class="ghero__terms small muted">${GAME_PAGE.terms}</p>
              `
            : html`
                <div class="actions">${button(TELEGRAM_URL, GAME_PAGE.soon.notify, { external: true })}</div>
                <p class="ghero__terms small muted">${GAME_PAGE.soon.notifyNote}.</p>
              `}
        </div>
        <div class="ghero__fp">${cover(g, { hero: true, morph: true })}</div>
      </div>
    </section>
  `;
}

function prices(g: Game): SafeHtml {
  return html`
    <section class="sec gprices" aria-labelledby="gp-t">
      <div class="wrap split">
        <div>
          <h2 class="h2" id="gp-t">${GAME_PAGE.prices.title}</h2>
          <p class="lead">${g.howItEarns}</p>
        </div>
        <dl class="ptable">
          ${g.customerPrices.map((p) => html`<div><dt>${p.label}</dt><dd>${playerPrice(p.price)}</dd></div>`)}
        </dl>
      </div>
    </section>
  `;
}

function calc(g: Game): SafeHtml {
  return html`
    <section class="sec tone-layer gcalc" id="calc" aria-labelledby="gc-t">
      <div class="wrap">
        <h2 class="h2" id="gc-t">${GAME_PAGE.calc.title}</h2>
        ${calculatorMarkup(g)}
      </div>
    </section>
  `;
}

function includes(g: Game): SafeHtml {
  return html`
    <section class="sec tone-light gincl" aria-labelledby="gi-t">
      <div class="wrap split">
        <h2 class="h2" id="gi-t">${GAME_PAGE.includes.title}</h2>
        <ul class="ilist">${g.includes.map((i) => html`<li>${dnaMark}<p>${i}</p></li>`)}</ul>
      </div>
    </section>
  `;
}

function plan(g: Game): SafeHtml {
  return html`
    <section class="sec gplan" aria-labelledby="gpl-t">
      <div class="wrap">
        <h2 class="h2" id="gpl-t">${GAME_PAGE.plan.title}</h2>
        <p class="lead">${GAME_PAGE.plan.lead(g.firstClientDays, g.dailyMinutes)}</p>
        <ol class="phases">
          ${g.plan.map(
            (p) => html`<li class="phase"><p class="eyebrow">${p.period}</p><h3 class="phase__title">${p.title}</h3><ul class="phase__tasks">${p.tasks.map((t) => html`<li>${t}</li>`)}</ul></li>`,
          )}
        </ol>
      </div>
    </section>
  `;
}

function buy(g: Game): SafeHtml {
  const b = GAME_PAGE.buy;
  return html`
    <section class="sec tone-coral gbuy" aria-labelledby="gb-t">
      <div class="wrap gbuy__in">
        <div>
          <h2 class="h2" id="gb-t">${b.title(g.name)}</h2>
          <dl class="gbuy__rows">${b.rows.map((r) => html`<div><dt class="num">${r.value}</dt><dd>${r.text}</dd></div>`)}</dl>
          <p class="gbuy__note">${b.note}</p>
        </div>
        <div class="actions">${button(TELEGRAM_URL, GAME_PAGE.want, { external: true })}</div>
      </div>
    </section>
  `;
}

function soon(g: Game): SafeHtml {
  const s = GAME_PAGE.soon;
  const [name, content] = OFFERINGS;
  return html`
    <section class="sec gsoon" aria-labelledby="gs-t">
      <div class="wrap split">
        <div>
          <h2 class="h2" id="gs-t">${s.how}</h2>
          <ul class="ilist">${g.mechanics.map((m) => html`<li>${dnaMark}<p>${m}</p></li>`)}</ul>
        </div>
        <div class="gsoon__side">
          <h3 class="h3">${s.pay}</h3>
          <p class="muted">${g.howItEarns}</p>
          <h3 class="h3">${s.theme}</h3>
          <p class="muted">${name?.text} ${content?.text}</p>
        </div>
      </div>
    </section>
  `;
}

export function gameView(g: Game): View {
  const live = isPlayable(g);
  const m = GAME_PAGE.meta;
  return {
    key: `game:${g.id}`,
    navTone: 'dark',
    meta: {
      title: live && g.searchTitle ? g.searchTitle : `${live ? m.liveTitle(g.name, GENRE_LABELS[g.dna.genre]) : m.soonTitle(g.name)} — ${BRAND}`,
      ogTitle: live ? m.liveOg(g.name) : m.soonOg(g.name),
      description: live ? m.liveDescription(g.tagline) : m.soonDescription(g.tagline),
      ogImage: g.ogImage ?? `/og/${g.id}.png`,
      path: href.game(g.id),
      ...(g.mock ? { noindex: true } : {}),
      ...(LASTMOD[href.game(g.id)] ? { lastmod: LASTMOD[href.game(g.id)] } : {}),
      // Крихти лише для сторінок, які індексуються (заглушки мають noindex).
      ...(g.mock ? {} : { jsonLd: [breadcrumbs([['Головна', href.home()], [CATALOG.title, href.games()], [g.name, href.game(g.id)]])] }),
    },
    markup: live ? html`${hero(g, true)}${prices(g)}${calc(g)}${includes(g)}${plan(g)}${buy(g)}` : html`${hero(g, false)}${soon(g)}`,
    mount(root, ctx) {
      const off = mountCommon(root, ctx);
      if (!live) return off;
      const offCalc = mountCalculator(root, g);
      return () => {
        off();
        offCalc();
      };
    },
  };
}
