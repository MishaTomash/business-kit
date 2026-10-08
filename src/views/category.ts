/**
 * Category page: list of projects in one direction.
 * Empty categories turn into a "coming soon" page with a way to get notified.
 */

import type { Category } from '@/types';
import { projectsIn } from '@/data';
import { TELEGRAM_URL } from '@/data/site';
import { href } from '@/router';
import { html } from '@/lib/dom';
import { icon } from '@/lib/icons';
import { projectCard } from '@/components/cards';
import { backLink, iconTile } from '@/components/ui';
import type { View } from './view';

export function categoryView(category: Category): View {
  const projects = projectsIn(category.id);

  return {
    title: `${category.name}: проєкти | Business Kit`,
    markup: html`
      <section class="page container">
        ${backLink(href.home(), 'Усі напрями')}

        <header class="page-head" data-reveal>
          ${iconTile(category.icon, category.accent, 'lg')}
          <div>
            <h1 class="page-head__title" tabindex="-1">${category.name}</h1>
            <p class="page-head__lead">${category.description}</p>
          </div>
        </header>

        ${projects.length > 0
          ? html`<ul class="project-list" data-stagger>${projects.map(projectCard)}</ul>`
          : html`
              <div class="empty" data-reveal>
                <span class="empty__icon">${icon('rocket', 24)}</span>
                <h2>Проєкти в цьому напрямі готуються</h2>
                <p>Напишіть нам, і ми повідомимо першим, щойно вони з'являться.</p>
                <a class="btn btn--secondary" href="${TELEGRAM_URL}" target="_blank" rel="noopener">Повідомити мене</a>
              </div>
            `}
      </section>
    `,
  };
}
