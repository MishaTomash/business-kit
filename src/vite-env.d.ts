/// <reference types="vite/client" />

/** Публічні змінні середовища (див. `.env`). */
interface ImportMetaEnv {
  /** Контакт для продажів у Telegram, напр. https://t.me/your_username */
  readonly VITE_TELEGRAM_URL: string;
  /** Адреса сайту без «/» у кінці. Потрібна для og:image і canonical у прев'ю посилань. */
  readonly VITE_SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
