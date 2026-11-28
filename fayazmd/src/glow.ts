/**
 * Pre-rendered soft glow dots. Drawing these with drawImage is far cheaper than
 * canvas shadowBlur, which drops low-end phones (and headless recording) to ~1 fps.
 */
const cache = new Map<string, HTMLCanvasElement>();

export const glowSprite = (color: string): HTMLCanvasElement => {
  let c = cache.get(color);
  if (c) return c;
  c = document.createElement('canvas');
  c.width = c.height = 32;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(16, 16, 0, 16, 16, 16);
  grad.addColorStop(0, '#FFFFFF');
  grad.addColorStop(0.18, color);
  grad.addColorStop(0.45, `${color}66`);
  grad.addColorStop(1, `${color}00`);
  g.fillStyle = grad;
  g.fillRect(0, 0, 32, 32);
  cache.set(color, c);
  return c;
};
