/// <reference types="vite/client" />

/** Strictly-typed public env variables (see `.env`). */
interface ImportMetaEnv {
  readonly VITE_TELEGRAM_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
