/** 404 за макетом «ДНК» (page-49…52): «зламана» спіраль, заголовок, дві дії. Тексти — src/data/pages.ts. */

import type { View } from './view';
import { BRAND } from '@/data/site';
import { NOT_FOUND } from '@/data/pages';
import { html } from '@/lib/dom';
import { href } from '@/router';
import { button } from '@/components/ui';
import { spiralMarkup } from '@/components/spiral';
import { mountCommon } from './common';

export function notFoundView(path = '/404'): View {
  return {
    key: 'notFound',
    navTone: 'dark',
    meta: {
      title: `${NOT_FOUND.title} — ${BRAND}`,
      description: NOT_FOUND.meta.description,
      ogImage: '/og/default.png',
      path,
      noindex: true,
    },
    markup: html`
      <section class="sec nf" aria-labelledby="nf-t">
        <div class="wrap">
          <div class="nf__spiral">${spiralMarkup({ rungs: 22, name: 'nf', className: 'spiral--nf spiral--h' })}</div>
          <p class="eyebrow nf__eyebrow">${NOT_FOUND.eyebrow}</p>
          <h1 class="h1 nf__title" id="nf-t">${NOT_FOUND.title}</h1>
          <p class="lead">${NOT_FOUND.lead}</p>
          <div class="actions">${button(href.home(), NOT_FOUND.home)}${button(href.games(), NOT_FOUND.catalog, { variant: 'ghost' })}</div>
        </div>
      </section>
    `,
    mount: (root, ctx) => mountCommon(root, ctx),
  };
}
