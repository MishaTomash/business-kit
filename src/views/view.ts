/**
 * Контракт сторінки: розмітка (однакова для prerender і браузера), мета для прев'ю
 * посилань і необов'язковий `mount`, що вмикає поведінку й повертає прибирання.
 */

import type { SafeHtml } from '@/lib/dom';
import type { MotionLevel } from '@/lib/env';

export type Cleanup = () => void;

export interface MountContext {
  readonly motion: MotionLevel;
  /** Магнітні кнопки й hover-стани (миша). */
  readonly finePointer: boolean;
}

export interface PageMeta {
  /** <title> */
  readonly title: string;
  /** meta description і og:description */
  readonly description: string;
  /** og:title (за замовчуванням title) */
  readonly ogTitle?: string;
  /** Шлях до картинки прев'ю в /public, напр. '/og/slovovyr.png'. Prerender перевіряє, що файл є. */
  readonly ogImage?: string;
  /** Канонічний шлях сторінки, напр. '/games/slovovyr'. */
  readonly path: string;
  /** Не індексувати (404). */
  readonly noindex?: boolean;
}

export interface View {
  readonly key: string;
  /** Тон шапки: 'dark' — світлий текст над темним hero. */
  readonly navTone?: 'dark' | 'light';
  readonly meta: PageMeta;
  readonly markup: SafeHtml;
  readonly mount?: (root: HTMLElement, ctx: MountContext) => Cleanup | void;
}
