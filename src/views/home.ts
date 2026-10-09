/**
 * Головна — про бізнес, не про конкретні ігри: що це, як заробляє власник гри,
 * як заробляємо ми, чому це вигідно, що ми надаємо. Ігри — лише запрошення в каталог.
 */

import type { View } from './view';
import { BRAND, BRAND_LINE, DEPLOY_TIME, PRICING, STARS_COMMISSION, TELEGRAM_URL } from '@/data/site';
import { AUDIENCES, LAUNCH, OUR_PRICES, REASONS, textNumber } from '@/data/business';
import { liveCount, soonCount } from '@/data';
import { html, type SafeHtml } from '@/lib/dom';
import { tiles, wordTiles } from '@/lib/tiles';
import { pluralGames } from '@/lib/format';
import { href } from '@/router';
import { key, tlink } from '@/components/ui';
import { starPathMarkup } from '@/components/starPath';
import { marqueeMarkup } from '@/components/marquee';
import { customizerMarkup, mountCustomizer } from '@/components/customizer';
import { offeringsStrip } from '@/components/offerings';
import { faqMarkup } from '@/components/faq';
import { mountCommon } from './common';
import { initStarPath } from '@/lib/star-path';
import { initStrip, initTimeline } from '@/lib/strip';

function hero(): SafeHtml {
  return html`
    <section class="sec sec--mint hero" aria-labelledby="hero-t">
      <div class="wrap hero__in">
        <div class="hero__text">
          <h1 class="h1" id="hero-t">Гра у вашому Telegram. Зірки — на вашому рахунку.</h1>
          <p class="lead">
            Запускаємо словесну гру під назвою вашого каналу. Гравці купують підказки за Telegram Stars, а зірки йдуть на баланс
            вашого бота.
          </p>
          <div class="actions">${key(TELEGRAM_URL, 'Обговорити гру', { external: true })}${tlink(href.games(), 'Переглянути ігри')}</div>
        </div>
      </div>
    </section>
  `;
}

function prices(): SafeHtml {
  return html`
    <section class="sec sec--white prices" id="prices" aria-labelledby="prices-t">
      <div class="wrap">
        <h2 class="h2" id="prices-t">Як заробляємо ми</h2>
        <p class="lead">Дві фіксовані суми й жодного відсотка з ваших зірок.</p>
        <div class="prices__rows">
          ${OUR_PRICES.map(
            (p, i) => html`
              <div class="price-row${i === 2 ? ' price-row--zero' : ''}">
                ${tiles(p.figure, { className: `tiles--lg${i === 2 ? ' tiles--gold' : ''}` })}
                <div class="price-row__text">
                  <h3 class="h3">${p.title}</h3>
                  <p>${p.text}</p>
                </div>
              </div>
            `,
          )}
        </div>
      </div>
    </section>
  `;
}

function reasons(): SafeHtml {
  return html`
    <section class="sec sec--mint reasons" aria-labelledby="reasons-t">
      <div class="wrap">
        <h2 class="h2" id="reasons-t">Чому це вигідно власнику каналу</h2>
        <div class="reasons__grid">
          ${REASONS.map(
            (r, i) => html`
              <article class="reason reason--${i}">
                ${tiles(r.figure, { className: i === 0 ? 'tiles--lg tiles--gold' : 'tiles--md' })}
                <h3 class="h3">${r.title}</h3>
                <p>${r.text}</p>
              </article>
            `,
          )}
        </div>
      </div>
      ${marqueeMarkup()}
    </section>
  `;
}

function offer(): SafeHtml {
  return html`
    <section class="sec sec--forest offer" aria-labelledby="offer-t">
      <div class="wrap offer__head">
        <h2 class="h2" id="offer-t">Що ми надаємо</h2>
        <p class="lead">Усе, щоб гра працювала під вашою назвою. Спробуйте змінити назву, кольори й знак.</p>
      </div>
      <div class="wrap">${customizerMarkup()}</div>
      ${offeringsStrip()}
    </section>
  `;
}

function audience(): SafeHtml {
  return html`
    <section class="sec sec--white audience" aria-labelledby="aud-t">
      <div class="wrap">
        <h2 class="h2" id="aud-t">Для кого</h2>
        <ul class="aud">
          ${AUDIENCES.map((a) => html`<li class="aud__item"><h3 class="aud__title">${a.title}</h3><p class="aud__text">${a.situation}</p></li>`)}
        </ul>
      </div>
    </section>
  `;
}

function launch(): SafeHtml {
  return html`
    <section class="sec sec--mint launch" aria-labelledby="launch-t">
      <div class="wrap launch__in">
        <div class="launch__head">
          <h2 class="h2" id="launch-t">Як проходить запуск</h2>
          <p class="lead">Від першого повідомлення до гри у вашому каналі — ${DEPLOY_TIME}.</p>
        </div>
        <div class="timeline" data-timeline>
          <span class="timeline__line" aria-hidden="true"><span class="timeline__fill" data-timeline-fill></span></span>
          <ol class="timeline__steps">
          ${LAUNCH.map(
            (s, i) => html`
              <li class="step">
                <span class="step__tile" aria-hidden="true">${i + 1}</span>
                <p class="step__when">${s.when}</p>
                <h3 class="h3">${s.title}</h3>
                <p class="step__text">${s.text}</p>
              </li>
            `,
          )}
          </ol>
        </div>
      </div>
    </section>
  `;
}

/** «працює» за числом: 1 гра працює, 2 гри працюють, 5 ігор працюють. */
const works = (n: number): string => (pluralGames(n) === 'гра' ? 'працює' : 'працюють');

function invite(): SafeHtml {
  const live = liveCount();
  const soon = soonCount();
  // Велика цифра показує лише ігри, в які можна грати. Заглушки в ній не рахуються.
  const head = live > 0 ? `${pluralGames(live)} вже ${works(live)}` : html`Ігри в розробці`;
  return html`
    <section class="sec sec--forest invite" aria-labelledby="inv-t">
      <div class="wrap invite__in">
        ${live > 0 ? tiles(String(live), { className: 'tiles--xl tiles--gold', label: String(live) }) : ''}
        <div class="invite__text">
          <h2 class="h2" id="inv-t">${head}</h2>
          ${live > 0 && soon > 0 ? html`<p class="invite__more">ще ${soon} у розробці</p>` : ''}
          <p class="lead">Кожна гра запускається під назвою й кольорами вашого каналу. У каталозі видно, яка вже працює, а яка ще в розробці.</p>
          <div class="actions">${key(href.games(), 'Переглянути ігри', { tone: 'gold' })}</div>
        </div>
      </div>
    </section>
  `;
}

function faq(): SafeHtml {
  return html`
    <section class="sec sec--white faqs" id="faq" aria-labelledby="faq-t">
      <div class="wrap faqs__in">
        <h2 class="h2" id="faq-t">Питання</h2>
        ${faqMarkup()}
      </div>
    </section>
  `;
}

function final(): SafeHtml {
  return html`
    <section class="sec sec--gold final" aria-labelledby="final-t">
      <div class="wrap final__in">
        <div class="final__tiles">${wordTiles('ВАШ', 'tiles--final')}${wordTiles('КАНАЛ', 'tiles--final')}</div>
        <h2 class="h1" id="final-t">Обговоримо гру для вашого каналу</h2>
        <div class="actions">${key(TELEGRAM_URL, 'Написати в Telegram', { external: true })}</div>
      </div>
    </section>
  `;
}

export function homeView(): View {
  return {
    key: 'home',
    meta: {
      title: `${BRAND} — ${BRAND_LINE.charAt(0).toLowerCase()}${BRAND_LINE.slice(1)}`,
      ogTitle: `${BRAND}: гра у вашому Telegram, зірки на вашому рахунку`,
      description: `Словесна гра під назвою вашого каналу: гравці купують підказки за Telegram Stars, зірки йдуть на баланс вашого бота. Запуск ${textNumber(PRICING.launchUah)}\u00A0₴, підтримка ${textNumber(PRICING.monthlyUah)}\u00A0₴ на місяць, ${STARS_COMMISSION}% зі зірок.`,
      ogImage: '/og/default.png',
      path: href.home(),
    },
    markup: html`${hero()}${starPathMarkup()}${prices()}${reasons()}${offer()}${audience()}${launch()}${invite()}${faq()}${final()}`,
    mount(root, ctx) {
      const offs = [mountCommon(root, ctx), initStarPath(root, ctx.motion), initStrip(root, ctx.motion), initTimeline(root, ctx.motion)];
      mountCustomizer(root);
      return () => offs.forEach((off) => off());
    },
  };
}
