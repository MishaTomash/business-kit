/**
 * FAQ: exclusive accordion on native <details name="…">.
 * No JS behaviour; height animates in CSS where supported.
 */

import { FAQ } from '@/data/site';
import { html, type SafeHtml } from '@/lib/dom';
import { icon } from '@/lib/icons';

export const faqMarkup = (): SafeHtml => html`
  <div class="faq" data-stagger>
    ${FAQ.map(
      (item, index) => html`
        <details class="faq__item" name="faq" ${index === 0 ? 'open' : ''}>
          <summary class="faq__q">
            <span>${item.question}</span>
            <span class="faq__toggle" aria-hidden="true">${icon('close', 16)}</span>
          </summary>
          <div class="faq__a"><p>${item.answer}</p></div>
        </details>
      `,
    )}
  </div>
`;
