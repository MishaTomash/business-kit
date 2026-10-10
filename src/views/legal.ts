/**
 * Юридичні сторінки /offer і /privacy за макетом «ДНК» (page-53…72): світла сторінка, надпис «Документи»,
 * заголовок, рамка з датою редакції; на десктопі ліворуч зміст розділів, активний розділ підсвічується.
 * Текст — лише content/legal/*.md (src/data/legal.ts). Без JS зміст працює як звичайні якорі.
 */

import type { View } from './view';
import { BRAND } from '@/data/site';
import { getLegal, type LegalId } from '@/data/legal';
import { LEGAL_PAGE } from '@/data/pages';
import { html, raw } from '@/lib/dom';
import { href } from '@/router';
import { mountCommon } from './common';

/** Підсвічування поточного розділу в змісті (IntersectionObserver, без обробників скролу). */
export function mountToc(root: HTMLElement): () => void {
  const links = [...root.querySelectorAll<HTMLAnchorElement>('.ltoc a')];
  if (!links.length || typeof IntersectionObserver === 'undefined') return () => undefined;
  const heads = links.map((a) => root.querySelector<HTMLElement>(a.hash)).filter((h): h is HTMLElement => h !== null);
  const visible = new Set<string>();
  const mark = (): void => {
    const id = heads.find((h) => visible.has(h.id))?.id ?? '';
    links.forEach((a) => (a.hash === `#${id}` ? a.setAttribute('aria-current', 'location') : a.removeAttribute('aria-current')));
  };
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const id = (e.target as HTMLElement).id;
        if (e.isIntersecting) visible.add(id);
        else visible.delete(id);
      }
      mark();
    },
    { rootMargin: '-15% 0px -70% 0px' },
  );
  heads.forEach((h) => io.observe(h));
  return () => io.disconnect();
}

export function legalView(id: LegalId): View {
  const doc = getLegal(id);
  return {
    key: `legal:${id}`,
    navTone: 'dark',
    meta: {
      title: `${doc.title} — ${BRAND}`,
      ogTitle: doc.title,
      description: doc.description,
      ogImage: '/og/default.png',
      path: href.legal(id),
      ...(doc.editionIso ? { lastmod: doc.editionIso } : {}),
    },
    markup: html`
      <section class="sec tone-light legal" aria-labelledby="legal-t">
        <div class="wrap legal__in">
          <header class="legal__head">
            <p class="legal__eyebrow muted">${LEGAL_PAGE.eyebrow}</p>
            <h1 class="h1 legal__title" id="legal-t">${doc.title}</h1>
            ${doc.edition ? html`<p class="legal__date">${doc.editionIso ? html`<time datetime="${doc.editionIso}">${doc.edition}</time>` : doc.edition}</p>` : ''}
          </header>
          ${doc.sections.length
            ? html`<nav class="ltoc" aria-label="${LEGAL_PAGE.toc}"><ol>${doc.sections.map((s) => html`<li><a href="#${s.id}">${s.text}</a></li>`)}</ol></nav>`
            : ''}
          <div class="legal__body">${raw(doc.body)}</div>
        </div>
      </section>
    `,
    mount(root, ctx) {
      const offs = [mountCommon(root, ctx), mountToc(root)];
      return () => offs.forEach((off) => off());
    },
  };
}
