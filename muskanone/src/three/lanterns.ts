import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CylinderGeometry,
  InstancedMesh,
  LatheGeometry,
  Matrix4,
  Object3D,
  Points,
  PointsMaterial,
  Quaternion,
  Vector2,
  Vector3,
} from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {glowTexture, MAT} from './kit';

/** A hanging point: where the chain is fixed (top), chain length, lantern scale. */
export type Hang = {top: [number, number, number]; chain: number; scale: number};

/**
 * Brass Moroccan lanterns (Lathe body + cylinder cap and finial), all in one InstancedMesh, with thin cylinder chains
 * and an additive glow sprite each (one Points draw call). Each swings ±3° from its fixing point, 4 s period, own phase.
 */
export const createLanterns = (hangs: Hang[]) => {
  const profile = [
    [0, -0.95],
    [0.16, -0.9],
    [0.36, -0.62],
    [0.46, -0.2],
    [0.44, 0.22],
    [0.3, 0.52],
    [0.14, 0.7],
    [0.06, 0.86],
    [0, 0.95],
  ].map(([x, y]) => new Vector2(x, y));
  const body = new LatheGeometry(profile, 8);
  const cap = new CylinderGeometry(0.2, 0.34, 0.16, 8).translate(0, 0.62, 0);
  const finial = new CylinderGeometry(0.03, 0.08, 0.3, 6).translate(0, -1.05, 0);
  const ring = new CylinderGeometry(0.06, 0.06, 0.16, 6).translate(0, 1.02, 0);
  const lanternGeo = mergeGeometries([body.toNonIndexed(), cap.toNonIndexed(), finial.toNonIndexed(), ring.toNonIndexed()].map((g) => {
    g.deleteAttribute('uv');
    return g;
  }))!;
  // chain: unit-length cylinder from y=0 down to y=-1, scaled to each chain length
  const chainGeo = new CylinderGeometry(0.018, 0.018, 1, 4).translate(0, -0.5, 0);

  const n = hangs.length;
  const lanterns = new InstancedMesh(lanternGeo, MAT.brass, n);
  const chains = new InstancedMesh(chainGeo, MAT.goldTrim, n);
  const glowPos = new Float32Array(n * 3);
  const glowGeo = new BufferGeometry();
  glowGeo.setAttribute('position', new BufferAttribute(glowPos, 3));
  const glow = new Points(
    glowGeo,
    new PointsMaterial({map: glowTexture, size: 1.7, color: '#FFC870', transparent: true, opacity: 0.75, depthWrite: false, blending: AdditiveBlending}),
  );
  glow.frustumCulled = false;
  lanterns.frustumCulled = false;
  chains.frustumCulled = false;

  const phase = hangs.map((_, i) => (i * 2.39) % (Math.PI * 2));
  const o = new Object3D();
  const pivot = new Matrix4();
  const q = new Quaternion();
  const axis = new Vector3();
  const tmp = new Vector3();

  const update = (t: number) => {
    hangs.forEach((h, i) => {
      // ±3° swing, 4 s period, about an axis that differs a little per lantern
      const a = (3 * Math.PI) / 180 * Math.sin((t * Math.PI * 2) / 4 + phase[i]);
      axis.set(Math.cos(phase[i]), 0, Math.sin(phase[i])).normalize();
      q.setFromAxisAngle(axis, a);
      pivot.compose(new Vector3(...h.top), q, new Vector3(1, 1, 1));
      // chain
      o.position.set(0, 0, 0);
      o.rotation.set(0, 0, 0);
      o.scale.set(1, h.chain, 1);
      o.updateMatrix();
      chains.setMatrixAt(i, o.matrix.clone().premultiply(pivot));
      // lantern below the chain
      o.position.set(0, -h.chain - 1.0 * h.scale, 0);
      o.rotation.set(0, phase[i], 0);
      o.scale.setScalar(h.scale);
      o.updateMatrix();
      const m = o.matrix.clone().premultiply(pivot);
      lanterns.setMatrixAt(i, m);
      tmp.set(0, -0.1, 0).applyMatrix4(m);
      glowPos.set([tmp.x, tmp.y, tmp.z], i * 3);
    });
    lanterns.instanceMatrix.needsUpdate = true;
    chains.instanceMatrix.needsUpdate = true;
    (glowGeo.attributes.position as BufferAttribute).needsUpdate = true;
  };
  update(0);
  return {objects: [lanterns, chains, glow], update};
};
