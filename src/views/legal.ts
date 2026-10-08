/** Юридичні сторінки /offer і /privacy. Текст — content/legal/*.md, перетворений під час збірки. */

import type { View } from './view';
import { BRAND } from '@/data/site';
import { getLegal, type LegalId } from '@/data/legal';
import { html, raw } from '@/lib/dom';
import { href } from '@/router';
import { tlink } from '@/components/ui';
import { mountCommon } from './common';

export function legalView(id: LegalId): View {
  const doc = getLegal(id);
  return {
    key: `legal:${id}`,
    meta: {
      title: `${doc.title} — ${BRAND}`,
      ogTitle: doc.title,
      description: doc.description,
      ogImage: '/og/default.png',
      path: href.legal(id),
    },
    markup: html`
      <section class="sec sec--white legal" aria-labelledby="legal-t">
        <div class="wrap legal__in">
          <p class="legal__back">${tlink(href.home(), 'На головну')}</p>
          <h1 class="legal__title" id="legal-t">${doc.title}</h1>
          ${doc.edition ? html`<p class="legal__date">${doc.editionIso ? html`<time datetime="${doc.editionIso}">${doc.edition}</time>` : doc.edition}</p>` : ''}
          <div class="legal__body">${raw(doc.body)}</div>
        </div>
      </section>
    `,
    mount: (root, ctx) => mountCommon(root, ctx),
  };
}
