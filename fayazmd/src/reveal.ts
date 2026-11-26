/** Fade-and-rise reveal on scroll (threshold .2, once, 90 ms stagger within a section). */
export const startReveal = (root: HTMLElement, reducedMotion: boolean) => {
  root.querySelectorAll('section, footer').forEach((section) => {
    section.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el, i) => el.style.setProperty('--d', String(i % 8)));
  });
  const items = root.querySelectorAll<HTMLElement>('[data-reveal]');
  if (reducedMotion || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      }
    },
    {threshold: 0.2},
  );
  items.forEach((el) => io.observe(el));
};
