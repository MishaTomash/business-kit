/**
 * Home: promise → directions (categories) → what you get → how it works → FAQ.
 * No calculator here on purpose: money is shown per project, where the
 * numbers are specific and believable.
 */

import { CATEGORIES } from '@/data';
import { OFFERINGS, TELEGRAM_URL, WORKFLOW } from '@/data/site';
import { html, qs } from '@/lib/dom';
import { icon } from '@/lib/icons';
import { initSpotlight } from '@/lib/spotlight';
import { categoryCard } from '@/components/cards';
import { faqMarkup } from '@/components/faq';
import { heroScene, offerVisuals } from '@/components/visuals';
import { sectionHead } from '@/components/ui';
import type { View } from './view';

export function homeView(): View {
  return {
    title: 'Business Kit: готовий бізнес у Telegram з планом заробітку',
    markup: html`
      <!-- ============ HERO ============ -->
      <section class="hero" aria-labelledby="hero-title">
        <div class="hero__bg" aria-hidden="true"></div>
        <div class="container hero__inner">
          <p class="pill" data-reveal><span class="pulse-dot" aria-hidden="true"></span>Бот, план заробітку й підтримка</p>
          <h1 id="hero-title" class="hero__title" data-reveal data-reveal-delay="1" tabindex="-1">
            Готовий бізнес у&nbsp;Telegram і план, як на ньому заробити
          </h1>
          <p class="hero__lead" data-reveal data-reveal-delay="2">
            Ми запускаємо бота під ваш бренд і даємо покрокову інструкцію. Без коду й досвіду: вам потрібно лише працювати за
            планом трохи щодня.
          </p>
          <div class="hero__actions" data-reveal data-reveal-delay="3">
            <a class="btn btn--primary btn--lg" href="#/" data-scroll="categories" data-magnetic="0.3">Обрати напрям</a>
            <a class="btn btn--ghost btn--lg" href="#/" data-scroll="how" data-magnetic="0.2">Як це працює</a>
          </div>
          ${heroScene()}
        </div>
      </section>

      <!-- ============ CATEGORIES ============ -->
      <section class="section" id="categories" aria-labelledby="categories-title">
        <div class="container">
          ${sectionHead(
            'Оберіть напрям',
            'У кожному напрямі є готові проєкти. Відкрийте, щоб побачити, скільки можна заробити і з чого почати.',
            'categories-title',
          )}
          <ul class="cat-grid spotlight-group" data-stagger>
            ${CATEGORIES.map(categoryCard)}
          </ul>
        </div>
      </section>

      <!-- ============ WHAT YOU GET ============ -->
      <section class="section section--tint" id="offer" aria-labelledby="offer-title">
        <div class="container">
          ${sectionHead('З кожним проєктом ви отримуєте', 'Не просто бота, а все, щоб почати заробляти без досвіду.', 'offer-title')}
          <ul class="offer-grid" data-stagger>
            ${OFFERINGS.map(
              (o, i) => html`
                <li class="offer ${i === 1 ? 'offer--key' : ''}">
                  ${offerVisuals[i]}
                  <h3>${o.title}</h3>
                  <p>${o.description}</p>
                </li>
              `,
            )}
          </ul>
        </div>
      </section>

      <!-- ============ HOW IT WORKS ============ -->
      <section class="section" id="how" aria-labelledby="how-title">
        <div class="container">
          ${sectionHead('Як це працює', 'Три кроки. Технічну частину повністю беремо на себе.', 'how-title')}
          <ol class="steps" data-stagger>
            ${WORKFLOW.map(
              (step, i) => html`
                <li class="step">
                  <span class="step__num" aria-hidden="true">${i + 1}</span>
                  <h3 class="step__title">${step.title}</h3>
                  <p class="step__text">${step.description}</p>
                </li>
              `,
            )}
          </ol>
        </div>
      </section>

      <!-- ============ FAQ ============ -->
      <section class="section" id="faq" aria-labelledby="faq-title">
        <div class="container container--narrow">
          ${sectionHead('Питання перед стартом', undefined, 'faq-title')}
          ${faqMarkup()}
        </div>
      </section>

      <!-- ============ FINAL CTA ============ -->
      <section class="section">
        <div class="container">
          <div class="final-cta" data-reveal>
            <h2>Не знаєте, з чого почати?</h2>
            <p>Напишіть нам. Розкажіть, скільки часу маєте, і ми допоможемо обрати проєкт саме під вас.</p>
            <a class="btn btn--primary btn--lg" href="${TELEGRAM_URL}" target="_blank" rel="noopener" data-magnetic="0.3">
              ${icon('send', 18)} Написати в Telegram
            </a>
          </div>
        </div>
      </section>
    `,
    mount: (root) => initSpotlight(qs('.cat-grid', root)),
  };
}
