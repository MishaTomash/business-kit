/**
 * Макет прев'ю посилання в Telegram. Читає og-мета з ЗІБРАНОЇ сторінки (dist/), тож після
 * `npm run build` показує те, що побачить Telegram. Це макет, а не знімок із Telegram.
 *
 *   node lab/tg-preview.mjs [шлях сторінки, за замовчуванням /games/slovovyr]
 *
 * Пише lab/tg-preview.html (відкрийте в браузері). Для PNG: node lab/tg-preview.mjs --png
 * (потрібен Playwright). Telegram кешує прев'ю, тож після деплою оновіть його в @WebpageBot.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const page = args.find((a) => a.startsWith('/')) ?? '/games/slovovyr';
const file = path.join(root, 'dist', page === '/' ? '' : page, 'index.html');
if (!fs.existsSync(file)) throw new Error(`Немає ${file}. Спершу npm run build.`);

const src = fs.readFileSync(file, 'utf8');
const og = (name) => {
  const m = new RegExp(`<meta property="og:${name}" content="([^"]*)"`).exec(src);
  if (!m) throw new Error(`У ${page} немає og:${name}`);
  return m[1];
};
const url = og('url');
const image = og('image');
const imageFile = path.join(root, 'public', new URL(image).pathname);
if (!fs.existsSync(imageFile)) throw new Error(`Немає картинки ${imageFile}`);
const png = `data:image/png;base64,${fs.readFileSync(imageFile).toString('base64')}`;
const esc = (s) => s.replace(/&amp;/g, '&').replace(/&/g, '&amp;').replace(/</g, '&lt;');

const html = `<!doctype html><html lang="uk"><meta charset="utf-8"><title>Макет прев'ю Telegram</title><style>
body{margin:0;background:#8fb08a;font:15px/1.35 -apple-system,"Segoe UI",Roboto,Arial,sans-serif;padding:24px 12px}
.cap{color:#0d2a1c;background:#fff;display:inline-block;padding:6px 10px;border-radius:10px;font-size:13px;margin-bottom:14px}
.msg{max-width:340px;margin-left:auto;background:#effdde;border-radius:16px 16px 4px 16px;padding:8px 10px 6px;box-shadow:0 1px 1px rgba(0,0,0,.15)}
.link{color:#168acd;word-break:break-all}
.pv{margin-top:6px;border-left:3px solid #4fae4e;padding:2px 0 2px 8px;background:rgba(79,174,78,.08);border-radius:4px}
.site{color:#4fae4e;font-weight:600}.t{font-weight:600;margin-top:1px}.d{margin-top:1px;color:#000}
.pv img{display:block;width:100%;border-radius:6px;margin-top:6px}
.time{text-align:right;color:#62ac55;font-size:12px;margin-top:2px}
</style><body><div class="cap">Макет: так Telegram покаже посилання (дані з og-мета зібраної сторінки)</div>
<div class="msg"><span class="link">${esc(url)}</span>
<div class="pv"><div class="site">${esc(og('site_name'))}</div><div class="t">${esc(og('title'))}</div><div class="d">${esc(og('description'))}</div><img alt="" src="${png}"></div>
<div class="time">16:42</div></div></body></html>`;

const out = path.join(root, 'lab', 'tg-preview.html');
fs.writeFileSync(out, html);
console.log(`Записано ${path.relative(root, out)} для ${url}`);

if (args.includes('--png')) {
  const { chromium } = await import('playwright');
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 700 }, deviceScaleFactor: 2 });
  await p.goto(`file://${out}`);
  await p.screenshot({ path: path.join(root, 'lab', 'tg-preview.png'), fullPage: true });
  await b.close();
  console.log('Записано lab/tg-preview.png');
}
