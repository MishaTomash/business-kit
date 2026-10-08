import { defineConfig, type Plugin } from 'vite';
import { fileURLToPath, URL } from 'node:url';

/**
 * Vite configuration.
 * - `@/` alias keeps imports short and refactor-safe (mirrored in tsconfig `paths`).
 * - Modern build target: the page relies on CSS nesting-free modern features
 *   (color-mix, :has, individual transform properties) that ship in all evergreen browsers.
 * - preloadFonts: кириличні файли Unbounded і Onest вантажаться разом з HTML,
 *   щоб заголовки не «стрибали» при підміні шрифту (CLS).
 */
function preloadFonts(): Plugin {
  return {
    name: 'preload-cyrillic-fonts',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(_html, ctx) {
        const files = Object.keys(ctx.bundle ?? {}).filter((f) => /(unbounded|onest)-cyrillic-wght-normal-[\w-]+\.woff2$/.test(f));
        return files.map((f) => ({
          tag: 'link',
          attrs: { rel: 'preload', as: 'font', type: 'font/woff2', href: `/${f}`, crossorigin: '' },
          injectTo: 'head' as const,
        }));
      },
    },
  };
}

export default defineConfig({
  plugins: [preloadFonts()],
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
