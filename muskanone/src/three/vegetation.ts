import {
  Color,
  DoubleSide,
  Group,
  InstancedMesh,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
  Sprite,
  SpriteMaterial,
  type Vector3,
} from 'three';
import {cloudTexture, leafTexture} from './textures';

const rng = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

/** Shared wind clock for every swaying material (set once per frame by the world). */
export const wind = {value: 0};

/** Adds a gentle wind sway to a standard material: tips move most (uv.y = 0 at the root, 1 at the tip). */
const withWind = (mat: MeshStandardMaterial, strength: number) => {
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uWind = wind;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uWind;')
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        #ifdef USE_INSTANCING
          vec2 base = vec2(instanceMatrix[3].x, instanceMatrix[3].z);
        #else
          vec2 base = vec2(0.0);
        #endif
        float tip = uv.y * uv.y;
        transformed.x += sin(uWind * 1.7 + base.x * 0.35 + base.y * 0.21) * ${strength.toFixed(3)} * tip;
        transformed.z += cos(uWind * 1.3 + base.y * 0.3) * ${(strength * 0.5).toFixed(3)} * tip;`,
      );
  };
  return mat;
};

// ───────────────────────── grass blades ─────────────────────────

const bladeGeo = (() => {
  const g = new PlaneGeometry(0.05, 0.3, 1, 3).translate(0, 0.15, 0);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const t = p.getY(i) / 0.3;
    p.setX(i, p.getX(i) * (1 - t * 0.92)); // taper to a point
    p.setZ(i, t * t * 0.08); // slight curl
  }
  g.computeVertexNormals();
  return g;
})();
const bladeMat = withWind(new MeshStandardMaterial({color: '#FFFFFF', roughness: 0.85, side: DoubleSide}), 0.09);
const GRASS = ['#7FA66A', '#8FB574', '#6E9660', '#86AC6C', '#99B877'].map((c) => new Color(c));

/** Blades scattered over rectangles [cx, cz, w, d] (ground level 0), deterministic, one draw call. */
export const grassField = (rects: [number, number, number, number][], count: number, seed = 5) => {
  const r = rng(seed);
  const mesh = new InstancedMesh(bladeGeo, bladeMat, count);
  const o = new Object3D();
  const area = rects.reduce((s, q) => s + q[2] * q[3], 0);
  let i = 0;
  for (const [cx, cz, w, d] of rects) {
    const n = Math.round((count * w * d) / area);
    for (let k = 0; k < n && i < count; k++, i++) {
      o.position.set(cx + (r() - 0.5) * w, 0, cz + (r() - 0.5) * d);
      o.rotation.set((r() - 0.5) * 0.3, r() * Math.PI, (r() - 0.5) * 0.3);
      o.scale.set(1, 0.6 + r() * 0.7, 1);
      o.updateMatrix();
      mesh.setMatrixAt(i, o.matrix);
      mesh.setColorAt(i, GRASS[Math.floor(r() * GRASS.length)]);
    }
  }
  mesh.count = i;
  mesh.receiveShadow = true;
  return mesh;
};

// ───────────────────────── bushes & hedges (leaf cards) ─────────────────────────

const leafGeo = new PlaneGeometry(0.42, 0.42).translate(0, 0.21, 0);
const leafMat = withWind(
  new MeshStandardMaterial({map: leafTexture, alphaTest: 0.5, side: DoubleSide, roughness: 0.8, color: '#FFFFFF'}),
  0.025,
);
const LEAF = ['#FFFFFF', '#E7F0D8', '#CFE0C0', '#F2F5E4'].map((c) => new Color(c));

/** Rounded bushes: each [x, y, z, radius]; leaf cards on an ellipsoid shell, facing outwards. One draw call. */
export const bushes = (list: [number, number, number, number][], leavesEach = 70, seed = 11) => {
  const r = rng(seed);
  const mesh = new InstancedMesh(leafGeo, leafMat, list.length * leavesEach);
  const o = new Object3D();
  let i = 0;
  for (const [x, y, z, rad] of list)
    for (let k = 0; k < leavesEach; k++, i++) {
      const th = r() * Math.PI * 2;
      const ph = Math.acos(1 - r() * 1.6); // upper part of the sphere, a little below the middle
      const rr = rad * (0.75 + r() * 0.3);
      o.position.set(x + Math.sin(ph) * Math.cos(th) * rr, y + Math.cos(ph) * rr * 0.8, z + Math.sin(ph) * Math.sin(th) * rr);
      o.lookAt(x + Math.sin(ph) * Math.cos(th) * rr * 3, y + Math.cos(ph) * rr * 3, z + Math.sin(ph) * Math.sin(th) * rr * 3);
      o.rotateZ(r() * Math.PI * 2);
      o.scale.setScalar(0.8 + r() * 0.6);
      o.updateMatrix();
      mesh.setMatrixAt(i, o.matrix);
      mesh.setColorAt(i, LEAF[Math.floor(r() * LEAF.length)]);
    }
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
};

/** A hedge along a line: bushes every `step`, from a to b. */
export const hedge = (a: Vector3, b: Vector3, step: number, rad: number, seed = 13) => {
  const list: [number, number, number, number][] = [];
  const n = Math.max(1, Math.round(a.distanceTo(b) / step));
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    list.push([a.x + (b.x - a.x) * t, rad * 0.55, a.z + (b.z - a.z) * t, rad]);
  }
  return bushes(list, 46, seed);
};

// ───────────────────────── clouds ─────────────────────────

/**
 * Soft cumulus billboards on the far horizon, in a group that travels with the camera (slow parallax by distance).
 * `tint(color)` warms them with the station's horizon colour.
 */
export const createClouds = () => {
  const group = new Group();
  const r = rng(91);
  const mats: SpriteMaterial[] = [];
  for (let i = 0; i < 14; i++) {
    const m = new SpriteMaterial({map: cloudTexture, transparent: true, depthWrite: false, fog: false, opacity: 0.85});
    mats.push(m);
    const s = new Sprite(m);
    const dist = 140 + r() * 120;
    const x = (r() - 0.5) * 360;
    s.position.set(x, 18 + r() * 34 + dist * 0.06, -dist);
    const w = 50 + r() * 70;
    s.scale.set(w, w * 0.42, 1);
    s.renderOrder = -0.5;
    group.add(s);
  }
  return {
    group,
    update: (horizon: Color, amount: number, t: number) => {
      mats.forEach((m) => {
        m.color.set('#FFFFFF').lerp(horizon, 0.35);
        m.opacity = 0.85 * amount;
      });
      group.children.forEach((s, i) => (s.position.x += Math.sin(t * 0.02 + i) * 0.004));
    },
  };
};
