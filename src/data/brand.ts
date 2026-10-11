/**
 * Назва бренду — єдине місце. Звідси вона потрапляє в шапку, футер, <title> і прев'ю посилань
 * (у index.html через плагін у vite.config.ts, у сторінки через site.ts).
 */
export const BRAND = 'Клітинка';

/** Родовий відмінок назви для юридичних текстів («у боті Клітинки»). Змінюєте BRAND — змініть і це. */
export const BRAND_OF = 'Клітинки';

/** Назва латиницею: лише для <title> (вкладка браузера, результати пошуку). У шапці, футері й текстах лишається BRAND. */
export const BRAND_EN = 'Klitynka';

/** Адреса сайту, якщо VITE_SITE_URL не задано. Для canonical, og:url, og:image, sitemap і robots. */
export const DEFAULT_SITE_URL = 'https://klitynka.online';

/** Один рядок суті бренду для головної й прев'ю посилань. */
export const BRAND_LINE = 'Ігри в Telegram під ключ';

/**
 * Контакт власника в Telegram для питань і підтримки, якщо VITE_TELEGRAM_URL не задано або там
 * лишилась заглушка your_username. Замовлення ж іде через бот Кабінету (CABINET_BOT у src/data/games.ts).
 */
export const DEFAULT_CONTACT_URL = 'https://t.me/misha_tom';

/** Значення VITE_TELEGRAM_URL або запасний контакт, якщо змінна порожня чи досі заглушка. */
export function contactUrl(fromEnv: string | undefined): string {
  const v = (fromEnv ?? '').trim();
  return v.startsWith('https://t.me/') && !v.includes('your_username') ? v : DEFAULT_CONTACT_URL;
}
