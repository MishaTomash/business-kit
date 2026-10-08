import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

/**
 * Vite configuration.
 * - `@/` alias keeps imports short and refactor-safe (mirrored in tsconfig `paths`).
 * - Modern build target: the page relies on CSS nesting-free modern features
 *   (color-mix, :has, individual transform properties) that ship in all evergreen browsers.
 */
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    target: 'es2022',
    cssTarget: ['chrome111', 'safari16.4', 'firefox113'],
    sourcemap: false,
    // Small single-page app: one JS + one CSS chunk is optimal for first paint.
    cssCodeSplit: false,
    assetsInlineLimit: 0,
  },
  server: {
    open: true,
  },
});
