import { defineConfig, createServer, loadEnv, type Plugin, type ResolvedConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
import { BRAND, BRAND_LINE, DEFAULT_SITE_URL } from './src/data/brand.ts';

const SRC = fileURLToPath(new URL('./src', import.meta.url));

/** Назва бренду, рядок суті й адреса сайту в index.html (шапка, футер, canonical). */
function brandHtml(): Plugin {
  let siteUrl = DEFAULT_SITE_URL;
  return {
    name: 'brand-html',
    configResolved(c) {
      const env = loadEnv(c.mode, c.envDir ?? c.root, 'VITE_');
      siteUrl = (env['VITE_SITE_URL'] || DEFAULT_SITE_URL).replace(/\/+$/, '');
    },
    transformIndexHtml: {
      order: 'pre',
      handler: (html) =>
        html
          .replaceAll('%BRAND_LINE%', BRAND_LINE)
          .replaceAll('%BRAND%', BRAND)
          .replaceAll('%SITE_HOST%', new URL(siteUrl).host)
          .replaceAll('%VITE_SITE_URL%', siteUrl),
    },
  };
}

/**
 * Шрифти першого екрана вантажаться разом з HTML, щоб заголовки не «стрибали» при підміні (CLS):
 * Rubik 800 (кирилиця й латиниця: цифри й пробіли теж із латинської підмножини) і кирилиця Golos Text 400.
 */
function preloadFonts(): Plugin {
  return {
    name: 'preload-fonts',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(_html, ctx) {
        const files = Object.keys(ctx.bundle ?? {}).filter((f) =>
          /(rubik-(cyrillic|latin)-800|golos-text-cyrillic-400)-normal-[\w-]+\.woff2$/.test(f),
        );
        return files.map((f) => ({
          tag: 'link',
          attrs: { rel: 'preload', as: 'font', type: 'font/woff2', href: `/${f}`, crossorigin: '' },
          injectTo: 'head' as const,
        }));
      },
    },
  };
}

/** Форма модуля src/prerender.ts (без імпорту типів, щоб конфіг не тягнув DOM-типи). */
interface PrerenderModule {
  pages(): Array<{
    file: string;
    key: string;
    navTone: 'dark' | 'light';
    markup: string;
    jsonLd: string;
    meta: {
      title: string;
      description: string;
      ogTitle?: string;
      ogImage?: string;
      path: string;
      noindex?: boolean;
      lastmod?: string;
      jsonLd?: readonly Record<string, unknown>[];
    };
  }>;
  site: { BRAND: string; SITE_URL: string };
}

/**
 * Місця в юридичних текстах (content/legal/*.md), які ще чекають підтвердження власника
 * (слово ПІДТВЕРДИТИ). Збірка не падає, а виводить помітне попередження зі списком.
 */
function legalMarkers(root: string): string[] {
  const dir = path.join(root, 'content', 'legal');
  if (!fs.existsSync(dir)) return [];
  const found: string[] = [];
  for (const name of fs.readdirSync(dir).filter((f) => f.endsWith('.md')).sort()) {
    fs.readFileSync(path.join(dir, name), 'utf8')
      .split(/\r?\n/)
      .forEach((line, i) => {
        if (line.includes('ПІДТВЕРДИТИ')) found.push(`content/legal/${name}:${i + 1}  ${line.trim().slice(0, 110)}`);
      });
  }
  return found;
}

const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Prerender: після збірки пише готовий HTML для кожної сторінки (/, /games, /games/<id>, 404.html)
 * з власними <title>, description і og-мета. Так посилання на гру в Telegram показує прев'ю
 * саме цієї гри, а сайт читається без JS. nginx: try_files $uri $uri/ /index.html.
 */
function prerender(): Plugin {
  let config: ResolvedConfig;
  return {
    name: 'prerender',
    apply: 'build',
    configResolved(c) {
      config = c;
    },
    async closeBundle() {
      if (config.build.ssr) return;
      const outDir = path.resolve(config.root, config.build.outDir);
      const templatePath = path.join(outDir, 'index.html');
      if (!fs.existsSync(templatePath)) return;
      const template = fs.readFileSync(templatePath, 'utf8');
      const server = await createServer({
        root: config.root,
        mode: config.mode,
        configFile: false,
        logLevel: 'error',
        appType: 'custom',
        server: { middlewareMode: true, hmr: false, ws: false },
        resolve: { alias: { '@': SRC } },
        optimizeDeps: { noDiscovery: true, include: [] },
      });
      try {
        const mod = (await server.ssrLoadModule('/src/prerender.ts')) as unknown as PrerenderModule;
        const { SITE_URL } = mod.site;
        const publicDir = config.publicDir;
        for (const page of mod.pages()) {
          const m = page.meta;
          let og = m.ogImage ?? '/og/default.png';
          if (!fs.existsSync(path.join(publicDir, og))) {
            config.logger.warn(`[prerender] Немає ${og}, беру /og/default.png (${page.file})`);
            og = '/og/default.png';
          }
          const url = `${SITE_URL}${m.path}`;
          const metaTags = [
            `<meta name="description" content="${esc(m.description)}" />`,
            // Сторінка з noindex не має канонічної адреси: canonical на неї (або на неіснуючу /404) лише плутає пошуковик.
            m.noindex ? `<meta name="robots" content="noindex" />` : `<link rel="canonical" href="${esc(url)}" />`,
            `<meta property="og:type" content="website" />`,
            `<meta property="og:site_name" content="${esc(mod.site.BRAND)}" />`,
            `<meta property="og:locale" content="uk_UA" />`,
            `<meta property="og:title" content="${esc(m.ogTitle ?? m.title)}" />`,
            `<meta property="og:description" content="${esc(m.description)}" />`,
            `<meta property="og:url" content="${esc(url)}" />`,
            `<meta property="og:image" content="${esc(SITE_URL + og)}" />`,
            `<meta property="og:image:width" content="1200" />`,
            `<meta property="og:image:height" content="630" />`,
            `<meta property="og:image:alt" content="${esc(m.ogTitle ?? m.title)}" />`,
            `<meta name="twitter:card" content="summary_large_image" />`,
            // Schema.org: блок даних, браузер його не виконує, CSP не порушується (src/lib/schema.ts).
            page.jsonLd,
          ]
            .filter(Boolean)
            .join('\n    ');
          const active = page.key === 'home' ? 'home' : page.key.startsWith('game') ? 'games' : '';
          let out = template
            // Заміни через функцію: інакше «$&», «$'» у тексті сторінки (напр. «0,013 $&nbsp;/ ★») String.replace сприйме як шаблони.
            .replace(/<title>[\s\S]*?<\/title>/, () => `<title>${esc(m.title)}</title>`)
            .replace(/\s*<meta name="description"[^>]*>/, '')
            .replace(/\s*<link rel="canonical"[^>]*>/, '')
            .replace('<!--page-meta-->', () => metaTags)
            .replace('<main id="app" tabindex="-1"><!--app--></main>', () => `<main id="app" tabindex="-1" data-route="${esc(page.key)}">${page.markup}</main>`);
          out = out.replace('<html lang="uk">', `<html lang="uk" data-nav-tone="${page.navTone}">`);
          if (active) out = out.replaceAll(`data-nav="${active}"`, `data-nav="${active}" aria-current="page"`);
          const target = path.join(outDir, page.file);
          fs.mkdirSync(path.dirname(target), { recursive: true });
          fs.writeFileSync(target, out);
        }
        // Карта сайту й robots.txt для пошукових систем (404 не потрапляє)
        const urls = mod
          .pages()
          .filter((pg) => !pg.meta.noindex)
          .map((pg) => `  <url><loc>${esc(SITE_URL + pg.meta.path)}</loc>${pg.meta.lastmod ? `<lastmod>${esc(pg.meta.lastmod)}</lastmod>` : ''}</url>`)
          .join('\n');
        fs.writeFileSync(path.join(outDir, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
        fs.writeFileSync(path.join(outDir, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
        config.logger.info(`[prerender] Сторінок: ${mod.pages().length}`);
        const markers = legalMarkers(config.root);
        if (markers.length) {
          const bar = '!'.repeat(78);
          config.logger.warn(
            `\n${bar}\n!! УВАГА: у юридичних текстах лишилось місць, що чекають підтвердження (${markers.length}).\n!! Вони ПОТРАПЛЯТЬ на сайт як є. Замініть їх у content/legal/*.md до запуску:\n${bar}\n${markers
              .map((m) => `  - ${m}`)
              .join('\n')}\n${bar}\n`,
          );
        }
      } finally {
        await server.close();
      }
    },
  };
}

export default defineConfig({
  plugins: [brandHtml(), preloadFonts(), prerender()],
  resolve: {
    alias: { '@': SRC },
  },
  build: {
    target: 'es2022',
    cssTarget: ['chrome111', 'safari16.4', 'firefox113'],
    sourcemap: false,
    cssCodeSplit: false,
    assetsInlineLimit: 0,
  },
  server: {
    open: true,
  },
});
