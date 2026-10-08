/**
 * Невеликий конвертер Markdown → HTML для юридичних текстів (content/legal/*.md).
 * Підтримує лише те, що в них використано: заголовки (#, ##, ###), абзаци (рядки в абзаці
 * розділяються переносом), маркований і нумерований списки, таблиці, **жирний**, [посилання](url),
 * а також голі адреси https://… і email. Усе інше викликає помилку збірки з номером рядка,
 * щоб нова конструкція не зникла з сторінки мовчки. Увесь текст екранується.
 */

import { escapeHtml } from './dom';

export interface MarkdownResult {
  /** Текст першого заголовка першого рівня. */
  readonly title: string;
  /** «Редакція від 8 жовтня 2026 року» (рядок **Редакція від …**), якщо є. */
  readonly edition: string | null;
  /** HTML без заголовка першого рівня й рядка редакції. */
  readonly body: string;
}

export interface MarkdownOptions {
  /** Адреса сайту: посилання на неї стають внутрішніми (/privacy). */
  readonly siteUrl: string;
}

const MONTHS: Readonly<Record<string, string>> = {
  січня: '01', лютого: '02', березня: '03', квітня: '04', травня: '05', червня: '06',
  липня: '07', серпня: '08', вересня: '09', жовтня: '10', листопада: '11', грудня: '12',
};

/** «8 жовтня 2026 року» → «2026-10-08» для <time datetime>. */
export function editionIso(edition: string): string | null {
  const m = /(\d{1,2})\s+([а-яіїєґ]+)\s+(\d{4})/i.exec(edition);
  const month = m?.[2] ? MONTHS[m[2].toLowerCase()] : undefined;
  return m?.[1] && m[3] && month ? `${m[3]}-${month}-${m[1].padStart(2, '0')}` : null;
}

const BAD_LINE: readonly [RegExp, string][] = [
  [/^\s*>/, 'цитата (>)'],
  [/^\s*```|^\s*~~~/, 'блок коду'],
  [/!\[/, 'зображення'],
  [/^\s*[*+]\s/, 'список із * або + (використовуйте -)'],
  [/^\s+(?:[-*+]|\d+\.)\s/, 'вкладений список'],
  [/^#{4,}\s/, 'заголовок четвертого рівня'],
  [/^\s*<\/?[a-z]/i, 'HTML-розмітка'],
  [/^\s*(?:---|\*\*\*|___)\s*$/, 'горизонтальна лінія'],
];

export function markdownToHtml(src: string, opts: MarkdownOptions): MarkdownResult {
  const lines = src.replace(/\r\n?/g, '\n').split('\n');
  lines.forEach((line, i) => {
    for (const [re, what] of BAD_LINE) {
      // Рядок таблиці з --- у розділювачі не є горизонтальною лінією.
      if (re.test(line) && !line.trim().startsWith('|')) throw new Error(`Markdown: рядок ${i + 1}: ${what} не підтримується конвертером (src/lib/markdown.ts)`);
    }
  });

  const out: string[] = [];
  let title = '';
  let edition: string | null = null;
  let lastHeading = '';
  let i = 0;

  const siteUrl = opts.siteUrl.replace(/\/+$/, '');

  const link = (href: string, label: string): string => {
    const internal = href === siteUrl || href.startsWith(`${siteUrl}/`);
    const path = internal ? href.slice(siteUrl.length) || '/' : href;
    const external = /^https?:\/\//.test(path);
    return `<a href="${escapeHtml(path)}"${external ? ' target="_blank" rel="noopener"' : ''}>${label}</a>`;
  };

  /** Рядкові конструкції. Спершу екрануємо, потім підставляємо розмітку через заміну на мітки. */
  const inline = (text: string): string => {
    const stash: string[] = [];
    const put = (htmlPiece: string): string => `\u0000${stash.push(htmlPiece) - 1}\u0000`;
    let s = text;
    // [текст](адреса)
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, label: string, href: string) => put(link(href, escapeHtml(label))));
    // голі адреси й email
    s = s.replace(/https?:\/\/[^\s<>()[\]]*[^\s<>()[\].,;:!?]/g, (u) => put(link(u, escapeHtml(u))));
    s = s.replace(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g, (e) => put(`<a href="mailto:${escapeHtml(e)}">${escapeHtml(e)}</a>`));
    s = escapeHtml(s);
    s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // eslint-disable-next-line no-control-regex
    return s.replace(/\u0000(\d+)\u0000/g, (_m, n: string) => stash[Number(n)] ?? '');
  };

  const isBlank = (l: string | undefined): boolean => l === undefined || l.trim() === '';
  const isBlockStart = (l: string): boolean => /^#{1,3}\s/.test(l) || /^-\s/.test(l) || /^\d+\.\s/.test(l) || l.trim().startsWith('|');

  while (i < lines.length) {
    const line = lines[i] ?? '';
    if (isBlank(line)) {
      i++;
      continue;
    }

    const h = /^(#{1,3})\s+(.+?)\s*$/.exec(line);
    if (h?.[1] && h[2]) {
      const level = h[1].length;
      const text = h[2];
      if (level === 1) {
        if (!title) title = text;
        else throw new Error(`Markdown: рядок ${i + 1}: другий заголовок першого рівня`);
      } else {
        const num = /^(\d+)\./.exec(text);
        const id = num?.[1] ? ` id="p${num[1]}"` : '';
        out.push(`<h${level}${id}>${inline(text)}</h${level}>`);
        lastHeading = text.replace(/\*\*/g, '');
      }
      i++;
      continue;
    }

    if (line.trim().startsWith('|')) {
      const rows: string[][] = [];
      while (i < lines.length && (lines[i] ?? '').trim().startsWith('|')) {
        const raw = (lines[i] ?? '').trim().replace(/^\||\|$/g, '');
        rows.push(raw.split('|').map((c) => c.trim()));
        i++;
      }
      const sep = rows[1];
      if (rows.length < 2 || !sep || !sep.every((c) => /^:?-{3,}:?$/.test(c))) throw new Error(`Markdown: таблиця перед рядком ${i + 1} без рядка-розділювача (| --- |)`);
      const head = rows[0] ?? [];
      const cols = head.length;
      const body = rows.slice(2);
      if (body.some((r) => r.length !== cols)) throw new Error(`Markdown: таблиця перед рядком ${i + 1}: різна кількість колонок`);
      const label = lastHeading ? `Таблиця: ${lastHeading}` : 'Таблиця';
      out.push(
        `<div class="legal__table" role="region" aria-label="${escapeHtml(label)}" tabindex="0"><table><thead><tr>${head.map((c) => `<th scope="col">${inline(c)}</th>`).join('')}</tr></thead><tbody>${body
          .map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`)
          .join('')}</tbody></table></div>`,
      );
      continue;
    }

    const list = /^-\s/.test(line) ? 'ul' : /^\d+\.\s/.test(line) ? 'ol' : null;
    if (list) {
      const re = list === 'ul' ? /^-\s+(.*)$/ : /^\d+\.\s+(.*)$/;
      const items: string[] = [];
      while (i < lines.length && re.test(lines[i] ?? '')) {
        items.push(`<li>${inline(re.exec(lines[i] ?? '')?.[1] ?? '')}</li>`);
        i++;
      }
      out.push(`<${list}>${items.join('')}</${list}>`);
      continue;
    }

    // абзац: суцільні рядки, перенос рядка = <br>
    const para: string[] = [];
    while (i < lines.length && !isBlank(lines[i]) && (para.length === 0 || !isBlockStart(lines[i] ?? ''))) {
      para.push((lines[i] ?? '').trim());
      i++;
    }
    const ed = /^\*\*(Редакція від .+?)\*\*$/.exec(para.join(' '));
    if (ed?.[1] && edition === null && out.length === 0) edition = ed[1];
    else out.push(`<p>${para.map(inline).join('<br>')}</p>`);
  }

  if (!title) throw new Error('Markdown: немає заголовка першого рівня (# …)');
  return { title, edition, body: out.join('\n') };
}
