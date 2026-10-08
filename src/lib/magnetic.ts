/** Магнітні кнопки: лише для миші. На дотик працює стан натискання з CSS. */
export function initMagnetic(root: ParentNode, enabled: boolean): void {
  if (!enabled) return;
  root.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    if (el.dataset['magneticReady'] === '1') return;
    el.dataset['magneticReady'] = '1';
    const strength = el.classList.contains('key--sm') ? 5 : 10;
    el.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      el.classList.add('is-pulled');
      el.style.transform = `translate3d(${(dx * strength).toFixed(1)}px, ${(dy * strength * 0.6).toFixed(1)}px, 0)`;
    });
    el.addEventListener('pointerleave', () => {
      el.classList.remove('is-pulled');
      el.style.transform = '';
    });
  });
}
