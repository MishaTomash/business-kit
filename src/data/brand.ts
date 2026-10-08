/**
 * Назва бренду — єдине місце. Звідси вона потрапляє в шапку, футер, <title> і прев'ю посилань
 * (у index.html через плагін у vite.config.ts, у сторінки через site.ts).
 */
export const BRAND = 'Клітинка';

/** Родовий відмінок назви для юридичних текстів («у боті Клітинки»). Змінюєте BRAND — змініть і це. */
export const BRAND_OF = 'Клітинки';

/** Адреса сайту, якщо VITE_SITE_URL не задано. Для canonical, og:url, og:image, sitemap і robots. */
export const DEFAULT_SITE_URL = 'https://klitynka.online';

/** Один рядок суті бренду для головної й прев'ю посилань. */
export const BRAND_LINE = 'Ігри в Telegram під ключ для вашого каналу';
