import {C} from './invite.config';

const LEFT_LEAF = 'M40,620 L40,200 A160,160 0 0 1 200,40 L200,620 Z';
const RIGHT_LEAF = 'M200,620 L200,40 A160,160 0 0 1 360,200 L360,620 Z';

const rosette = (cx: number, cy: number) => {
  const petals = Array.from({length: 12}, (_, i) => {
    const a = (i * 30 * Math.PI) / 180;
    const x = cx + Math.cos(a) * 20;
    const y = cy + Math.sin(a) * 20;
    return `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="9" ry="4" transform="rotate(${i * 30} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
  }).join('');
  return `<g fill="none" stroke="url(#doorGold)" stroke-width="1.3">
      <circle cx="${cx}" cy="${cy}" r="36"/><circle cx="${cx}" cy="${cy}" r="31" stroke-dasharray="2 3"/>
      ${petals}<circle cx="${cx}" cy="${cy}" r="7" fill="#C9A24A"/></g>`;
};

/** One door leaf: dark panel, jali lattice, rosette medallion and a glowing knob near the seam. */
const leaf = (side: 'left' | 'right') => {
  const isLeft = side === 'left';
  const path = isLeft ? LEFT_LEAF : RIGHT_LEAF;
  const panelX = isLeft ? 58 : 214;
  const rosetteX = isLeft ? 123 : 277;
  const knobX = isLeft ? 188 : 212;
  return `<svg class="leaf leaf-${side}" viewBox="0 0 400 640" aria-hidden="true">
    <defs><clipPath id="clip-${side}"><path d="${path}"/></clipPath></defs>
    <path d="${path}" fill="url(#leafFill)" stroke="url(#doorGold)" stroke-width="2.5"/>
    <g clip-path="url(#clip-${side})">
      <rect x="${panelX}" y="250" width="128" height="345" fill="url(#jali)" stroke="url(#doorGold)" stroke-width="1.4"/>
      <rect x="${panelX + 6}" y="256" width="116" height="333" fill="none" stroke="#C9A24A" stroke-opacity=".5" stroke-width=".8"/>
      ${rosette(rosetteX, 165)}
    </g>
    <circle cx="${knobX}" cy="410" r="16" fill="url(#knobGlow)"/>
    <circle cx="${knobX}" cy="410" r="6.5" fill="#F6E3A6" stroke="#9C7431" stroke-width="1.5"/>
  </svg>`;
};

const bulbs = () =>
  Array.from({length: 12}, (_, i) => {
    const t = Math.PI - (i * Math.PI) / 11;
    const x = 200 + Math.cos(t) * 196;
    const y = 200 - Math.sin(t) * 196;
    return `<circle class="bulb" style="--b:${i}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.2"/>`;
  }).join('');

const frameSvg = () => `<svg class="doors-frame" viewBox="0 0 400 640" aria-hidden="true">
  <defs>
    <linearGradient id="doorGold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#8C6A2B"/><stop offset=".28" stop-color="#E9CF8A"/>
      <stop offset=".5" stop-color="#C79A45"/><stop offset=".7" stop-color="#F6E3A6"/><stop offset="1" stop-color="#9C7431"/>
    </linearGradient>
    <linearGradient id="leafFill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#5A1E31"/><stop offset="1" stop-color="#2A0D16"/>
    </linearGradient>
    <radialGradient id="knobGlow"><stop offset="0" stop-color="#FFE7A3" stop-opacity=".9"/><stop offset="1" stop-color="#FFE7A3" stop-opacity="0"/></radialGradient>
    <pattern id="jali" width="16" height="16" patternUnits="userSpaceOnUse">
      <path d="M8,0 L16,8 L8,16 L0,8 Z" fill="none" stroke="#C9A24A" stroke-width=".7" stroke-opacity=".8"/>
      <circle cx="8" cy="8" r="2.2" fill="none" stroke="#E9CF8A" stroke-width=".6"/>
      <circle cx="0" cy="0" r="1" fill="#C9A24A"/><circle cx="16" cy="16" r="1" fill="#C9A24A"/>
    </pattern>
  </defs>
  <path d="M14,636 L14,200 A186,186 0 0 1 386,200 L386,636" fill="none" stroke="url(#doorGold)" stroke-width="3"/>
  <path d="M26,636 L26,204 A174,174 0 0 1 374,204 L374,636" fill="none" stroke="url(#doorGold)" stroke-width="1.3"/>
  <line x1="0" y1="632" x2="400" y2="632" stroke="url(#doorGold)" stroke-width="1.5"/>
  ${bulbs()}
</svg>`;

/**
 * Screen A. Resolves once the walk-through finishes and the overlay is gone.
 * `onOpen` fires on the tap (used to start the music inside the user gesture).
 */
export const mountDoors = (root: HTMLElement, onOpen: () => void, reducedMotion: boolean): Promise<void> =>
  new Promise((resolve) => {
    root.innerHTML = `<div class="doors" role="button" tabindex="0" aria-label="${C.ui.doorsLabel}">
      <div class="doors-stage">
        <div class="doors-halo"></div>
        ${frameSvg()}
        <div class="doors-light"></div>
        ${leaf('left')}${leaf('right')}
      </div>
      <p class="caps tap-hint">✦ ${C.ui.tapToEnter} ✦</p>
    </div>`;
    const doors = root.querySelector<HTMLElement>('.doors')!;
    doors.focus({preventScroll: true});
    let opened = false;

    const finish = () => {
      document.body.classList.remove('locked');
      root.remove();
      resolve();
    };

    const open = () => {
      if (opened) return;
      opened = true;
      onOpen();
      if (reducedMotion) {
        document.body.classList.add('entered');
        finish();
        return;
      }
      doors.classList.add('open');
      // 1.2 s opening + 0.4 s pause, then walk through while the page fades in.
      window.setTimeout(() => {
        doors.classList.add('walk');
        document.body.classList.add('entered');
        window.setTimeout(finish, 900);
      }, 1600);
    };

    doors.addEventListener('click', open);
    doors.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open();
      }
    });
  });
