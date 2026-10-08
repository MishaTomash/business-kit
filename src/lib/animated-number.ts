/**
 * AnimatedNumber — retargetable count-up/count-down tween.
 *
 * Calling `set()` while a tween is running restarts the tween *from the value
 * currently on screen*, so dragging a slider produces one continuous, fluid
 * motion instead of jumpy restarts. Runs on rAF → locked to display refresh.
 */

import { easeOutExpo, prefersReducedMotion } from './motion';

export type NumberFormatter = (value: number) => string;

export class AnimatedNumber {
  private displayed: number;
  private from: number;
  private target: number;
  private startTime = 0;
  private frame = 0;

  constructor(
    private readonly el: HTMLElement,
    private readonly format: NumberFormatter,
    initial = 0,
    private readonly duration = 700,
  ) {
    this.displayed = initial;
    this.from = initial;
    this.target = initial;
    this.paint();
  }

  /** Animate towards `value`. */
  set(value: number): void {
    if (value === this.target) return;
    this.target = value;

    if (prefersReducedMotion()) {
      this.displayed = value;
      this.paint();
      return;
    }

    this.from = this.displayed;
    this.startTime = performance.now();
    if (!this.frame) this.frame = requestAnimationFrame(this.tick);
  }

  /** Current target value (not the in-flight displayed value). */
  get value(): number {
    return this.target;
  }

  private readonly tick = (now: number): void => {
    const progress = Math.min(1, (now - this.startTime) / this.duration);
    this.displayed = this.from + (this.target - this.from) * easeOutExpo(progress);
    this.paint();
    this.frame = progress < 1 ? requestAnimationFrame(this.tick) : 0;
  };

  private paint(): void {
    // textContent on a single text node: no layout thrash, no HTML parsing.
    this.el.textContent = this.format(this.displayed);
  }
}
