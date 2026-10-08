/**
 * Генератор картинок прев'ю (og:image) 1200×630 на canvas, без залежностей.
 * Відкрийте /lab/og.html у `npm run dev`, натисніть «Завантажити PNG» і покладіть файл у public/og/.
 */
import { GAMES } from '@/data';
import { BRAND } from '@/data/site';
import type { Game } from '@/types';

const W = 1200;
const H = 630;
const FOREST = '#0d2a1c';
const MINT = '#d5eedc';
const GOLD = '#ffb81c';
const GREEN = '#1f7a47';

const STAR = [
  [50, 2], [61.76, 33.82], [95.65, 35.17], [69.02, 56.18], [78.21, 88.83],
  [50, 70], [21.79, 88.83], [30.98, 56.18], [4.35, 35.17], [38.24, 33.82],
] as const;

function rr(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

function star(c: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string): void {
  c.beginPath();
  STAR.forEach(([px, py], i) => {
    const x = cx + ((px - 50) / 100) * size;
    const y = cy + ((py - 50) / 100) * size;
    if (i === 0) c.moveTo(x, y);
    else c.lineTo(x, y);
  });
  c.closePath();
  c.fillStyle = color;
  c.lineJoin = 'round';
  c.lineWidth = size * 0.06;
  c.strokeStyle = color;
  c.fill();
  c.stroke();
}

interface TileStyle {
  face: string;
  ink: string;
  edge: string;
  line?: string;
}

function tile(c: CanvasRenderingContext2D, x: number, y: number, s: number, ch: string, st: TileStyle): void {
  const w = s * 0.8;
  rr(c, x, y + s * 0.07, w, s, s * 0.18);
  c.fillStyle = st.edge;
  c.fill();
  rr(c, x, y, w, s, s * 0.18);
  c.fillStyle = st.face;
  c.fill();
  if (st.line) {
    c.lineWidth = Math.max(3, s * 0.035);
    c.strokeStyle = st.line;
    rr(c, x + c.lineWidth / 2, y + c.lineWidth / 2, w - c.lineWidth, s - c.lineWidth, s * 0.17);
    c.stroke();
  }
  if (ch === '★') star(c, x + w / 2, y + s / 2, s * 0.56, st.ink);
  else {
    c.fillStyle = st.ink;
    c.font = `800 ${Math.round(s * 0.56)}px Geologica`;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText(ch, x + w / 2, y + s / 2 + s * 0.03);
  }
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
        c.fillText(`${line.replace(/[,.;:]$/, '')}…`, x, y);
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

function brandMark(c: CanvasRenderingContext2D, x: number, y: number, ink: string, face: string, edge: string): void {
  rr(c, x, y + 6, 52, 46, 12);
  c.fillStyle = edge;
  c.fill();
  rr(c, x, y, 52, 46, 12);
  c.fillStyle = face;
  c.fill();
  star(c, x + 26, y + 23, 30, GOLD);
  c.fillStyle = ink;
  c.font = '800 34px Geologica';
  c.textAlign = 'left';
  c.textBaseline = 'middle';
  c.fillText(BRAND, x + 68, y + 25);
}

const luminance = (hex: string): number => {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * (ch[0] ?? 0) + 0.7152 * (ch[1] ?? 0) + 0.0722 * (ch[2] ?? 0);
};

function drawGame(c: CanvasRenderingContext2D, g: Game, live: boolean): void {
  const t = g.theme;
  const dark = luminance(t.bg) < 0.2;
  c.fillStyle = t.bg;
  c.fillRect(0, 0, W, H);
  if (!dark) {
    c.lineWidth = 6;
    c.strokeStyle = FOREST;
    c.strokeRect(3, 3, W - 6, H - 6);
  }
  brandMark(c, 64, 56, t.ink, dark ? MINT : FOREST, dark ? '#93c3a3' : GREEN);

  const word = [...g.coverWord.toUpperCase()];
  const s = Math.min(150, (W - 128) / (word.length * 0.88));
  let x = 64;
  const y = 170;
  for (const ch of word) {
    tile(c, x, y, s, ch, { face: t.tile, ink: t.tileInk, edge: 'rgba(0,0,0,0.3)' });
    x += s * 0.88;
  }

  c.fillStyle = t.ink;
  c.textAlign = 'left';
  c.textBaseline = 'alphabetic';
  c.font = '800 76px Geologica';
  c.fillText(g.name, 64, y + s + 110);
  c.font = '500 30px "Golos Text"';
  const sub = live ? `${g.genre} у Telegram для вашого каналу` : `${g.genre}. У розробці`;
  wrap(c, sub, 64, y + s + 160, W - 128, 40, 1);
}

function drawDefault(c: CanvasRenderingContext2D): void {
  c.fillStyle = MINT;
  c.fillRect(0, 0, W, H);
  brandMark(c, 64, 56, FOREST, FOREST, GREEN);
  c.fillStyle = FOREST;
  c.font = '800 72px Geologica';
  c.textAlign = 'left';
  c.textBaseline = 'alphabetic';
  ['Гра у вашому', 'Telegram.', 'Зірки — на вашому', 'рахунку.'].forEach((l, i) => c.fillText(l, 64, 240 + i * 78));
  const s = 64;
  const cells: Array<[string, number, number, string]> = [
    ['З', 3, 1, 'g'], ['І', 3, 2, 'g'], ['Г', 2, 3, 'w'], ['Р', 3, 3, 'g'], ['А', 4, 3, 'w'], ['К', 3, 4, 'g'],
    ['Г', 1, 5, 'n'], ['Р', 2, 5, 'n'], ['И', 3, 5, 'g'], ['В', 4, 5, 'n'], ['Н', 5, 5, 'n'], ['І', 6, 5, 'n'],
  ];
  const ox = W - 64 - 6 * (s * 0.8) - 5 * 8;
  const oy = 150;
  for (const [ch, col, row, tone] of cells) {
    const face = tone === 'g' ? GOLD : tone === 'n' ? GREEN : '#ffffff';
    const ink = tone === 'n' ? '#ffffff' : FOREST;
    tile(c, ox + (col - 1) * (s * 0.8 + 8), oy + (row - 1) * (s + 10), s, ch, { face, ink, edge: FOREST, line: FOREST });
  }
}

async function main(): Promise<void> {
  await Promise.all(['800 72px Geologica', '500 30px "Golos Text"'].map((f) => document.fonts.load(f, 'ҐЄІЇґєіїАБВ₴123')));
  const list = document.getElementById('list');
  if (!list) return;
  const items: Array<{ file: string; draw: (c: CanvasRenderingContext2D) => void }> = [
    { file: 'default.png', draw: drawDefault },
    ...GAMES.map((g) => ({ file: `${g.id}.png`, draw: (c: CanvasRenderingContext2D) => drawGame(c, g, g.status === 'available' && !g.mock) })),
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
