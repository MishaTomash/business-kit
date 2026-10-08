// Лише для етапів 2–3: збірка лаб-сторінок окремо від сайту (npx vite build -c lab/vite.config.ts).
import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

const r = (p: string): string => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  root: r('..'),
  resolve: { alias: { '@': r('../src') } },
  build: {
    outDir: r('../node_modules/.snap/lab-dist'),
    emptyOutDir: true,
    assetsInlineLimit: 0,
    rollupOptions: {
      input: { system: r('./system.html') },
    },
  },
});
