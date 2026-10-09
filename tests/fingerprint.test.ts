/**
 * Тести генетичного відбитка. Запуск: `npm test` (вбудований тест-ранер Node, без залежностей).
 *
 * 1. Контрольний приклад зі спеки (DESIGN-SPEC, розділ 5).
 * 2. Збіг з еталоном design/ka-lib.cjs на 50 довільних наборах (детермінований генератор наборів).
 * 3. Правило 3 : 1 для темного кольору гри.
 * 4. Кольори жанрів у коді збігаються з токенами CSS.
 * 5. Відбитки всіх ігор каталогу далеко від межі округлення x,5 (тоді Math.cos у будь-якому рушії
 *    дає ті самі висоти), різні між собою, а SVG однаковий при повторному виклику.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import {
  COLUMNS,
  GENRE_COLORS,
  GENRE_IDS,
  fingerprint,
  fingerprintBars,
  fingerprintKey,
  fnv1a32,
  renderFingerprintSvg,
  type GenreId,
} from '../src/lib/fingerprint.ts';

interface RefBar {
  top: number;
  bottom: number;
  c1: string;
  c2: string;
}
interface RefLib {
  fingerprint(input: { name: string; genreId: string; color: string }): { key: string; seed: number; phase: number; bars: RefBar[] };
}

const require = createRequire(import.meta.url);
const ref = require('../design/ka-lib.cjs') as RefLib;

/* ---------------------------------------------------------------- 1. контрольний приклад */
test('контрольний приклад: слововир|slova|#ee8466', () => {
  const fp = fingerprint({ name: 'Слововир', genre: 'slova', color: '#ee8466' });
  assert.equal(fp.key, 'слововир|slova|#ee8466');
  assert.equal(fp.seed, 1430196453);
  const expected = [
    [10, 11, '#E9D8A6', '#F1ECE1'],
    [11, 12, '#EE8466', '#EE8466'],
    [10, 9, '#F1ECE1', '#F1ECE1'],
    [6, 6, '#EE8466', '#EE8466'],
  ];
  expected.forEach((row, i) => {
    const b = fp.bars[i];
    assert.ok(b);
    assert.deepEqual([b.top, b.bottom, b.c1, b.c2], row, `перекладина ${i}`);
  });
  assert.equal(fp.bars.length, COLUMNS);
  for (const b of fp.bars) assert.ok(b.top >= 3 && b.top <= 14 && b.bottom >= 3 && b.bottom <= 14);
});

test('нормалізація: пробіли, регістр назви й кольору, NFC', () => {
  const a = fingerprint({ name: 'Слововир', genre: 'slova', color: '#ee8466' });
  const b = fingerprint({ name: '  СЛОВОВИР ', genre: 'slova', color: '#EE8466' });
  assert.deepEqual(b.bars, a.bars);
  // «ї» як одна кодова точка й як «і» + знак U+0308 дають той самий ключ
  const composed = fingerprintKey({ name: 'Їжак', genre: 'pamiat', color: '#ffffff' });
  const decomposed = fingerprintKey({ name: 'Їжак', genre: 'pamiat', color: '#ffffff' });
  assert.equal(composed, decomposed);
});

/* ---------------------------------------------------------------- 2. порівняння з еталоном */
/** Детермінований генератор тестових наборів (щоб тест не був «плаваючим»). */
function lcg(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const LETTERS = 'абвгґдеєжзиіїйклмнопрстуфхцчшщьюяАБВГҐДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЮЯ’ -abcdefxyz0123456789';

function randomInputs(count: number): { name: string; genre: GenreId; color: string }[] {
  const rnd = lcg(20261009);
  const pick = <T>(xs: readonly T[]): T => xs[Math.floor(rnd() * xs.length)] as T;
  const list = [];
  for (let i = 0; i < count; i++) {
    const len = 1 + Math.floor(rnd() * 18);
    let name = '';
    for (let j = 0; j < len; j++) name += pick([...LETTERS]);
    const hex = Math.floor(rnd() * 0x1000000).toString(16).padStart(6, '0');
    list.push({ name: name.trim() === '' ? 'гра' : name, genre: pick(GENRE_IDS), color: `#${rnd() < 0.5 ? hex : hex.toUpperCase()}` });
  }
  return list;
}

test('збіг з design/ka-lib.cjs на 50 довільних наборах', () => {
  const inputs = randomInputs(50);
  assert.equal(inputs.length, 50);
  for (const input of inputs) {
    const expected = ref.fingerprint({ name: input.name, genreId: input.genre, color: input.color });
    const key = fingerprintKey(input);
    assert.equal(key, expected.key, `ключ для ${JSON.stringify(input)}`);
    const seed = fnv1a32(key);
    assert.equal(seed, expected.seed, `зерно для ${key}`);
    // Сирі висоти й індекси палітри — без правила 3 : 1, якого в еталоні немає
    const raw = fingerprintBars(seed);
    assert.equal(raw.phase, expected.phase, `фаза для ${key}`);
    const refPalette = [input.color.toUpperCase(), GENRE_COLORS[input.genre], '#EE8466', '#F1ECE1'];
    raw.bars.forEach((b, i) => {
      const e = expected.bars[i];
      assert.ok(e);
      assert.deepEqual([b.top, b.bottom, refPalette[b.i1], refPalette[b.i2]], [e.top, e.bottom, e.c1, e.c2], `${key}, перекладина ${i}`);
    });
    // Повна модель збігається з еталоном цифра в цифру, коли колір гри читабельний
    const fp = fingerprint(input);
    if (!fp.colorReplaced) {
      assert.deepEqual(
        fp.bars.map((b) => [b.top, b.bottom, b.c1, b.c2]),
        expected.bars.map((b) => [b.top, b.bottom, b.c1, b.c2]),
        `модель для ${key}`,
      );
    }
  }
});

/* ---------------------------------------------------------------- 3. правило 3 : 1 */
test('темний колір гри в палітрі замінюється кольором жанру, ключ не змінюється', () => {
  const dark = fingerprint({ name: 'Темна гра', genre: 'druzi', color: '#1a2a3a' });
  assert.equal(dark.colorReplaced, true);
  assert.equal(dark.palette[0], GENRE_COLORS.druzi);
  assert.equal(dark.key, 'темна гра|druzi|#1a2a3a');
  for (const b of dark.bars) {
    assert.notEqual(b.c1, '#1A2A3A');
    assert.notEqual(b.c2, '#1A2A3A');
  }
  const light = fingerprint({ name: 'Світла гра', genre: 'druzi', color: '#b7cba0' });
  assert.equal(light.colorReplaced, false);
  assert.equal(light.palette[0], '#B7CBA0');
});

test('невідомий жанр і неправильний колір дають зрозумілу помилку', () => {
  assert.throws(() => fingerprint({ name: 'X', genre: 'sport' as GenreId, color: '#ffffff' }), /Невідомий жанр/);
  assert.throws(() => fingerprint({ name: 'X', genre: 'slova', color: 'red' }), /#rrggbb/);
});

/* ---------------------------------------------------------------- 4. токени */
test('кольори жанрів збігаються з src/styles/tokens.css', () => {
  const css = readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8');
  for (const id of GENRE_IDS) {
    const m = new RegExp(`--genre-${id}:\\s*(#[0-9a-f]{6})`, 'i').exec(css);
    assert.ok(m?.[1], `немає --genre-${id} у tokens.css`);
    assert.equal(m[1].toUpperCase(), GENRE_COLORS[id], `--genre-${id}`);
  }
});

/* ---------------------------------------------------------------- 5. ігри каталогу й SVG */
/** Ігри каталогу читаємо з games.ts текстом: модуль даних тягне аліаси Vite, яких Node не знає. */
function catalogGames(): { id: string; name: string; genre: GenreId; color: string }[] {
  const src = readFileSync(new URL('../src/data/games.ts', import.meta.url), 'utf8');
  const re = /id: '([a-z0-9-]+)',[\s\S]*?name: '([^']+)',[\s\S]*?dna: \{ genre: '([a-z]+)', color: '(#[0-9a-fA-F]{6})' \}/g;
  return [...src.matchAll(re)].map((m) => ({ id: m[1] ?? '', name: m[2] ?? '', genre: m[3] as GenreId, color: m[4] ?? '' }));
}

test('ігри каталогу: відбитки різні й далеко від межі округлення x,5', () => {
  const games = catalogGames();
  assert.ok(games.length >= 1, 'не знайдено жодної гри з dna у games.ts');
  const seen = new Set<string>();
  for (const g of games) {
    const fp = fingerprint(g);
    const sig = fp.bars.map((b) => `${b.top}.${b.bottom}.${b.i1}.${b.i2}`).join(',');
    assert.ok(!seen.has(sig), `відбиток ${g.id} повторює інший`);
    seen.add(sig);
    for (const b of fingerprintBars(fp.seed).bars) {
      for (const v of [b.rawTop, b.rawBottom]) {
        const dist = Math.abs((v % 1) - 0.5);
        assert.ok(dist > 1e-9, `${g.id}: висота ${v} на межі округлення, змініть колір гри`);
      }
    }
  }
});

test('SVG детермінований: 32 смуги, ті самі дані — той самий рядок', () => {
  const input = { name: 'Слововир', genre: 'slova', color: '#ee8466' } as const;
  const a = renderFingerprintSvg(fingerprint(input), input.genre);
  const b = renderFingerprintSvg(fingerprint(input), input.genre);
  assert.equal(a, b);
  assert.equal((a.match(/<rect /g) ?? []).length, COLUMNS * 2);
  assert.match(a, /^<svg class="fp fp--slova" viewBox="0 0 16 30"/);
  assert.match(a, /aria-hidden="true"/);
  const withBg = renderFingerprintSvg(fingerprint(input), input.genre, { background: '#0E1714' });
  assert.equal((withBg.match(/<rect /g) ?? []).length, COLUMNS * 2 + 1);
});
