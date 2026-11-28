import {
  BoxGeometry,
  CatmullRomCurve3,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DoubleSide,
  ExtrudeGeometry,
  LatheGeometry,
  Mesh,
  Path,
  PlaneGeometry,
  ShaderMaterial,
  Shape,
  TubeGeometry,
  Vector2,
  Vector3,
} from 'three';
import {type Batch, MAT} from './kit';

// ───────────────────────── arches & domes ─────────────────────────

/** Pointed (Mughal) arch opening: straight jambs up to `spring`, then two arcs meeting at a point. */
const pointedPath = (p: Path, w: number, spring: number, rise: number) => {
  const hw = w / 2;
  p.moveTo(-hw, 0);
  p.lineTo(-hw, spring);
  p.quadraticCurveTo(-hw, spring + rise * 0.75, 0, spring + rise);
  p.quadraticCurveTo(hw, spring + rise * 0.75, hw, spring);
  p.lineTo(hw, 0);
  p.lineTo(-hw, 0);
};

/** A thick arch frame (wall with a pointed opening), extruded, base at y=0, centred on x, front face at z=0. */
export const mughalArch = (outerW: number, outerH: number, openW: number, spring: number, depth = 0.6) => {
  const s = new Shape();
  s.moveTo(-outerW / 2, 0);
  s.lineTo(-outerW / 2, outerH);
  s.lineTo(outerW / 2, outerH);
  s.lineTo(outerW / 2, 0);
  s.lineTo(-outerW / 2, 0);
  const hole = new Path();
  pointedPath(hole, openW, spring, openW * 0.62);
  s.holes.push(hole);
  const g = new ExtrudeGeometry(s, {depth, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 1, curveSegments: 10});
  g.translate(0, 0, -depth);
  return g;
};

/** Onion dome (Lathe), base radius r, base at y=0, with a small gold finial added separately. */
export const onionDome = (r: number) =>
  new LatheGeometry(
    [
      [0, 0],
      [r * 0.92, 0],
      [r * 1.06, r * 0.32],
      [r * 1.02, r * 0.66],
      [r * 0.78, r * 0.98],
      [r * 0.42, r * 1.28],
      [r * 0.14, r * 1.52],
      [0, r * 1.66],
    ].map(([x, y]) => new Vector2(x, y)),
    14,
  );

export const dome = (b: Batch, x: number, y: number, z: number, r: number) => {
  b.add(new CylinderGeometry(r * 0.95, r * 0.95, r * 0.35, 14), MAT.marble, [x, y + r * 0.17, z]);
  b.add(onionDome(r), MAT.marble, [x, y + r * 0.34, z]);
  b.add(new CylinderGeometry(r * 0.03, r * 0.06, r * 0.5, 6), MAT.goldTrim, [x, y + r * 0.34 + r * 1.8, z]);
};

export const minaret = (b: Batch, x: number, z: number, h: number, r: number) => {
  b.add(new CylinderGeometry(r, r * 1.15, h * 0.55, 10), MAT.marble, [x, h * 0.275, z]);
  b.add(new CylinderGeometry(r * 1.45, r * 1.45, h * 0.035, 10), MAT.goldTrim, [x, h * 0.56, z]);
  b.add(new CylinderGeometry(r * 0.8, r * 0.95, h * 0.3, 10), MAT.marble, [x, h * 0.72, z]);
  b.add(new CylinderGeometry(r * 1.25, r * 1.25, h * 0.03, 10), MAT.goldTrim, [x, h * 0.875, z]);
  dome(b, x, h * 0.88, z, r * 0.9);
};

/** Building body with dark inset arch "windows" on its front (suggested cut-outs). */
export const hall = (b: Batch, x: number, z: number, w: number, h: number, d: number, arches: number) => {
  b.add(new BoxGeometry(w, h, d), MAT.marble, [x, h / 2, z]);
  b.add(new BoxGeometry(w + 0.3, 0.25, d + 0.3), MAT.goldTrim, [x, h, z]);
  const step = w / arches;
  for (let i = 0; i < arches; i++) {
    const ax = x - w / 2 + step * (i + 0.5);
    const s = new Shape();
    pointedPath(s, step * 0.5, h * 0.42, step * 0.3);
    b.add(new ExtrudeGeometry(s, {depth: 0.05, bevelEnabled: false, curveSegments: 8}), MAT.inset, [ax, h * 0.12, z + d / 2 + 0.01]);
  }
};

// ───────────────────────── nature ─────────────────────────

/** Palm: a gently curved trunk (tube) and a crown of bent frond strips. */
export const palm = (b: Batch, x: number, z: number, h: number, lean: number) => {
  const trunk = new CatmullRomCurve3([new Vector3(0, 0, 0), new Vector3(lean * 0.4, h * 0.5, 0), new Vector3(lean, h, 0)]);
  b.add(new TubeGeometry(trunk, 8, 0.22, 6), MAT.trunk, [x, 0, z]);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const frond = new PlaneGeometry(0.7, 3.4, 1, 6);
    const pos = frond.attributes.position;
    for (let k = 0; k < pos.count; k++) {
      const yy = pos.getY(k) + 1.7; // 0 at base → 3.4 at tip
      pos.setZ(k, -0.16 * yy * yy); // droop
      pos.setX(k, pos.getX(k) * (1 - yy / 4)); // taper
    }
    frond.translate(0, 1.7, 0).rotateX(-1.0).rotateY(a);
    b.add(frond, MAT.leaf, [x + lean, h, z]);
  }
};

export const pine = (b: Batch, x: number, z: number, h: number) => {
  b.add(new CylinderGeometry(0.12, 0.16, h * 0.25, 5), MAT.trunk, [x, h * 0.12, z]);
  for (let i = 0; i < 3; i++) b.add(new ConeGeometry(h * (0.3 - i * 0.07), h * 0.42, 7), MAT.pine, [x, h * (0.35 + i * 0.22), z]);
};

/** A ridge of mountains: a displaced strip, desaturated blue, faded by fog and haze. */
export const mountains = (b: Batch, z: number, width: number, height: number, seed: number) => {
  const g = new PlaneGeometry(width, height, 48, 1);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    if (pos.getY(i) > 0) {
      const x = pos.getX(i) / width;
      const peak =
        0.55 + 0.3 * Math.sin(x * 9 + seed) + 0.15 * Math.sin(x * 23 + seed * 2) + 0.1 * Math.sin(x * 51 + seed * 3);
      pos.setY(i, -height / 2 + height * Math.max(0.15, peak));
    }
  }
  g.computeVertexNormals();
  b.add(g, MAT.mountain, [0, height / 2 - 0.5, z]);
};

// ───────────────────────── water ─────────────────────────

/** Calm lake: a gradient "reflection" of the sky colours with slow ripple lines (no render target). */
export const createLake = (w: number, d: number) => {
  const mat = new ShaderMaterial({
    uniforms: {uTop: {value: new Color()}, uHorizon: {value: new Color()}, uTime: {value: 0}},
    toneMapped: false,
    vertexShader: /* glsl */ `
      varying vec2 vUv; varying vec3 vWorld;
      void main() { vUv = uv; vec4 w = modelMatrix * vec4(position, 1.0); vWorld = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uTop, uHorizon; uniform float uTime;
      varying vec2 vUv; varying vec3 vWorld;
      void main() {
        // far water mirrors the horizon, near water a little of the upper sky
        vec3 col = mix(uTop * 0.92 + 0.06, uHorizon, smoothstep(0.0, 1.0, vUv.y));
        float r = sin(vWorld.z * 3.1 + uTime * 0.6 + sin(vWorld.x * 0.4) * 2.0);
        float lines = smoothstep(0.97, 1.0, r) * (0.25 + 0.5 * vUv.y);
        col = mix(col, vec3(1.0), lines * 0.5);
        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
      }`,
  });
  const mesh = new Mesh(new PlaneGeometry(w, d, 1, 1).rotateX(-Math.PI / 2), mat);
  return {
    mesh,
    update: (top: Color, horizon: Color, t: number) => {
      mat.uniforms.uTop.value.copy(top);
      mat.uniforms.uHorizon.value.copy(horizon);
      mat.uniforms.uTime.value = t;
    },
  };
};

// ───────────────────────── mandap ─────────────────────────

export const mandap = (b: Batch, x: number, z: number) => {
  const w = 5.2;
  for (const [px, pz] of [
    [-w / 2, -w / 2],
    [w / 2, -w / 2],
    [-w / 2, w / 2],
    [w / 2, w / 2],
  ]) {
    b.add(new CylinderGeometry(0.16, 0.2, 5, 10), MAT.marble, [x + px, 2.5, z + pz]);
    b.add(new CylinderGeometry(0.28, 0.28, 0.25, 10), MAT.goldTrim, [x + px, 0.12, z + pz]);
  }
  b.add(new BoxGeometry(w + 0.8, 0.4, w + 0.8), MAT.marble, [x, 5.15, z]);
  b.add(new BoxGeometry(w + 1, 0.12, w + 1), MAT.goldTrim, [x, 5.4, z]);
  dome(b, x, 5.4, z, 2.1);
  b.add(new BoxGeometry(w + 2, 0.4, w + 2), MAT.marble, [x, 0.2, z]); // platform
  // aqua cloth: two swagged side panels at the front and a back drop
  for (const side of [-1, 1]) {
    const cloth = new PlaneGeometry(1.4, 4.6, 6, 10);
    const pos = cloth.attributes.position;
    for (let i = 0; i < pos.count; i++) pos.setZ(i, Math.sin(pos.getX(i) * 9) * 0.08 + (pos.getY(i) / 4.6 + 0.5) * 0.25 * side);
    cloth.computeVertexNormals();
    b.add(cloth, MAT.aqua, [x + side * (w / 2 - 0.55), 2.75, z + w / 2 + 0.05]);
  }
  const back = new PlaneGeometry(w, 4.6, 16, 1);
  const bp = back.attributes.position;
  for (let i = 0; i < bp.count; i++) bp.setZ(i, Math.sin(bp.getX(i) * 6) * 0.1);
  back.computeVertexNormals();
  b.add(back, MAT.aqua, [x, 2.75, z - w / 2 + 0.05]);
};

// ───────────────────────── intro drapes ─────────────────────────

/**
 * One silk drape: a 40×60 plane whose vertex shader adds sine folds and a slow sway; `uOpen` (0→1) gathers it
 * towards its outer edge. `side` = −1 for the left drape, +1 for the right. Ivory with a fresnel sheen.
 */
export const createDrape = (side: -1 | 1, w: number, h: number) => {
  const mat = new ShaderMaterial({
    side: DoubleSide,
    uniforms: {uOpen: {value: 0}, uTime: {value: 0}, uSide: {value: side}, uW: {value: w}, uColor: {value: new Color('#F6EBDD')}},
    toneMapped: false, // exact ivory, not dulled by ACES
    vertexShader: /* glsl */ `
      uniform float uOpen, uTime, uSide, uW;
      varying float vShade; varying float vSheen;
      void main() {
        vec3 p = position;
        // u = 0 at the inner (centre) edge → 1 at the outer edge
        float u = (p.x * uSide + uW * 0.5) / uW;
        float v = (p.y / ${h.toFixed(1)}) + 0.5; // 0 bottom → 1 top
        // gather towards the outer edge, more at the bottom than at the top rod
        float g = uOpen * (0.92 - 0.12 * v);
        float uu = mix(u, 1.0, g);
        p.x = (uu * uW - uW * 0.5) * uSide;
        float freq = 22.0 + 30.0 * uOpen;
        float amp = 0.09 + 0.22 * uOpen;
        float fold = sin(u * freq + uSide) * amp;
        float sway = sin(uTime * 0.7 + v * 2.0) * 0.05 * (1.0 - v) * (1.0 - uOpen);
        p.z += fold + sway;
        float slope = cos(u * freq + uSide) * amp * freq / uW;
        vec3 n = normalize(vec3(-slope * uSide, 0.0, 1.0));
        vShade = 0.86 + 0.14 * n.z + 0.05 * v;
        vSheen = pow(1.0 - abs(n.z), 2.0);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      varying float vShade; varying float vSheen;
      void main() {
        vec3 col = uColor * vShade + vec3(1.0, 0.97, 0.9) * vSheen * 0.35;
        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
      }`,
  });
  const geo = new PlaneGeometry(w, h, 40, 60);
  const mesh = new Mesh(geo, mat);
  return {mesh, mat};
};
