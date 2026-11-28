/**
 * Scroll reveal: each `[data-reveal]` item rises in when it enters the screen, with a short stagger
 * among items that arrive together. Items stay revealed afterwards.
 */
export const startReveal = (root: HTMLElement, reducedMotion: boolean) => {
  const items = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'));
  if (reducedMotion || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      let k = 0;
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const el = e.target as HTMLElement;
        el.style.setProperty('--d', String(Math.min(k++, 12)));
        el.classList.add('in');
        io.unobserve(el);
      }
    },
    {rootMargin: '0px 0px -8% 0px', threshold: 0.01},
  );
  items.forEach((el) => io.observe(el));
};
