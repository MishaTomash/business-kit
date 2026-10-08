/**
 * Кінетичні заголовки: слова виїжджають з-під маски.
 * Ділимо лише за звичайними пробілами: слова з апострофом (з'їв), дефісом і нерозривним
 * пробілом лишаються цілими, переноси рядків не ламаються. Тире чіпляємо до попереднього
 * слова, щоб рядок не починався з «—».
 */

export function splitWords(el: HTMLElement): void {
  if (el.dataset['split'] === '1') return;
  const text = (el.textContent ?? '').replace(/\s+/g, ' ').trim().replace(/ ([—–]) /g, ' $1 ');
  const words = text.split(' ');
  const frag = document.createDocumentFragment();
  words.forEach((word, i) => {
    const mask = document.createElement('span');
    mask.className = 'w';
    mask.setAttribute('aria-hidden', 'true');
    const inner = document.createElement('span');
    inner.className = 'wi';
    inner.style.setProperty('--i', String(i));
    inner.textContent = word;
    mask.append(inner);
    frag.append(mask);
    if (i < words.length - 1) frag.append(' ');
  });
  el.setAttribute('aria-label', text.replace(/ /g, ' '));
  el.replaceChildren(frag);
  el.dataset['split'] = '1';
  el.classList.add('is-split');
}

/** Ділить усі [.kinetic] у root і показує їх, коли вони заходять в екран. */
export function initKinetic(root: ParentNode, animate: boolean): () => void {
  const els = [...root.querySelectorAll<HTMLElement>('.kinetic')];
  if (!animate) {
    els.forEach((el) => el.classList.add('is-static'));
    return () => undefined;
  }
  els.forEach(splitWords);
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    },
    { rootMargin: '0px 0px -10% 0px' },
  );
  els.forEach((el) => {
    if (el.dataset['kinetic'] === 'now') requestAnimationFrame(() => el.classList.add('is-in'));
    else io.observe(el);
  });
  return () => io.disconnect();
}
