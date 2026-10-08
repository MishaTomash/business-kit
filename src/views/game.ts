/**
 * Сторінка гри /games/<id> у колірному світі гри.
 * available: «Пограти», демо, механіки, ціни для гравців, калькулятор, що входить, план, покупка.
 * soon або mock: опис, механіки, «У розробці», «Повідомити про запуск». Без покупки й калькулятора.
 */

import type { View } from './view';
import type { Game } from '@/types';
import { BRAND, DEPLOY_TIME, STARS_COMMISSION, TELEGRAM_URL } from '@/data/site';
import { textNumber, tileNumber } from '@/data/business';
import { isPlayable } from '@/data';
import { html, raw, type SafeHtml } from '@/lib/dom';
import { STAR_ICON, starText, tiles } from '@/lib/tiles';
import { luminance } from '@/lib/theme';
import { formatDaysRange, formatMinutesRange } from '@/lib/format';
import { href } from '@/router';
import { cover, key, themeVars, tlink } from '@/components/ui';
import { calculatorMarkup, mountCalculator } from '@/components/calculator';
import { demoMarkup, mountDemo } from '@/components/demoGame';
import { mountCommon } from './common';

const dark = (g: Game): boolean => luminance(g.theme.bg) < 0.2;

function heroBlock(g: Game, live: boolean): SafeHtml {
  const tone = dark(g) ? 'gold' : 'forest';
  return html`
    <section class="sec game-hero${dark(g) ? ' is-dark' : ''}" style="${themeVars(g)}" aria-labelledby="game-t">
      <div class="wrap game-hero__in">
        <p class="game-hero__back">${tlink(href.games(), 'До всіх ігор')}</p>
        ${cover(g, { hero: true, morph: true })}
        <div class="game-hero__text">
          <p class="game-hero__genre">${g.genre}</p>
          <h1 class="h1 kinetic" id="game-t" data-kinetic="now">${g.name}</h1>
          <p class="lead">${g.tagline}</p>
          ${live
            ? html`<div class="actions">${g.botUrl ? key(g.botUrl, 'Пограти', { external: true, tone }) : ''}${tlink(TELEGRAM_URL, 'Хочу таку гру', true)}</div>`
            : html`<p class="game-hero__soon">У розробці</p><div class="actions">${key(TELEGRAM_URL, 'Повідомити про запуск', { external: true, tone })}</div>`}
        </div>
      </div>
    </section>
  `;
}

function mechanicsList(g: Game): SafeHtml {
  return html`<ul class="mech">${g.mechanics.map((m) => html`<li><span class="mech__tile" aria-hidden="true">${STAR_ICON}</span><span>${m}</span></li>`)}</ul>`;
}

function earnBlock(g: Game): SafeHtml {
  return html`
    <section class="sec sec--white g-earn" aria-labelledby="g-earn-t">
      <div class="wrap g-earn__in">
        <div class="g-earn__text">
          <h2 class="h2 kinetic" id="g-earn-t">Як гра заробляє</h2>
          <p class="lead">${g.howItEarns}</p>
          <h3 class="h3 g-sub">Ціни для гравців</h3>
          <dl class="pricelist">
            ${g.customerPrices.map((p) => html`<div><dt>${p.label}</dt><dd>${starText(p.price)}</dd></div>`)}
          </dl>
        </div>
        ${g.demo?.length
          ? html`<div class="g-earn__demo"><h3 class="h3 g-sub">Спробуйте прямо тут</h3>${demoMarkup(g.demo)}</div>`
          : g.screenshots?.length
            ? html`<div class="g-earn__demo gallery">${g.screenshots.map((s) => html`<img src="${s.src}" alt="${s.alt}" width="590" height="1280" loading="lazy" decoding="async" />`)}</div>`
            : raw('')}
      </div>
    </section>
  `;
}

function mechanicsBlock(g: Game): SafeHtml {
  return html`
    <section class="sec sec--mint g-mech" aria-labelledby="g-mech-t">
      <div class="wrap g-mech__in">
        <h2 class="h2 kinetic" id="g-mech-t">Механіки</h2>
        ${mechanicsList(g)}
      </div>
    </section>
  `;
}

function calcBlock(g: Game): SafeHtml {
  return html`
    <section class="sec sec--white g-calc" id="calc" aria-labelledby="g-calc-t">
      <div class="wrap">
        <h2 class="h2 kinetic" id="g-calc-t">Скільки може приносити гра</h2>
        <p class="lead">Орієнтир за планом: перший платник через ${formatDaysRange(g.firstClientDays)}, ${formatMinutesRange(g.dailyMinutes)} на день на просування.</p>
        ${calculatorMarkup(g)}
      </div>
    </section>
  `;
}

function planBlock(g: Game): SafeHtml {
  return html`
    <section class="sec sec--mint g-plan" aria-labelledby="g-plan-t">
      <div class="wrap g-plan__in">
        <div>
          <h2 class="h2 kinetic" id="g-plan-t">Що входить</h2>
          <ul class="includes">${g.includes.map((i) => html`<li>${i}</li>`)}</ul>
        </div>
        <div>
          <h3 class="h3 g-sub">План просування</h3>
          <ol class="phases">
            ${g.plan.map(
              (p) => html`<li class="phase"><p class="phase__when">${p.period}</p><h4 class="phase__title">${p.title}</h4><ul>${p.tasks.map((t) => html`<li>${t}</li>`)}</ul></li>`,
            )}
          </ol>
          <h3 class="h3 g-sub">Де шукати гравців</h3>
          <ul class="channels">
            ${g.channels.map((c) => html`<li><p class="channels__title">${c.title} <span class="channels__cost">${c.cost === 'free' ? 'безкоштовно' : 'платно'}</span></p><p>${c.description}</p></li>`)}
          </ul>
        </div>
      </div>
    </section>
  `;
}

function buyBlock(g: Game): SafeHtml {
  return html`
    <section class="sec sec--forest g-buy" aria-labelledby="g-buy-t">
      <div class="wrap g-buy__in">
        <h2 class="h2 kinetic" id="g-buy-t">Запуск гри «${g.name}» для вашого каналу</h2>
        <ul class="buy">
          <li class="buy__row">${tiles(`${tileNumber(g.priceUah)}₴`, { odometer: true, className: 'tiles--md' })}<p>один раз за запуск</p></li>
          <li class="buy__row">${tiles(`${tileNumber(g.monthlyUah)}₴`, { odometer: true, className: 'tiles--md' })}<p>щомісяця: сервер, домен, оновлення й підтримка</p></li>
          <li class="buy__row">${tiles(`${STARS_COMMISSION}%`, { odometer: true, className: 'tiles--md tiles--gold' })}<p>наша частка зі зірок: усі зірки йдуть на баланс вашого бота</p></li>
        </ul>
        <p class="lead">Гра запрацює ${DEPLOY_TIME} після оплати.</p>
        <div class="actions">${key(TELEGRAM_URL, 'Хочу таку гру', { external: true, tone: 'gold' })}</div>
      </div>
    </section>
  `;
}

function soonBlock(g: Game): SafeHtml {
  return html`
    <section class="sec sec--white g-soon" aria-labelledby="g-soon-t">
      <div class="wrap g-soon__in">
        <div>
          <h2 class="h2 kinetic" id="g-soon-t">Як гра працюватиме</h2>
          <p class="lead">${g.howItEarns}</p>
          <p class="g-soon__note">Ціни для гравців, калькулятор і запуск з'являться, коли гра буде готова. Натисніть «Повідомити про запуск», і ми напишемо вам першими.</p>
          <div class="actions">${tlink(href.games(), 'Подивитися інші ігри')}</div>
        </div>
        <div>
          <h3 class="h3 g-sub">Механіки</h3>
          ${mechanicsList(g)}
        </div>
      </div>
    </section>
  `;
}

export function gameView(g: Game): View {
  const live = isPlayable(g);
  return {
    key: `game:${g.id}`,
    navTone: dark(g) ? 'dark' : 'light',
    meta: {
      title: live ? `${g.name}: ${g.genre.toLowerCase()} у Telegram для вашого каналу — ${BRAND}` : `${g.name} (у розробці) — ${BRAND}`,
      ogTitle: live ? `${g.name} — гра для вашого Telegram-каналу` : `${g.name} — скоро в каталозі ${BRAND}`,
      description: live
        ? `${g.tagline} Запуск під назвою вашого каналу за ${textNumber(g.priceUah)}\u00A0₴, підтримка ${textNumber(g.monthlyUah)}\u00A0₴ на місяць, зірки повністю ваші.`
        : `${g.tagline} Гра в розробці: залиште заявку, і ми повідомимо про запуск.`,
      ogImage: g.ogImage ?? `/og/${g.id}.png`,
      path: href.game(g.id),
    },
    markup: live
      ? html`${heroBlock(g, true)}${earnBlock(g)}${mechanicsBlock(g)}${calcBlock(g)}${planBlock(g)}${buyBlock(g)}`
      : html`${heroBlock(g, false)}${soonBlock(g)}`,
    mount(root, ctx) {
      const off = mountCommon(root, ctx);
      if (live) {
        mountDemo(root);
        const offCalc = mountCalculator(root, g);
        return () => {
          off();
          offCalc();
        };
      }
      return off;
    },
  };
}
