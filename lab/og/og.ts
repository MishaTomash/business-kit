/**
 * Генератор картинок прев'ю посилань (og:image) 1200×630 у стилі «ДНК», на canvas, без залежностей.
 * Відкрийте /lab/og.html у `npm run dev`: кожну картинку можна завантажити кнопкою й покласти в public/og/.
 * Або все одразу: `node lab/og-export.mjs` (потрібен запущений `npm run dev` і Playwright).
 *
 * Загальна картинка: логотип, заголовок головної, спіраль ДНК. Картинка гри: назва, жанр, статус,
 * опис і генетичний відбиток (той самий, що на сайті: src/lib/fingerprint.ts).
 */
import { GAMES, isPlayable } from '@/data';
import { BRAND, BRAND_LINE } from '@/data/site';
import { HOME } from '@/data/home';
import { GAME_PAGE } from '@/data/pages';
import { GENRE_LABELS } from '@/data/genres';
import { COLUMNS, FIELD_UNITS, BAR_WIDTH } from '@/lib/fingerprint';
import { gameFingerprint } from '@/components/fingerprint';
import { PHI_STATIC, RUNG_STEP } from '@/components/spiral';
import type { Game } from '@/types';

const W = 1200;
const H = 630;
const PAD = 72;
const C = {
  ground: '#0e1714',
  layer: '#15221e',
  ivory: '#f1ece1',
  lichen: '#a9b3aa',
  coral: '#ee8466',
  ink: '#0e1714',
  line: '#2c3d36',
  ui: '#66736c',
} as const;

const DISPLAY = 'Rubik';
const TEXT = '"Golos Text"';

/** Логотип: кільце й два ланцюги (ті самі шляхи, що в символі #i-logo, поле 24×24). */
function logo(c: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  c.save();
  c.translate(x, y);
  c.scale(size / 24, size / 24);
  c.lineCap = 'round';
  c.beginPath();
  c.arc(12, 12, 10.1, 0, Math.PI * 2);
  c.strokeStyle = C.ivory;
  c.lineWidth = 1.8;
  c.stroke();
  const strand = (d: string, color: string): void => {
    c.strokeStyle = color;
    c.lineWidth = 2.4;
    c.stroke(new Path2D(d));
  };
  strand('M8.7 6.4C13.2 9.2 10.8 14.8 15.3 17.6', C.coral);
  strand('M15.3 6.4C10.8 9.2 13.2 14.8 8.7 17.6', C.lichen);
  c.restore();
  c.fillStyle = C.ivory;
  c.font = `800 34px ${DISPLAY}`;
  c.textAlign = 'left';
  c.textBaseline = 'middle';
  c.fillText(BRAND, x + size + 16, y + size / 2 + 1);
}

function wrap(c: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lh: number, maxLines: number): number {
  const words = text.split(' ');
  let line = '';
  let lines = 0;
  for (let i = 0; i < words.length; i++) {
    const test = line ? `${line} ${words[i]}` : (words[i] ?? '');
    if (c.measureText(test).width > maxW && line) {
      lines++;
      if (lines === maxLines) {
        c.fillText(`${line.replace(/[,.;:—–-]$/, '')}…`, x, y);
        return y + lh;
      }
      c.fillText(line, x, y);
      y += lh;
      line = words[i] ?? '';
    } else line = test;
  }
  if (line) c.fillText(line, x, y);
  return y + lh;
}

/** Спіраль ДНК із вертикальною віссю (статична, φ = 0.6), як у hero на десктопі. */
function spiral(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, rungs: number): void {
  for (let i = 0; i < rungs; i++) {
    const t = RUNG_STEP * i + PHI_STATIC;
    const s = Math.sin(t);
    const cs = Math.cos(t);
    const cy = y + (i / (rungs - 1)) * h;
    const cx = x + w / 2;
    const x1 = cx + 0.44 * w * s;
    const x2 = cx - 0.44 * w * s;
    c.strokeStyle = C.line;
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(x1, cy);
    c.lineTo(x2, cy);
    c.stroke();
    const dot = (px: number, depth: number, color: string): void => {
      c.globalAlpha = Math.max(0.08, 0.5 + 0.5 * depth);
      c.fillStyle = color;
      c.beginPath();
      c.arc(px, cy, (9 + 5 * depth) * 0.75, 0, Math.PI * 2);
      c.fill();
      c.globalAlpha = 1;
    };
    dot(x1, cs, C.coral);
    dot(x2, -cs, C.ivory);
  }
}

/** Генетичний відбиток гри в прямокутнику (поле 16 × 30 одиниць, як SVG на сайті). */
function fingerprint(c: CanvasRenderingContext2D, g: Game, x: number, y: number, w: number, h: number): void {
  const fp = gameFingerprint(g);
  const uw = w / COLUMNS;
  const uh = h / FIELD_UNITS;
  const mid = FIELD_UNITS / 2;
  fp.bars.forEach((b, i) => {
    const bx = x + (i + (1 - BAR_WIDTH) / 2) * uw;
    c.fillStyle = b.c1;
    c.fillRect(bx, y + (mid - 0.5 - b.top) * uh, BAR_WIDTH * uw, b.top * uh);
    c.fillStyle = b.c2;
    c.fillRect(bx, y + (mid + 0.5) * uh, BAR_WIDTH * uw, b.bottom * uh);
  });
}

function drawDefault(c: CanvasRenderingContext2D): void {
  c.fillStyle = C.ground;
  c.fillRect(0, 0, W, H);
  logo(c, PAD, 56, 48);
  c.fillStyle = C.ivory;
  c.font = `800 66px ${DISPLAY}`;
  c.textAlign = 'left';
  c.textBaseline = 'alphabetic';
  const y = wrap(c, HOME.hero.title, PAD, 236, 680, 72, 4);
  c.fillStyle = C.lichen;
  c.font = `400 30px ${TEXT}`;
  const [launch, , share] = HOME.hero.facts;
  wrap(c, `${BRAND_LINE}. Запуск ${launch?.value ?? ''}, ${share?.label ?? ''}: ${share?.value ?? ''}.`, PAD, y + 24, 680, 40, 2);
  spiral(c, 820, 70, 320, 490, 16);
}

function drawGame(c: CanvasRenderingContext2D, g: Game): void {
  const live = isPlayable(g);
  c.fillStyle = C.ground;
  c.fillRect(0, 0, W, H);
  logo(c, PAD, 56, 48);

  // Відбиток на панелі Шару праворуч угорі
  c.fillStyle = C.layer;
  c.fillRect(640, 56, 488, 210);
  fingerprint(c, g, 672, 80, 424, 162);

  // Статус і жанр
  const by = 330;
  c.font = `600 24px ${TEXT}`;
  c.textBaseline = 'middle';
  const label = live ? 'працює' : GAME_PAGE.soon.badge;
  const bw = c.measureText(label).width + 28;
  if (live) {
    c.fillStyle = C.coral;
    c.fillRect(PAD, by - 20, bw, 40);
    c.fillStyle = C.ink;
  } else {
    c.setLineDash([6, 5]);
    c.strokeStyle = C.ui;
    c.lineWidth = 2;
    c.strokeRect(PAD + 1, by - 19, bw - 2, 38);
    c.setLineDash([]);
    c.fillStyle = C.lichen;
  }
  c.fillText(label, PAD + 14, by + 1);
  c.fillStyle = C.lichen;
  c.font = `400 24px ${TEXT}`;
  c.fillText(GENRE_LABELS[g.dna.genre], PAD + bw + 18, by + 1);

  // Назва й опис
  c.textBaseline = 'alphabetic';
  c.fillStyle = C.ivory;
  c.font = `800 92px ${DISPLAY}`;
  wrap(c, g.name, PAD, by + 118, W - PAD * 2, 96, 1);
  c.fillStyle = C.lichen;
  c.font = `400 30px ${TEXT}`;
  wrap(c, g.tagline, PAD, by + 182, W - PAD * 2, 40, 2);
}

async function main(): Promise<void> {
  await Promise.all([`800 66px ${DISPLAY}`, `400 30px ${TEXT}`, `600 24px ${TEXT}`].map((f) => document.fonts.load(f, 'ҐЄІЇґєіїАБВ₴123')));
  const list = document.getElementById('list');
  if (!list) return;
  const items: Array<{ file: string; draw: (c: CanvasRenderingContext2D) => void }> = [
    { file: 'default.png', draw: drawDefault },
    ...GAMES.map((g) => ({ file: `${g.id}.png`, draw: (c: CanvasRenderingContext2D) => drawGame(c, g) })),
  ];
  for (const it of items) {
    const box = document.createElement('div');
    box.className = 'item';
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    canvas.dataset['file'] = it.file;
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;
    it.draw(ctx);
    const row = document.createElement('div');
    row.className = 'row';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = 'Завантажити PNG';
    btn.addEventListener('click', () => {
      const a = document.createElement('a');
      a.download = it.file;
      a.href = canvas.toDataURL('image/png');
      a.click();
    });
    const name = document.createElement('code');
    name.textContent = `public/og/${it.file}`;
    row.append(btn, name);
    box.append(canvas, row);
    list.append(box);
  }
  document.body.dataset['ready'] = '1';
}

void main();
