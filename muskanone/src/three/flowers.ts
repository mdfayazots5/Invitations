import {CircleGeometry, Color, type Curve, DoubleSide, InstancedMesh, MeshStandardMaterial, Object3D, type Vector3} from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/**
 * Flowers for garlands, the floral arch and the path edges: one InstancedMesh per call.
 * A blossom is a low-poly cup of 5 petal planes around a small centre, tilted outwards and slightly twisted
 * (reads as a rose from a distance). Colours mix white, blush and pink (instance colours).
 */
const petalGeo = (() => {
  const petals = [];
  for (let ring = 0; ring < 2; ring++)
    for (let i = 0; i < 5; i++) {
      // a rounded petal: a 7-sided disc, a little taller than wide
      const g = new CircleGeometry(0.12, 7).scale(1, 1.15, 1).translate(0, 0.13, 0);
      g.rotateX(-0.55 - ring * 0.5); // cup
      g.rotateY((i / 5) * Math.PI * 2 + ring * 0.6);
      g.scale(1 - ring * 0.35, 1 - ring * 0.2, 1 - ring * 0.35);
      g.deleteAttribute('uv');
      petals.push(g.toNonIndexed());
    }
  return mergeGeometries(petals)!;
})();

// a little self-light so white petals stay white in shade and at dusk
const material = new MeshStandardMaterial({color: '#FFFFFF', roughness: 0.7, side: DoubleSide, emissive: '#FFFFFF', emissiveIntensity: 0.22});
const COLORS = ['#FFFFFF', '#FFFFFF', '#F8DBD4', '#E8A0B0'].map((c) => new Color(c));

/** Deterministic jitter, so every load (and the video) looks the same. */
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

export const flowersAlong = (curve: Curve<Vector3>, count: number, size = 1, jitter = 0.15, palette = COLORS) => {
  const mesh = new InstancedMesh(petalGeo, material, count);
  const o = new Object3D();
  for (let i = 0; i < count; i++) {
    const p = curve.getPoint(count === 1 ? 0 : i / (count - 1));
    o.position.set(p.x + (rnd() - 0.5) * jitter, p.y + (rnd() - 0.5) * jitter, p.z + (rnd() - 0.5) * jitter);
    o.rotation.set((rnd() - 0.5) * 1.6, rnd() * 6.28, (rnd() - 0.5) * 1.6);
    o.scale.setScalar(size * (0.75 + rnd() * 0.5));
    o.updateMatrix();
    mesh.setMatrixAt(i, o.matrix);
    mesh.setColorAt(i, palette[Math.floor(rnd() * palette.length)]);
  }
  mesh.instanceMatrix.needsUpdate = true;
  return mesh;
};

/** Flowers scattered in a box (bushes, beds). */
export const flowerBed = (cx: number, cy: number, cz: number, w: number, h: number, d: number, count: number, size = 1, palette = COLORS) => {
  const mesh = new InstancedMesh(petalGeo, material, count);
  const o = new Object3D();
  for (let i = 0; i < count; i++) {
    o.position.set(cx + (rnd() - 0.5) * w, cy + rnd() * h, cz + (rnd() - 0.5) * d);
    o.rotation.set(-0.3 + (rnd() - 0.5) * 0.8, rnd() * 6.28, (rnd() - 0.5) * 0.8);
    o.scale.setScalar(size * (0.7 + rnd() * 0.6));
    o.updateMatrix();
    mesh.setMatrixAt(i, o.matrix);
    mesh.setColorAt(i, palette[Math.floor(rnd() * palette.length)]);
  }
  return mesh;
};
