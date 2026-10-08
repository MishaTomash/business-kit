/**
 * Tiny, dependency-free DOM toolkit.
 *
 * `html` is a tagged template that HTML-escapes every interpolated value
 * unless it is already a `SafeHtml` fragment. This gives us JSX-like
 * composition with zero runtime cost and built-in XSS safety.
 *
 *   const card = html`<h3>${product.name}</h3>${chips}`;
 *   render(el, card);
 */

const SAFE = Symbol('SafeHtml');

/** A string that is known to be safe markup (produced by `html` or `raw`). */
export interface SafeHtml {
  readonly [SAFE]: true;
  readonly value: string;
}

/** Anything that may appear inside an `html` template. `false`/`null` render nothing. */
export type HtmlValue = SafeHtml | string | number | false | null | undefined | readonly HtmlValue[];

const ESCAPES: Readonly<Record<string, string>> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHtml(input: string): string {
  return input.replace(/[&<>"']/g, (ch) => ESCAPES[ch] ?? ch);
}

function isSafe(value: unknown): value is SafeHtml {
  return typeof value === 'object' && value !== null && SAFE in value;
}

function serialize(value: HtmlValue): string {
  if (value === false || value === null || value === undefined) return '';
  if (isSafe(value)) return value.value;
  if (Array.isArray(value)) return value.map((v: HtmlValue) => serialize(v)).join('');
  return escapeHtml(String(value));
}

/** Mark a trusted string (e.g. an inline SVG constant) as safe markup. */
export function raw(markup: string): SafeHtml {
  return { [SAFE]: true, value: markup };
}

/** Escaping template tag. See module docs. */
export function html(strings: TemplateStringsArray, ...values: readonly HtmlValue[]): SafeHtml {
  let out = strings[0] ?? '';
  for (let i = 0; i < values.length; i++) {
    out += serialize(values[i]) + (strings[i + 1] ?? '');
  }
  return raw(out);
}

/** Replace an element's children with a SafeHtml fragment. */
export function render(target: Element, content: SafeHtml): void {
  target.innerHTML = content.value;
}

/**
 * Typed `querySelector` that throws on a missing node.
 * A missing mount point is a programming error and should fail loudly in dev.
 */
export function qs<T extends Element = HTMLElement>(selector: string, root: ParentNode = document): T {
  const el = root.querySelector<T>(selector);
  if (!el) throw new Error(`[dom] Required element not found: ${selector}`);
  return el;
}

/** Typed `querySelectorAll` returning a real array. */
export function qsa<T extends Element = HTMLElement>(selector: string, root: ParentNode = document): T[] {
  return Array.from(root.querySelectorAll<T>(selector));
}
