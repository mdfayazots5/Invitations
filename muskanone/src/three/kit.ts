import {
  BufferGeometry,
  CanvasTexture,
  type Material,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Quaternion,
  SRGBColorSpace,
  Vector3,
} from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/** Shared materials: one per surface type, so the whole world is a handful of draw calls per station. */
export const MAT = {
  marble: new MeshStandardMaterial({color: '#F4EFE8', roughness: 0.6, metalness: 0}),
  cream: new MeshStandardMaterial({color: '#FBF1E4', roughness: 0.75}),
  blush: new MeshStandardMaterial({color: '#F3DCD2', roughness: 0.8}),
  goldTrim: new MeshStandardMaterial({color: '#D9AE5C', roughness: 0.35, metalness: 0.8}),
  brass: new MeshStandardMaterial({color: '#D9AE5C', roughness: 0.35, metalness: 0.55, emissive: '#C98A2E', emissiveIntensity: 0.9}),
  leaf: new MeshStandardMaterial({color: '#7FA37A', roughness: 0.8, flatShading: true, side: 2}),
  pine: new MeshStandardMaterial({color: '#5E8C74', roughness: 0.85, flatShading: true}),
  trunk: new MeshStandardMaterial({color: '#A88A6A', roughness: 0.9}),
  terrace: new MeshStandardMaterial({color: '#EAD7C3', roughness: 0.95}),
  grass: new MeshStandardMaterial({color: '#C9DDBF', roughness: 1}),
  path: new MeshStandardMaterial({color: '#F3E1D2', roughness: 0.95}),
  aqua: new MeshStandardMaterial({color: '#9ED8D6', roughness: 0.7, side: 2}),
  inset: new MeshStandardMaterial({color: '#D9CBBB', roughness: 0.9}),
  warm: new MeshStandardMaterial({color: '#FFE8B8', emissive: '#FFD08A', emissiveIntensity: 1.4, roughness: 0.6}),
  mountain: new MeshStandardMaterial({color: '#9FB3CB', roughness: 1, flatShading: true}),
  stone: new MeshStandardMaterial({color: '#F7EEE2', roughness: 0.9, emissive: '#F3E2CC', emissiveIntensity: 0.3}),
};

/**
 * Collects static parts per material, then merges them: one Mesh per material.
 * Geometries are baked with their transform, so nothing in a batch moves.
 */
export class Batch {
  private parts = new Map<Material, BufferGeometry[]>();
  add(geo: BufferGeometry, mat: Material, pos: Vector3 | [number, number, number] = [0, 0, 0], rotY = 0, scale: number | [number, number, number] = 1) {
    const m = new Matrix4().compose(
      Array.isArray(pos) ? new Vector3(...pos) : pos,
      new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), rotY),
      typeof scale === 'number' ? new Vector3(scale, scale, scale) : new Vector3(...scale),
    );
    const g = (geo.index ? geo.toNonIndexed() : geo.clone()).applyMatrix4(m);
    // merged parts must share attributes: keep position + normal (+ uv when present on all)
    for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal' && k !== 'uv') g.deleteAttribute(k);
    if (!g.attributes.normal) g.computeVertexNormals();
    let list = this.parts.get(mat);
    if (!list) this.parts.set(mat, (list = []));
    list.push(g);
    return this;
  }
  addMatrix(geo: BufferGeometry, mat: Material, m: Matrix4) {
    const g = (geo.index ? geo.toNonIndexed() : geo.clone()).applyMatrix4(m);
    for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal' && k !== 'uv') g.deleteAttribute(k);
    let list = this.parts.get(mat);
    if (!list) this.parts.set(mat, (list = []));
    list.push(g);
    return this;
  }
  build(): Mesh[] {
    const out: Mesh[] = [];
    for (const [mat, geos] of this.parts) {
      const hasUv = geos.every((g) => g.attributes.uv);
      if (!hasUv) geos.forEach((g) => g.deleteAttribute('uv'));
      const merged = mergeGeometries(geos, false);
      if (merged) out.push(new Mesh(merged, mat));
      geos.forEach((g) => g.dispose());
    }
    this.parts.clear();
    return out;
  }
}

const canvasTex = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, srgb = true) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d')!);
  const t = new CanvasTexture(c);
  if (srgb) t.colorSpace = SRGBColorSpace;
  return t;
};

/** Warm radial glow for lanterns, candles and the mandap (additive). */
export const glowTexture = canvasTex(64, 64, (g) => {
  const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  r.addColorStop(0, 'rgba(255,244,210,1)');
  r.addColorStop(0.3, 'rgba(255,205,120,0.55)');
  r.addColorStop(1, 'rgba(255,190,90,0)');
  g.fillStyle = r;
  g.fillRect(0, 0, 64, 64);
});

/** Baked-looking contact shadow: a soft dark ellipse under objects. */
export const shadowMaterial = new MeshBasicMaterial({
  map: canvasTex(64, 64, (g) => {
    const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    r.addColorStop(0, 'rgba(90,60,50,0.45)');
    r.addColorStop(1, 'rgba(90,60,50,0)');
    g.fillStyle = r;
    g.fillRect(0, 0, 64, 64);
  }),
  transparent: true,
  depthWrite: false,
});

/** Painted lotus spray (pink lotus, buds and leaves) for the arch faces, drawn at runtime. */
export const lotusMaterial = new MeshBasicMaterial({
  map: canvasTex(256, 256, (g) => {
    const petal = (x: number, y: number, a: number, len: number, w: number, col: string) => {
      g.save();
      g.translate(x, y);
      g.rotate(a);
      g.fillStyle = col;
      g.beginPath();
      g.moveTo(0, 0);
      g.quadraticCurveTo(w, -len * 0.5, 0, -len);
      g.quadraticCurveTo(-w, -len * 0.5, 0, 0);
      g.fill();
      g.restore();
    };
    // stems & leaves
    g.strokeStyle = '#7FA37A';
    g.lineWidth = 4;
    g.beginPath();
    g.moveTo(128, 250);
    g.quadraticCurveTo(110, 180, 128, 120);
    g.moveTo(128, 250);
    g.quadraticCurveTo(160, 200, 186, 160);
    g.moveTo(128, 250);
    g.quadraticCurveTo(96, 210, 70, 172);
    g.stroke();
    for (const [x, y, a] of [
      [100, 200, -1.2],
      [158, 205, 1.1],
      [118, 160, -0.6],
    ])
      petal(x, y, a, 60, 22, '#8DAE85');
    // main lotus
    for (let i = -3; i <= 3; i++) petal(128, 122, i * 0.32, 74 - Math.abs(i) * 6, 22, i % 2 ? '#F3A9B6' : '#F7C9C9');
    petal(128, 122, 0, 52, 16, '#E88FA3');
    // buds
    for (const [x, y] of [
      [186, 160],
      [70, 172],
    ]) {
      petal(x, y, -0.25, 40, 13, '#F3A9B6');
      petal(x, y, 0.25, 40, 13, '#F7C9C9');
    }
  }),
  transparent: true,
  depthWrite: false,
  alphaTest: 0.05,
});
