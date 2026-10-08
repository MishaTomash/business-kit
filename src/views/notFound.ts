/** Невідомий напрям чи проєкт (наприклад, застаріле посилання). */

import { href } from '@/router';
import { html } from '@/lib/dom';
import type { View } from './view';

export function notFoundView(): View {
  return {
    title: 'Сторінку не знайдено | Business Kit',
    markup: html`
      <section class="page container">
        <div class="empty empty--404">
          <span class="empty__code" aria-hidden="true">404</span>
          <h1 class="empty__title" tabindex="-1">Такої сторінки немає</h1>
          <p>Можливо, проєкт перейменували або посилання застаріло. Усі боти, які працюють зараз, є на головній.</p>
          <div class="empty__actions">
            <a class="btn btn--main btn--lg" href="${href.home()}" data-scroll="bots">Подивитися ботів</a>
            <a class="btn btn--line btn--lg" href="${href.home()}">На головну</a>
          </div>
        </div>
      </section>
    `,
  };
}
