/**
 * Маленька робоча демо-гра на сторінці гри: кілька слів із питаннями.
 * Кнопка підказки показує, за що в справжній грі платять зірками.
 */

import type { DemoWord } from '@/types';
import { html, type SafeHtml } from '@/lib/dom';
import { starText } from '@/lib/tiles';

const norm = (s: string): string => s.toUpperCase().replace(/[’ʼ`]/g, "'").replace(/[^A-ZА-ЯҐЄІЇ']/g, '');

export function demoMarkup(words: readonly DemoWord[]): SafeHtml {
  return html`
    <div class="demo" data-demo>
      <p class="demo__score" aria-live="polite"><span data-score>0</span> з ${words.length} відгадано</p>
      <ol class="demo__list">
        ${words.map(
          (w, i) => html`
            <li class="demo__row" data-answer="${w.answer}">
              <label class="demo__clue" for="demo-${i}">${w.clue}</label>
              <div class="demo__tiles" aria-hidden="true">${[...w.answer].map(() => html`<span class="dtile"></span>`)}</div>
              <div class="demo__input">
                <input id="demo-${i}" type="text" maxlength="${w.answer.length}" autocomplete="off" spellcheck="false" autocapitalize="characters" aria-describedby="demo-hint" />
                <button type="button" class="demo__hint" data-hint>Підказка</button>
              </div>
              <p class="demo__ok" data-ok hidden>Відгадано</p>
            </li>
          `,
        )}
      </ol>
      <p class="demo__note" id="demo-hint">${starText('Тут підказка безкоштовна. У справжній грі вона коштує 1 ★, і ця зірка йде на баланс вашого бота.')}</p>
    </div>
  `;
}

export function mountDemo(root: ParentNode): void {
  const box = root.querySelector<HTMLElement>('[data-demo]');
  if (!box) return;
  const score = box.querySelector<HTMLElement>('[data-score]');
  const rows = [...box.querySelectorAll<HTMLElement>('.demo__row')];

  const recount = (): void => {
    if (score) score.textContent = String(rows.filter((r) => r.classList.contains('solved')).length);
  };

  rows.forEach((row) => {
    const answer = row.dataset['answer'] ?? '';
    const input = row.querySelector<HTMLInputElement>('input');
    const hint = row.querySelector<HTMLButtonElement>('[data-hint]');
    const ok = row.querySelector<HTMLElement>('[data-ok]');
    const cells = [...row.querySelectorAll<HTMLElement>('.dtile')];
    if (!input || !hint || !ok) return;

    const paint = (): void => {
      const v = norm(input.value).slice(0, answer.length);
      if (v !== input.value) input.value = v;
      cells.forEach((c, i) => {
        const ch = v[i] ?? '';
        if (c.textContent !== ch) {
          c.textContent = ch;
          c.classList.toggle('filled', ch !== '');
        }
      });
      const solved = v === answer;
      row.classList.toggle('solved', solved);
      ok.hidden = !solved;
      input.setAttribute('aria-invalid', String(v.length === answer.length && !solved));
      if (solved) {
        input.readOnly = true;
        hint.disabled = true;
      }
      recount();
    };

    input.addEventListener('input', paint);
    hint.addEventListener('click', () => {
      const v = norm(input.value);
      let k = 0;
      while (k < answer.length && v[k] === answer[k]) k++;
      input.value = answer.slice(0, k + 1);
      paint();
      input.focus();
    });
  });
}
