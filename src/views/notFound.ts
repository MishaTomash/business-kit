/** 404 у стилі сайту. */

import type { View } from './view';
import { BRAND } from '@/data/site';
import { html } from '@/lib/dom';
import { tiles } from '@/lib/tiles';
import { href } from '@/router';
import { key, tlink } from '@/components/ui';
import { mountCommon } from './common';

export function notFoundView(path = '/404'): View {
  return {
    key: 'notFound',
    meta: {
      title: `Сторінку не знайдено — ${BRAND}`,
      description: 'Такої сторінки немає. Усі ігри зібрані в каталозі.',
      ogImage: '/og/default.png',
      path,
      noindex: true,
    },
    markup: html`
      <section class="sec sec--mint nf" aria-labelledby="nf-t">
        <div class="wrap nf__in">
          <div>${tiles('404', { className: 'tiles--xl tiles--nf', decorative: true })}</div>
          <h1 class="h1" id="nf-t">Такої сторінки немає</h1>
          <p class="lead">Можливо, адреса змінилась або гру прибрали з каталогу. Усі ігри зібрані в одному місці.</p>
          <div class="actions">${key(href.games(), 'До ігор')}${tlink(href.home(), 'На головну')}</div>
        </div>
      </section>
    `,
    mount: (root, ctx) => mountCommon(root, ctx),
  };
}
