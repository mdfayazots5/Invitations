/**
 * Whole-page reveal: when a `.page` is mostly on screen, all of its `[data-reveal]` items rise in
 * together with a short stagger (≤ ~0.9 s in total, see styles.css). A resting page is therefore
 * always fully composed, never half-faded. Items stay revealed afterwards.
 */
export const startReveal = (root: HTMLElement, reducedMotion: boolean) => {
  const pages = Array.from(root.querySelectorAll<HTMLElement>('.page'));
  pages.forEach((page) =>
    page.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el, i) => el.style.setProperty('--d', String(Math.min(i, 8)))),
  );
  const show = (page: Element) => page.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('in'));
  if (reducedMotion || !('IntersectionObserver' in window)) {
    pages.forEach(show);
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          show(e.target);
          io.unobserve(e.target);
        }
      }
    },
    {threshold: 0.55},
  );
  pages.forEach((p) => io.observe(p));
};
