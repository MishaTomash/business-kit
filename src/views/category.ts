/**
 * Сторінка напряму: проєкти великими картками з мініатюрою.
 * Порожній напрям показує стан «Скоро» з кнопкою «Повідомити мене».
 */

import type { Category } from '@/types';
import { CATEGORIES, availableCount, projectsIn } from '@/data';
import { TELEGRAM_URL } from '@/data/site';
import { href } from '@/router';
import { html } from '@/lib/dom';
import { icon } from '@/lib/icons';
import { pluralBots } from '@/lib/format';
import { projectCard } from '@/components/cards';
import { backLink, iconTile } from '@/components/ui';
import type { View } from './view';

export function categoryView(category: Category): View {
  const projects = projectsIn(category.id);
  const live = availableCount(category.id);
  const others = CATEGORIES.filter((c) => c.id !== category.id && availableCount(c.id) > 0);

  return {
    title: `${category.name}: готові боти | Business Kit`,
    markup: html`
      <section class="page container">
        ${backLink(href.home(), 'Усі боти')}
        <header class="page-head" data-reveal style="--accent: ${category.accent}">
          ${iconTile(category.icon, category.accent, 'lg')}
          <div>
            <h1 class="page-head__title" tabindex="-1">${category.name}</h1>
            <p class="page-head__lead">${category.description}</p>
            ${live > 0 && html`<p class="page-head__count">${live} ${pluralBots(live)} можна купити зараз</p>`}
          </div>
        </header>

        ${live > 0
          ? html`<ul class="pcards" data-stagger>${projects.map(projectCard)}</ul>`
          : html`<div class="empty" data-reveal style="--accent: ${category.accent}">
              <span class="empty__badge">Скоро</span>
              <h2 class="empty__title">Боти для напряму «${category.name}» ще готуються</h2>
              <p>Напишіть нам, і ми повідомимо першими, щойно вони з'являться. А поки можна подивитися ботів, які вже працюють.</p>
              <div class="empty__actions">
                <a class="btn btn--main btn--lg" href="${TELEGRAM_URL}" target="_blank" rel="noopener">${icon('send', 18)} Повідомити мене</a>
                <a class="btn btn--line btn--lg" href="${href.home()}" data-scroll="bots">Живі боти</a>
              </div>
            </div>`}

        ${others.length > 0 &&
        html`<nav class="other-dirs" aria-label="Інші напрями">
          <h2 class="other-dirs__title">Інші напрями</h2>
          <ul>
            ${others.map(
              (c) => html`<li><a href="${href.category(c.id)}">${iconTile(c.icon, c.accent)}<span>${c.name}</span>${icon('arrowRight', 18)}</a></li>`,
            )}
          </ul>
        </nav>`}
      </section>
    `,
  };
}
