/**
 * Device pixel ratio for canvases (3D sky, gold dust, scratch bar).
 *
 * `?dpr=2.5` overrides it. The HD video recorder loads the site in a 432×768 frame scaled 2.5× to
 * 1080×1920: the page lays out exactly like a phone, text renders sharp at full size, and this
 * makes the canvases draw at full resolution too (otherwise they would be upscaled and blocky).
 */
const forced = Number(new URLSearchParams(location.search).get('dpr'));

export const isForcedDpr = forced > 0;
export const pixelRatio = (): number => (forced > 0 ? forced : window.devicePixelRatio || 1);
