/** Shown for unknown category/project ids (e.g. an outdated shared link). */

import { href } from '@/router';
import { html } from '@/lib/dom';
import type { View } from './view';

export function notFoundView(): View {
  return {
    title: 'Сторінку не знайдено | Business Kit',
    markup: html`
      <section class="page container">
        <div class="empty">
          <h1 tabindex="-1">Такої сторінки немає</h1>
          <p>Можливо, проєкт перейменували або посилання застаріло.</p>
          <a class="btn btn--primary" href="${href.home()}">На головну</a>
        </div>
      </section>
    `,
  };
}
