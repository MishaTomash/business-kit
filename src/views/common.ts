/** Поведінка, спільна для всіх сторінок. Поки порожня: рух «ДНК» додається на етапах S3–S4. */

import type { Cleanup, MountContext } from './view';

export function mountCommon(_root: HTMLElement, _ctx: MountContext): Cleanup {
  return () => undefined;
}
