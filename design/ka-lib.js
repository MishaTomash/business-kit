// Клітинка: генетичний відбиток гри. Еталонна реалізація за правилом з DESIGN-SPEC (напрям A, v2).
// Чиста детермінована функція без DOM, Date і Math.random.
'use strict';

const GENRE_COLORS = {
  slova: '#E9D8A6',        // Слова
  viktoryny: '#A9C79A',    // Вікторини
  holovolomky: '#E0A9B8',  // Головоломки
  pamiat: '#D6B98C',       // Пам'ять і реакція
  druzi: '#9FC1CF',        // З друзями
};
const CORAL = '#EE8466';
const IVORY = '#F1ECE1';
const BG = ['#0E1714', '#15221E'];
const COLUMNS = 16;

function utf8Bytes(str) {
  return Array.from(new TextEncoder().encode(str));
}

// 2. Зерно: FNV-1a 32 біт по байтах UTF-8 ключа
function fnv1a32(bytes) {
  let h = 0x811c9dc5;
  for (const b of bytes) {
    h ^= b;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

// 3. Генератор: mulberry32(h) -> r() у [0, 1)
function mulberry32(seed) {
  let a = seed | 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 1. Ключ
function fingerprintKey(name, genreId, color) {
  return name.normalize('NFC').trim().toLowerCase() + '|' + genreId + '|' + color.toLowerCase();
}

function fingerprint({ name, genreId, color }) {
  const genreColor = GENRE_COLORS[genreId];
  if (!genreColor) throw new Error('Невідомий жанр: ' + genreId);
  const key = fingerprintKey(name, genreId, color);
  const seed = fnv1a32(utf8Bytes(key));
  const r = mulberry32(seed);

  // 4. Палітра P = [колір гри, колір жанру, #EE8466, #F1ECE1]
  const P = [color.toUpperCase(), genreColor, CORAL, IVORY];
  const phase = r() * 2 * Math.PI;
  const bars = [];
  for (let i = 0; i < COLUMNS; i++) {
    const amp = Math.abs(Math.cos(0.55 * i + phase));
    const k = 0.55 + 0.45 * r();
    const top = Math.round(3 + 11 * amp * k);
    const bottom = Math.round(3 + 11 * amp * (1.5 - k));
    const c1 = P[Math.floor(r() * 4)];
    const c2 = P[Math.floor(r() * 4)];
    bars.push({ top, bottom, c1, c2 });
  }
  return { key, seed, phase, bars };
}

module.exports = { fingerprint, fingerprintKey, fnv1a32, mulberry32, GENRE_COLORS, COLUMNS, BG };
