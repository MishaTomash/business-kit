/**
 * Ціни ігор з платформи: підсумок «від» і розбір відповіді GET /api/public/games.
 * Запуск: `npm test`.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parsePublicGames, summarize } from '../src/lib/price-summary.ts';

const DEFAULTS = { launchUah: 1500, monthlyUah: 99 };

test('однакові ціни — без «від», різні — найменша з «від»', () => {
  const same = [DEFAULTS, DEFAULTS];
  assert.deepEqual(summarize(same, 'launch', DEFAULTS), { min: 1500, same: true });
  const mixed = [DEFAULTS, { launchUah: 1200, monthlyUah: 99 }];
  assert.deepEqual(summarize(mixed, 'launch', DEFAULTS), { min: 1200, same: false });
  assert.deepEqual(summarize(mixed, 'monthly', DEFAULTS), { min: 99, same: true });
  assert.deepEqual(summarize([], 'monthly', DEFAULTS), { min: 99, same: true });
});

test('відповідь api: лише коректні записи, некоректна відповідь — null', () => {
  const parsed = parsePublicGames({
    defaults: DEFAULTS,
    games: [
      { id: 'crossword', name: 'Слововир', status: 'available', launchUah: 2000, monthlyUah: 149, launchWasUah: 2500 },
      { id: 'BAD id', launchUah: 1, monthlyUah: 1 },
      { id: 'kulkopad', launchUah: 0, monthlyUah: 99 },
      { id: 'tikai', launchUah: 1500.5, monthlyUah: 99 },
      null,
    ],
  });
  assert.deepEqual([...(parsed ?? new Map()).entries()], [['crossword', { launchUah: 2000, monthlyUah: 149, launchWasUah: 2500 }]]);
  assert.equal(parsePublicGames(null), null);
  assert.equal(parsePublicGames({ games: 'x' }), null);
});
