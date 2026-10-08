/**
 * Contract every page implements.
 * A view is pure markup + an optional `mount` that wires behaviour and
 * returns a cleanup function (called before the next route renders).
 */

import type { SafeHtml } from '@/lib/dom';

export type Cleanup = () => void;

export interface View {
  /** Document title. */
  readonly title: string;
  readonly markup: SafeHtml;
  readonly mount?: (root: HTMLElement) => Cleanup | void;
}
