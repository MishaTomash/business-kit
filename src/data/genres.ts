/**
 * Жанри каталогу за дизайном «ДНК» (DESIGN-SPEC, розділ 5). Кожна гра належить одному з них
 * через поле `dna.genre` у games.ts. Колір жанру — у src/lib/fingerprint.ts і tokens.css.
 */

import type { GenreId } from '@/lib/fingerprint';

export const GENRE_LABELS: Readonly<Record<GenreId, string>> = {
  slova: 'Слова',
  viktoryny: 'Вікторини',
  holovolomky: 'Головоломки',
  pamiat: 'Пам’ять і реакція',
  druzi: 'З друзями',
};
