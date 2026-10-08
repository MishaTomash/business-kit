/**
 * Original illustration set (inline SVG, 320×180, ~1 KB each).
 *
 * Why SVG instead of photos: zero network requests, crisp on any screen,
 * tinted by each category's `--accent`, and no licensing questions.
 * Colors come from CSS custom properties via `style`, so one drawing
 * adapts to any accent.
 *
 * To use a real image instead, set `image: '/images/….webp'` on the
 * category/project (files go in /public/images).
 */

import { raw, type SafeHtml } from './dom';

export type ArtName = 'media' | 'ai' | 'voice' | 'crossword' | 'education' | 'shop' | 'games';

/* Shared paint tokens (kept short: they repeat in every drawing) */
const A = 'style="fill:var(--accent)"';
const CARD = 'fill="#141414" stroke="rgba(255,255,255,.1)"';
const LINE = 'fill="rgba(255,255,255,.14)"';
const TEXT = 'fill="rgba(255,255,255,.75)"';
const OK = '#3dff8f';

/** Unique gradient ids: several drawings live on one page. */
let uid = 0;

function frame(inner: string, id: number): string {
  return `<svg class="art" viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <defs>
      <radialGradient id="glow${id}" cx="50%" cy="45%" r="55%">
        <stop offset="0" style="stop-color:var(--accent)" stop-opacity=".28"/>
        <stop offset="1" style="stop-color:var(--accent)" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="fade${id}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" style="stop-color:var(--accent)" stop-opacity=".9"/>
        <stop offset="1" style="stop-color:var(--accent)" stop-opacity=".35"/>
      </linearGradient>
    </defs>
    <rect width="320" height="180" fill="url(#glow${id})"/>
    ${inner}
  </svg>`;
}

const DRAWINGS: Record<ArtName, (id: number) => string> = {
  /* A vertical video flows into a downloaded file */
  media: () => `
    <rect x="58" y="20" width="86" height="140" rx="14" ${CARD}/>
    <rect x="66" y="28" width="70" height="98" rx="8" ${A} opacity=".18"/>
    <path d="M93 64l22 13-22 13z" fill="#fff" opacity=".92"/>
    <rect x="66" y="136" width="70" height="4" rx="2" ${LINE}/>
    <rect x="66" y="136" width="42" height="4" rx="2" ${A}/>
    <rect x="66" y="146" width="34" height="4" rx="2" ${LINE}/>
    <path d="M152 90h44" stroke="rgba(255,255,255,.3)" stroke-width="2" stroke-dasharray="4 5" stroke-linecap="round"/>
    <path d="M192 84l7 6-7 6" stroke="rgba(255,255,255,.5)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="208" y="60" width="78" height="60" rx="12" ${CARD}/>
    <rect x="218" y="72" width="24" height="30" rx="6" ${A}/>
    <path d="M230 79v12m-5-5l5 5 5-5" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="249" y="77" width="28" height="5" rx="2.5" ${TEXT}/>
    <rect x="249" y="88" width="20" height="4" rx="2" ${LINE}/>
    <circle cx="284" cy="62" r="10" fill="${OK}"/>
    <path d="M279.5 62l3 3 6-6" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,

  /* Old faded photo → restored vivid photo, with a spark in between */
  ai: (id) => `
    <rect x="40" y="30" width="100" height="120" rx="12" ${CARD}/>
    <rect x="48" y="38" width="84" height="84" rx="7" fill="#2b2620"/>
    <circle cx="110" cy="58" r="9" fill="#5a5246"/>
    <path d="M48 112l26-28 18 18 12-12 28 30v2H48z" fill="#4a443b"/>
    <path d="M60 46l18 30M98 90l20-24M70 100l8 14" stroke="rgba(255,255,255,.18)" stroke-width="1"/>
    <rect x="48" y="132" width="52" height="5" rx="2.5" ${LINE}/>
    <rect x="180" y="30" width="100" height="120" rx="12" ${CARD}/>
    <rect x="188" y="38" width="84" height="84" rx="7" fill="url(#fade${id})"/>
    <circle cx="250" cy="58" r="9" fill="#ffd36b"/>
    <path d="M188 112l26-28 18 18 12-12 28 30v2h-84z" fill="#fff" opacity=".88"/>
    <rect x="188" y="132" width="52" height="5" rx="2.5" ${TEXT}/>
    <circle cx="160" cy="90" r="18" ${A} opacity=".22"/>
    <path d="M160 76l3.5 10.5L174 90l-10.5 3.5L160 104l-3.5-10.5L146 90l10.5-3.5z" fill="#fff"/>
    <path d="M176 66l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5z" fill="#fff" opacity=".7"/>`,

  /* A voice message turns into a text message */
  voice: () => `
    <rect x="34" y="56" width="168" height="52" rx="26" fill="#2b5278"/>
    <circle cx="68" cy="82" r="16" fill="#fff"/>
    <path d="M64 75v14l11-7z" fill="#2b5278"/>
    <rect x="96" y="78" width="4" height="8" rx="2" ${A} opacity=".9"/>
    <rect x="103" y="73" width="4" height="18" rx="2" ${A} opacity=".9"/>
    <rect x="110" y="68" width="4" height="28" rx="2" ${A} opacity=".9"/>
    <rect x="117" y="75" width="4" height="14" rx="2" ${A} opacity=".9"/>
    <rect x="124" y="65" width="4" height="34" rx="2" ${A} opacity=".9"/>
    <rect x="131" y="71" width="4" height="22" rx="2" ${A} opacity=".9"/>
    <rect x="138" y="62" width="4" height="40" rx="2" ${A} opacity=".9"/>
    <rect x="145" y="69" width="4" height="26" rx="2" ${A} opacity=".9"/>
    <rect x="152" y="74" width="4" height="16" rx="2" ${A} opacity=".9"/>
    <rect x="159" y="67" width="4" height="30" rx="2" ${A} opacity=".9"/>
    <rect x="166" y="72" width="4" height="20" rx="2" ${A} opacity=".9"/>
    <rect x="173" y="76" width="4" height="12" rx="2" ${A} opacity=".9"/>
    <rect x="180" y="70" width="4" height="24" rx="2" ${A} opacity=".9"/>
    <rect x="187" y="77" width="4" height="10" rx="2" ${A} opacity=".9"/>
    <rect x="160" y="112" width="34" height="5" rx="2.5" ${LINE}/>
    <path d="M206 82h18" stroke="rgba(255,255,255,.35)" stroke-width="2" stroke-dasharray="4 5" stroke-linecap="round"/>
    <path d="M220 76l7 6-7 6" stroke="rgba(255,255,255,.55)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="234" y="40" width="64" height="96" rx="12" fill="#171717" stroke="rgba(255,255,255,.12)"/>
    <rect x="244" y="54" width="44" height="5" rx="2.5" ${TEXT}/>
    <rect x="244" y="66" width="36" height="5" rx="2.5" ${TEXT}/>
    <rect x="244" y="78" width="42" height="5" rx="2.5" ${TEXT}/>
    <rect x="244" y="90" width="28" height="5" rx="2.5" ${TEXT}/>
    <rect x="244" y="112" width="24" height="10" rx="5" ${A} opacity=".8"/>
    <circle cx="296" cy="42" r="10" fill="${OK}"/>
    <path d="M291.5 42l3 3 6-6" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="40" y="128" width="70" height="20" rx="10" fill="rgba(255,255,255,.05)" stroke="rgba(255,255,255,.1)"/>
    <rect x="52" y="136" width="46" height="4" rx="2" ${LINE}/>`,

  /* A crossword in progress: solved words, the active word, a hint bulb */
  crossword: () => `
    <rect x="66" y="12" width="200" height="160" rx="16" ${CARD}/>
    <rect x="104" y="46" width="22" height="20" rx="4" style="fill:var(--accent)" opacity=".85"/>
    <rect x="130" y="46" width="22" height="20" rx="4" style="fill:var(--accent)" opacity=".85"/>
    <rect x="156" y="46" width="22" height="20" rx="4" style="fill:var(--accent)" opacity=".85"/>
    <rect x="182" y="46" width="22" height="20" rx="4" style="fill:var(--accent)" opacity=".85"/>
    <rect x="208" y="46" width="22" height="20" rx="4" style="fill:var(--accent)" opacity=".85"/>
    <rect x="104" y="70" width="22" height="20" rx="4" style="fill:var(--accent)" opacity=".85"/>
    <rect x="104" y="94" width="22" height="20" rx="4" style="fill:var(--accent)" opacity=".85"/>
    <rect x="104" y="118" width="22" height="20" rx="4" style="fill:var(--accent)" opacity=".85"/>
    <rect x="104" y="142" width="22" height="20" rx="4" style="fill:var(--accent)" opacity=".85"/>
    <rect x="78" y="142" width="22" height="20" rx="4" fill="#1a1a1a" stroke="rgba(255,255,255,.18)"/>
    <rect x="130" y="142" width="22" height="20" rx="4" fill="#1a1a1a" stroke="rgba(255,255,255,.18)"/>
    <rect x="156" y="142" width="22" height="20" rx="4" fill="#1a1a1a" stroke="rgba(255,255,255,.18)"/>
    <rect x="182" y="142" width="22" height="20" rx="4" fill="#1a1a1a" stroke="rgba(255,255,255,.18)"/>
    <rect x="208" y="70" width="22" height="20" rx="4" fill="#3b82f6" fill-opacity=".25" stroke="#3b82f6"/>
    <rect x="208" y="94" width="22" height="20" rx="4" fill="#3b82f6" fill-opacity=".25" stroke="#3b82f6"/>
    <circle cx="246" cy="34" r="12" fill="#ffcf4a"/>
    <path d="M242 40h8M243 44h6" stroke="#7a5a00" stroke-width="2" stroke-linecap="round"/>
    <rect x="232" y="64" width="44" height="22" rx="11" fill="${OK}" opacity=".9"/>
    <rect x="244" y="73" width="20" height="4" rx="2" fill="#000" opacity=".55"/>`,

  /* A quiz card on a stack, with a progress ring */
  education: () => `
    <rect x="92" y="32" width="140" height="118" rx="14" ${CARD} transform="rotate(-9 162 91)" opacity=".55"/>
    <rect x="92" y="32" width="140" height="118" rx="14" ${CARD} transform="rotate(6 162 91)" opacity=".75"/>
    <rect x="88" y="26" width="148" height="128" rx="14" fill="#171717" stroke="rgba(255,255,255,.12)"/>
    <rect x="102" y="42" width="96" height="6" rx="3" ${TEXT}/>
    <rect x="102" y="55" width="64" height="5" rx="2.5" ${LINE}/>
    <rect x="102" y="72" width="120" height="18" rx="7" fill="rgba(255,255,255,.04)" stroke="rgba(255,255,255,.08)"/>
    <rect x="102" y="96" width="120" height="18" rx="7" style="fill:var(--accent);fill-opacity:.16;stroke:var(--accent);stroke-opacity:.7"/>
    <rect x="102" y="120" width="120" height="18" rx="7" fill="rgba(255,255,255,.04)" stroke="rgba(255,255,255,.08)"/>
    <rect x="112" y="79" width="44" height="4" rx="2" ${LINE}/>
    <rect x="112" y="103" width="58" height="4" rx="2" ${TEXT}/>
    <rect x="112" y="127" width="36" height="4" rx="2" ${LINE}/>
    <circle cx="210" cy="105" r="6" fill="${OK}"/>
    <path d="M207.3 105l1.8 1.8 3.6-3.6" stroke="#000" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="270" cy="56" r="20" stroke="rgba(255,255,255,.1)" stroke-width="5"/>
    <circle cx="270" cy="56" r="20" style="stroke:var(--accent)" stroke-width="5" stroke-linecap="round" stroke-dasharray="88 126" transform="rotate(-90 270 56)"/>
    <rect x="58" y="120" width="18" height="18" rx="5" ${A} opacity=".5" transform="rotate(-14 67 129)"/>`,

  /* Product grid + a cart panel with a checkout button */
  shop: () => `
    <rect x="40" y="26" width="64" height="62" rx="12" ${CARD}/>
    <rect x="112" y="26" width="64" height="62" rx="12" ${CARD}/>
    <rect x="40" y="96" width="64" height="62" rx="12" ${CARD}/>
    <rect x="112" y="96" width="64" height="62" rx="12" ${CARD}/>
    <circle cx="72" cy="52" r="15" ${A} opacity=".7"/>
    <rect x="130" y="38" width="28" height="28" rx="8" fill="rgba(255,255,255,.75)"/>
    <path d="M58 136l14-20 14 20z" ${A} opacity=".45"/>
    <rect x="128" y="110" width="32" height="26" rx="13" ${A} opacity=".85"/>
    <rect x="50" y="76" width="24" height="4" rx="2" ${LINE}/>
    <rect x="122" y="76" width="30" height="4" rx="2" ${LINE}/>
    <rect x="50" y="146" width="28" height="4" rx="2" ${LINE}/>
    <rect x="122" y="146" width="22" height="4" rx="2" ${LINE}/>
    <rect x="196" y="26" width="92" height="132" rx="14" fill="#171717" stroke="rgba(255,255,255,.12)"/>
    <rect x="208" y="40" width="40" height="5" rx="2.5" ${TEXT}/>
    <rect x="208" y="58" width="68" height="20" rx="6" fill="rgba(255,255,255,.04)"/>
    <rect x="208" y="84" width="68" height="20" rx="6" fill="rgba(255,255,255,.04)"/>
    <circle cx="219" cy="68" r="5" ${A} opacity=".7"/>
    <rect x="214" y="89" width="10" height="10" rx="3" fill="rgba(255,255,255,.6)"/>
    <rect x="230" y="66" width="30" height="4" rx="2" ${LINE}/>
    <rect x="230" y="92" width="24" height="4" rx="2" ${LINE}/>
    <rect x="208" y="128" width="68" height="18" rx="9" ${A}/>
    <rect x="226" y="135" width="32" height="4" rx="2" fill="#fff" opacity=".9"/>
    <circle cx="282" cy="30" r="11" fill="${OK}"/>
    <text x="282" y="34.5" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="12" font-weight="700" fill="#000">2</text>`,

  /* A mini-game screen with blocks, a coin and a controller */
  games: () => `
    <rect x="70" y="18" width="180" height="116" rx="16" ${CARD}/>
    <rect x="84" y="102" width="20" height="20" rx="4" ${A} opacity=".9"/>
    <rect x="106" y="102" width="20" height="20" rx="4" ${A} opacity=".6"/>
    <rect x="106" y="80" width="20" height="20" rx="4" ${A} opacity=".9"/>
    <rect x="128" y="102" width="20" height="20" rx="4" fill="rgba(255,255,255,.7)"/>
    <rect x="194" y="102" width="20" height="20" rx="4" ${A} opacity=".45"/>
    <rect x="216" y="102" width="20" height="20" rx="4" ${A} opacity=".7"/>
    <rect x="216" y="80" width="20" height="20" rx="4" fill="rgba(255,255,255,.35)"/>
    <circle cx="172" cy="56" r="16" fill="#ffcf4a"/>
    <path d="M172 46l3 6.2 6.8 1-4.9 4.7 1.2 6.7-6.1-3.2-6.1 3.2 1.2-6.7-4.9-4.7 6.8-1z" fill="#b8860b"/>
    <rect x="86" y="32" width="38" height="6" rx="3" ${TEXT}/>
    <rect x="200" y="32" width="34" height="10" rx="5" fill="${OK}" opacity=".9"/>
    <rect x="118" y="140" width="84" height="30" rx="15" fill="#171717" stroke="rgba(255,255,255,.12)"/>
    <path d="M136 155h12M142 149v12" stroke="rgba(255,255,255,.6)" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="178" cy="152" r="4" ${A}/>
    <circle cx="188" cy="159" r="4" fill="rgba(255,255,255,.6)"/>`,
};

/** Render an illustration. Must be placed inside an element that sets `--accent`. */
export function art(name: ArtName): SafeHtml {
  uid += 1;
  return raw(frame(DRAWINGS[name](uid), uid));
}
