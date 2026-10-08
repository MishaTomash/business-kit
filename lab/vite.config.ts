// Лише для етапу 2: збірка лаб-сторінок окремо від сайту (npx vite build -c lab/vite.config.ts).
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
      input: { d1: r('./direction-1.html'), d2: r('./direction-2.html'), d3: r('./direction-3.html') },
    },
  },
});
