/**
 * Зберігає всі картинки прев'ю з /lab/og.html у public/og/*.png.
 *
 *   npm run dev            (в іншому вікні)
 *   node lab/og-export.mjs [адреса dev-сервера, за замовчуванням http://localhost:5173]
 *
 * Потрібен Playwright (npx playwright install chromium), у залежності проєкту він не входить.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = process.argv[2] ?? 'http://localhost:5173';
const { chromium } = await import('playwright');
const b = await chromium.launch();
const p = await b.newPage();
await p.goto(`${base}/lab/og.html`);
await p.waitForSelector('body[data-ready="1"]');
const shots = await p.$$eval('canvas[data-file]', (cs) => cs.map((c) => ({ file: c.dataset.file, url: c.toDataURL('image/png') })));
for (const { file, url } of shots) {
  const out = path.join(root, 'public', 'og', file);
  fs.writeFileSync(out, Buffer.from(url.split(',')[1], 'base64'));
  console.log('Записано', path.relative(root, out));
}
await b.close();
