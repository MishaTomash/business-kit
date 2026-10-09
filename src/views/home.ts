/**
 * Головна за макетом «ДНК» (design/pages/page-06…24): hero зі спіраллю, «Шлях зірки», чому це вигідно,
 * що ми надаємо й ціни, для кого, як проходить запуск, стислий каталог (жанри й кількість), FAQ, заклик.
 * Усі тексти й числа — з src/data (home.ts, business.ts, site.ts, games.ts); у розмітці їх немає.
 * Конкретна гра (Слововир) на головній не описується.
 */

import type { View } from './view';
import type { GenreId } from '@/types';
import { BRAND, BRAND_LINE, PRICING, STARS_COMMISSION, TELEGRAM_URL } from '@/data/site';
import { AUDIENCES, LAUNCH, OFFERINGS, OUR_PRICES, REASONS, textNumber } from '@/data/business';
import { HOME } from '@/data/home';
import { GENRE_LABELS } from '@/data/genres';
import { GAMES, liveCount, soonCount } from '@/data';
import { GENRE_IDS } from '@/lib/fingerprint';
import { html, type SafeHtml } from '@/lib/dom';
import { href } from '@/router';
import { button } from '@/components/ui';
import { starPathMarkup } from '@/components/starPath';
import { spiralMarkup } from '@/components/spiral';
import { faqMarkup } from '@/components/faq';
import { mountCommon } from './common';
import { initStarPath } from '@/lib/star-path';
import { initSpiral } from '@/lib/spiral';

const twoDigits = (i: number): string => String(i + 1).padStart(2, '0');

function hero(): SafeHtml {
  const h = HOME.hero;
  return html`
    <section class="sec hero" aria-labelledby="hero-t">
      <div class="wrap hero__in">
        <div class="hero__visual">${spiralMarkup({ rungs: 22, name: 'hero', className: 'spiral--hero spiral--h' })}</div>
        <div class="hero__text">
          <h1 class="h1" id="hero-t">${h.title}</h1>
          <p class="lead">${h.lead}</p>
          <div class="actions">${button(href.games(), h.primary)}${button(TELEGRAM_URL, h.secondary, { variant: 'ghost', external: true })}</div>
          <dl class="facts">
            ${h.facts.map((f) => html`<div class="facts__item"><dt class="facts__label">${f.label}</dt><dd class="facts__value num${'accent' in f && f.accent ? ' is-accent' : ''}">${f.value}</dd></div>`)}
          </dl>
        </div>
      </div>
    </section>
  `;
}

function reasons(): SafeHtml {
  return html`
    <section class="sec reasons" aria-labelledby="reasons-t">
      <div class="wrap">
        <h2 class="h2" id="reasons-t">${HOME.reasons.title}</h2>
        <ol class="reasons__list">
          ${REASONS.map(
            (r, i) => html`<li class="reason"><span class="reason__num num">${twoDigits(i)}</span><h3 class="reason__title">${r.title}</h3><p class="reason__text">${r.text}</p></li>`,
          )}
        </ol>
      </div>
    </section>
  `;
}

function offer(): SafeHtml {
  const o = HOME.offer;
  const [launch, monthly, share] = OUR_PRICES;
  return html`
    <section class="sec tone-layer offer" id="prices" aria-labelledby="offer-t">
      <div class="wrap split">
        <div>
          <h2 class="h2" id="offer-t">${o.title}</h2>
          <ul class="offer__list">
            ${OFFERINGS.map((x) => html`<li><span class="dna-mark" aria-hidden="true"><span></span></span><p><b>${x.title}.</b> ${x.text}</p></li>`)}
          </ul>
        </div>
        <div class="prices">
          <article class="price price--main">
            <div class="price__head"><h3 class="price__title">${o.launchTitle}</h3><p class="price__value num">${textNumber(PRICING.launchUah)}&nbsp;₴</p></div>
            <p class="price__text">${launch?.title}. ${launch?.text} ${o.launchNote}</p>
          </article>
          <article class="price">
            <div class="price__head"><h3 class="price__title">${o.monthlyTitle}</h3><p class="price__value num">${textNumber(PRICING.monthlyUah)}&nbsp;₴<span class="price__unit">${o.perMonth}</span></p></div>
            <p class="price__text">${monthly?.text}</p>
          </article>
          <div class="price-share">
            <p>${o.shareLabel}</p>
            <p class="price-share__value num">${STARS_COMMISSION}%</p>
          </div>
          <p class="price-share__text small muted">${share?.text}</p>
        </div>
      </div>
    </section>
  `;
}

function audience(): SafeHtml {
  return html`
    <section class="sec tone-light audience" aria-labelledby="aud-t">
      <div class="wrap">
        <h2 class="h2" id="aud-t">${HOME.audience.title}</h2>
        <ul class="aud">
          ${AUDIENCES.map(
            (a) =>
              html`<li class="aud__item${a.note ? ' aud__item--warn' : ''}"><h3 class="aud__title">${a.title}</h3><p class="aud__text">${a.situation}${a.note ? html` <b>${a.note}</b>` : ''}</p></li>`,
          )}
        </ul>
      </div>
    </section>
  `;
}

function launch(): SafeHtml {
  return html`
    <section class="sec launch" aria-labelledby="launch-t">
      <div class="wrap">
        <h2 class="h2" id="launch-t">${HOME.launch.title}</h2>
        <p class="lead">${HOME.launch.lead}</p>
        <ol class="steps">
          ${LAUNCH.map(
            (s) => html`<li class="lstep"><span class="lstep__dot" aria-hidden="true"></span><p class="eyebrow lstep__when">${s.when}</p><h3 class="lstep__title">${s.title}</h3><p class="lstep__text">${s.text}</p></li>`,
          )}
        </ol>
      </div>
    </section>
  `;
}

function catalog(): SafeHtml {
  const counts = new Map<GenreId, number>();
  for (const g of GAMES) counts.set(g.dna.genre, (counts.get(g.dna.genre) ?? 0) + 1);
  const present = GENRE_IDS.filter((id) => counts.has(id));
  return html`
    <section class="sec catalog-teaser" aria-labelledby="cat-t">
      <div class="wrap">
        <div class="catalog-teaser__head">
          <h2 class="h2" id="cat-t">${HOME.catalog.title}</h2>
          <p class="muted">${HOME.catalog.status(liveCount(), soonCount())}</p>
        </div>
        <ul class="chips catalog-teaser__genres">
          ${present.map((id) => html`<li><a class="chip" href="${href.games()}?genre=${id}">${GENRE_LABELS[id]}<span class="chip__count">${counts.get(id) ?? 0}</span></a></li>`)}
        </ul>
        <div class="actions">${button(href.games(), HOME.catalog.cta, { variant: 'ghost', arrow: true })}</div>
      </div>
    </section>
  `;
}

function faq(): SafeHtml {
  return html`
    <section class="sec tone-light faqs" id="faq" aria-labelledby="faq-t">
      <div class="wrap split">
        <h2 class="h2" id="faq-t">${HOME.faq.title}</h2>
        ${faqMarkup()}
      </div>
    </section>
  `;
}

function final(): SafeHtml {
  const f = HOME.final;
  return html`
    <section class="sec tone-coral final" aria-labelledby="final-t">
      <div class="wrap final__in">
        <div>
          <h2 class="h2 final__title" id="final-t">${f.title}</h2>
          <p class="final__text">${f.text}</p>
        </div>
        <div class="actions">${button(TELEGRAM_URL, f.cta, { external: true })}</div>
      </div>
    </section>
  `;
}

export function homeView(): View {
  return {
    key: 'home',
    navTone: 'dark',
    meta: {
      // до 60 символів
      title: `${BRAND} — ${BRAND_LINE.charAt(0).toLowerCase()}${BRAND_LINE.slice(1)}`,
      ogTitle: `${BRAND}: ${HOME.meta.ogTitle.charAt(0).toLowerCase()}${HOME.meta.ogTitle.slice(1)}`,
      description: HOME.meta.description,
      ogImage: '/og/default.png',
      path: href.home(),
    },
    markup: html`${hero()}${starPathMarkup()}${reasons()}${offer()}${audience()}${launch()}${catalog()}${faq()}${final()}`,
    mount(root, ctx) {
      const offs = [
        mountCommon(root, ctx),
        initSpiral(root.querySelector<HTMLElement>('[data-spiral="hero"]'), ctx.motion),
        initStarPath(root, ctx.motion),
      ];
      return () => offs.forEach((off) => off());
    },
  };
}
