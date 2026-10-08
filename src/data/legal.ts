/**
 * Юридичні тексти: content/legal/*.md. Це звичайний Markdown, який збірка перетворює на HTML
 * (src/lib/markdown.ts). У тексті можна використовувати мітки:
 *   {{BRAND}}    — назва бренду (Клітинка), {{BRAND_OF}} — її родовий відмінок (Клітинки)
 *   {{SITE_URL}} — адреса сайту з VITE_SITE_URL
 * Усе, що ще потребує підтвердження власника, позначайте словом ПІДТВЕРДИТИ:
 * збірка виведе попередження зі списком таких місць (vite.config.ts).
 */

import offerSrc from '../../content/legal/offer.md?raw';
import privacySrc from '../../content/legal/privacy.md?raw';
import { BRAND, BRAND_OF, SITE_URL } from './site';
import { markdownToHtml, editionIso, type MarkdownResult } from '@/lib/markdown';

export type LegalId = 'offer' | 'privacy';

export interface LegalDoc extends MarkdownResult {
  readonly id: LegalId;
  /** Назва в підвалі й у <title>. */
  readonly label: string;
  readonly description: string;
  readonly editionIso: string | null;
}

const SOURCES: Readonly<Record<LegalId, { src: string; label: string; description: string }>> = {
  offer: {
    src: offerSrc,
    label: 'Публічна оферта',
    description: `Умови, на яких ${BRAND} запускає ігри в Telegram: ціни, порядок замовлення, підписка, повернення коштів.`,
  },
  privacy: {
    src: privacySrc,
    label: 'Політика конфіденційності',
    description: `Які дані збирає ${BRAND}, навіщо й скільки їх зберігає.`,
  },
};

export const LEGAL_IDS = Object.keys(SOURCES) as LegalId[];

const cache = new Map<LegalId, LegalDoc>();

export function getLegal(id: LegalId): LegalDoc {
  const hit = cache.get(id);
  if (hit) return hit;
  const s = SOURCES[id];
  const text = s.src.replaceAll('{{BRAND}}', BRAND).replaceAll('{{BRAND_OF}}', BRAND_OF).replaceAll('{{SITE_URL}}', SITE_URL);
  const doc = markdownToHtml(text, { siteUrl: SITE_URL });
  const full: LegalDoc = { ...doc, id, label: s.label, description: s.description, editionIso: doc.edition ? editionIso(doc.edition) : null };
  cache.set(id, full);
  if (import.meta.env.DEV && typeof window !== 'undefined' && /ПІДТВЕРДИТИ/.test(s.src)) {
    console.warn(`[юридичні тексти] У content/legal/${id}.md лишились місця з ПІДТВЕРДИТИ`);
  }
  return full;
}
