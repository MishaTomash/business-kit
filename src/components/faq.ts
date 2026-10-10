/** FAQ на нативних <details name="faq">: працює без JS. Питання без відповіді не показуються. */

import { FAQ } from '@/data/business';
import { html, raw, type SafeHtml } from '@/lib/dom';

export const faqMarkup = (): SafeHtml => html`
  <div class="faq">
    ${FAQ.filter((item) => item.answer !== null).map(
      (item, index) => html`
        <details class="faq__item" name="faq" ${index === 0 ? raw('open') : ''}>
          <summary class="faq__q"><span>${item.question}</span><span class="faq__toggle" aria-hidden="true"></span></summary>
          <div class="faq__a"><p>${item.answer}${item.link ? html` <a class="link" href="${item.link.href}">${item.link.label}</a>` : ''}</p></div>
        </details>
      `,
    )}
  </div>
`;
