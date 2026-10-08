/** Цифри-плитки крутяться як барабани одометра, коли блок заходить в екран. */
export function initOdometers(root: ParentNode, animate: boolean): void {
  const els = [...root.querySelectorAll<HTMLElement>('.tiles--odo')];
  if (!animate) return; // без руху видно кінцеві цифри (.odo-still)
  els.forEach((el) => {
    el.classList.add('odo-ready');
    el.querySelectorAll<HTMLElement>('.odo-strip').forEach((s) => {
      s.style.setProperty('--k', String(10 + Number(s.dataset['digit'] ?? '0')));
    });
  });
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('is-rolled');
        io.unobserve(e.target);
      }
    },
    { threshold: 0.6 },
  );
  els.forEach((el) => io.observe(el));
}
