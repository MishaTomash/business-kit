/**
 * Довідкова стаття /guides/<id>. Макета для статей немає, тому сторінка повторює юридичні (src/views/legal.ts):
 * світле тло, надпис «Довідка», заголовок, дата оновлення, на десктопі зміст розділів. Наприкінці — заклик
 * із фактами з даних сайту. Текст — content/guides/*.md через src/data/guides.ts.
 */

import type { View } from './view';
import type { Guide } from '@/data/guides';
import { TELEGRAM_URL } from '@/data/site';
import { GUIDE_PAGE } from '@/data/pages';
import { html, raw } from '@/lib/dom';
import { href } from '@/router';
import { button } from '@/components/ui';
import { article, breadcrumbs, organization } from '@/lib/schema';
import { mountCommon } from './common';
import { mountToc } from './legal';

/** «2026-10-10» → «10 жовтня 2026 р.» (UTC, щоб дата не зсувалась від часового поясу машини збірки). */
const humanDate = (iso: string): string =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

export function guideView(g: Guide): View {
  const path = href.guide(g.id);
  const c = GUIDE_PAGE.cta;
  return {
    key: `guide:${g.id}`,
    navTone: 'dark',
    meta: {
      title: g.title,
      ogTitle: g.title,
      description: g.description,
      ogImage: '/og/default.png',
      path,
      lastmod: g.updated,
      jsonLd: [
        organization(),
        breadcrumbs([
          ['Головна', href.home()],
          [g.linkLabel, path],
        ]),
        article({ headline: g.h1, description: g.description, path, published: g.published, modified: g.updated }),
      ],
    },
    markup: html`
      <section class="sec tone-light legal guide" aria-labelledby="guide-t">
        <div class="wrap legal__in">
          <header class="legal__head">
            <p class="legal__eyebrow muted">${GUIDE_PAGE.eyebrow}</p>
            <h1 class="h1 legal__title" id="guide-t">${g.h1}</h1>
            <p class="legal__date">${GUIDE_PAGE.updated} <time datetime="${g.updated}">${humanDate(g.updated)}</time></p>
          </header>
          ${g.sections.length
            ? html`<nav class="ltoc" aria-label="${GUIDE_PAGE.toc}"><ol>${g.sections.map((s) => html`<li><a href="#${s.id}">${s.text}</a></li>`)}</ol></nav>`
            : ''}
          <div class="legal__body">${raw(g.body)}</div>
          <aside class="guide__cta" aria-labelledby="guide-cta-t">
            <h2 class="guide__cta-title" id="guide-cta-t">${c.title}</h2>
            <p>${c.text}</p>
            <div class="actions">${button(href.games(), c.catalog)}${button(TELEGRAM_URL, c.write, { variant: 'ghost', external: true })}</div>
          </aside>
        </div>
      </section>
    `,
    mount(root, ctx) {
      const offs = [mountCommon(root, ctx), mountToc(root)];
      return () => offs.forEach((off) => off());
    },
  };
}
