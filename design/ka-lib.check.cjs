// Запуск: node design/ka-lib.check.cjs  (має завершитися кодом 0 і написати "OK")
const assert = require('node:assert');
const { fingerprint } = require('./ka-lib.cjs');

const fp = fingerprint({ name: 'Слововир', genreId: 'slova', color: '#ee8466' });
assert.strictEqual(fp.key, 'слововир|slova|#ee8466');
assert.strictEqual(fp.seed, 1430196453);
const expected = [
  [10, 11, '#E9D8A6', '#F1ECE1'],
  [11, 12, '#EE8466', '#EE8466'],
  [10, 9, '#F1ECE1', '#F1ECE1'],
  [6, 6, '#EE8466', '#EE8466'],
];
expected.forEach(([top, bottom, c1, c2], i) => {
  const b = fp.bars[i];
  assert.deepStrictEqual([b.top, b.bottom, b.c1, b.c2], [top, bottom, c1, c2], 'перекладина ' + i);
});
// діапазони за правилом: 3..14 одиниць, 16 колонок, детермінізм
const again = fingerprint({ name: '  СЛОВОВИР ', genreId: 'slova', color: '#EE8466' });
assert.deepStrictEqual(again.bars, fp.bars, 'нормалізація імені й кольору');
for (const b of fp.bars) assert.ok(b.top >= 3 && b.top <= 14 && b.bottom >= 3 && b.bottom <= 14);
assert.strictEqual(fp.bars.length, 16);
console.log('OK: контрольний приклад зі спеки збігається');
