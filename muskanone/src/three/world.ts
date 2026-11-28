import {
  ACESFilmicToneMapping,
  PCFSoftShadowMap,
  AdditiveBlending,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  CatmullRomCurve3,
  Color,
  CylinderGeometry,
  DirectionalLight,
  ExtrudeGeometry,
  Fog,
  Group,
  HemisphereLight,
  type Material,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  PointsMaterial,
  Scene,
  Shape,
  SRGBColorSpace,
  TubeGeometry,
  Vector3,
  WebGLRenderer,
} from 'three';
import {isForcedDpr, pixelRatio} from '../dpr';
import {createDrape, createLake, dome, hall, mandap, minaret, mountains, mughalArch, palm, pine} from './architecture';
import {flowerBed, flowersAlong} from './flowers';
import {Batch, glowTexture, groundPlane, lotusMaterial, MAT, shadowMaterial} from './kit';
import {bushes, createClouds, grassField, hedge, wind} from './vegetation';
import {createLanterns, type Hang} from './lanterns';
import {createParticles} from './particles';
import {forcedTier, TIER, type Tier, tierFromProbe} from './quality';
import {createSky} from './sky';
import {camPath, lookPath, newPalette, paletteAt, STATIONS} from './stations';

/** A back-view silhouette of the couple at the Valima path and the mosque. Off by default (brief: no figures). */
export const SHOW_COUPLE = false;

const LAST = STATIONS.length - 1;
const bump = (p: number, at: number, width: number) => Math.max(0, 1 - Math.abs(p - at) / width);
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

export type World = {
  /** Progress target in stations (0 = intro … 9 = closing); the camera follows it, damped. */
  setTarget: (p: number) => void;
  /** Snap straight to a station (og image, reduced motion). */
  jump: (p: number) => void;
  /** Station index, for the section controller. */
  goTo: (i: number) => void;
  /** The intro tap: the drapes gather to the sides (1.4 s) and the camera pushes through. */
  openDrapes: () => void;
  info: () => {tier: Tier; calls: number; triangles: number; fps: number};
};

/**
 * One continuous 3D world: a single scene, one camera on a CatmullRom path through the 10 stations (one per section).
 * Animation time comes only from the rAF timestamp (the video recorder slows that clock), never from performance.now().
 * Returns null when WebGL is unavailable; `onLost` fires if the context is lost later, so the page can fall back.
 */
export const createWorld = (canvas: HTMLCanvasElement, opts: {reducedMotion: boolean; onLost: () => void}): World | null => {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({
      canvas,
      antialias: forcedTier === 'high',
      alpha: false,
      powerPreference: 'high-performance',
      // ?autotest / ?og: keep the frame so screenshots show the scene.
      preserveDrawingBuffer: /autotest|[?&]og\b/.test(location.search),
    });
  } catch {
    return null;
  }
  if (!renderer.getContext()) return null;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  // soft sun shadows ground everything (mid/high tiers; low keeps only the painted contact shadows)
  renderer.shadowMap.enabled = forcedTier !== 'low';
  renderer.shadowMap.type = PCFSoftShadowMap;
  renderer.outputColorSpace = SRGBColorSpace;
  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    opts.onLost();
  });

  let tier: Tier = forcedTier ?? 'mid';
  const applyDpr = () => renderer.setPixelRatio(isForcedDpr ? pixelRatio() : Math.min(pixelRatio(), TIER[tier].dpr));
  applyDpr();

  const scene = new Scene();
  const fog = new Fog('#ffffff', 20, 70);
  scene.fog = fog;
  const camera = new PerspectiveCamera(60, 1, 0.1, 140);

  const hemi = new HemisphereLight('#ffffff', '#ffffff', 1.5);
  const sun = new DirectionalLight('#ffffff', 1.5);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = sun.shadow.camera.bottom = -26;
  sun.shadow.camera.right = sun.shadow.camera.top = 26;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 140;
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.03;
  scene.add(hemi, sun, sun.target);

  const sky = createSky();
  scene.add(sky.mesh);

  // Zones: each set of stations is its own group, shown only while the camera is near it (current ±1),
  // so nothing from a later scene shows through the fog of an earlier one, and draw calls stay low.
  type Zone = {group: Group; batch: Batch; from: number; to: number};
  const zones: Zone[] = [];
  let statics!: Batch;
  let zone!: Zone;
  const beginZone = (from: number, to: number) => {
    zone = {group: new Group(), batch: new Batch(), from, to};
    statics = zone.batch;
    zones.push(zone);
    scene.add(zone.group);
  };
  const add = (...objs: {frustumCulled?: boolean}[]) => objs.forEach((o) => zone.group.add(o as Mesh));
  beginZone(-1, 99); // ground: always
  const shadow = (x: number, z: number, w: number, d: number) =>
    statics.add(new PlaneGeometry(w, d).rotateX(-Math.PI / 2), shadowMaterial, [x, 0.03, z]);
  const hangs: Hang[] = [];

  // ── ground plates (terrace → garden → lake shore → grass) ──
  statics.add(groundPlane(90, 90, 3), MAT.terrace, [0, 0, -38]);
  statics.add(groundPlane(160, 32, 5), MAT.grass, [0, 0, -99]);
  statics.add(groundPlane(200, 220, 5), MAT.grass, [0, 0, -284]);
  // a stone path with gold edges through the courtyard, grass beds and flowers either side
  statics.add(groundPlane(3.6, 84, 1.8), MAT.stone, [0, 0.02, -40]);
  for (const side of [-1, 1]) {
    statics.add(new BoxGeometry(0.1, 0.06, 84), MAT.terrace, [side * 1.85, 0.03, -40]); // pale stone kerb
    statics.add(groundPlane(5, 56, 5), MAT.grass, [side * 4.6, 0.015, -30]);
  }
  add(flowerBed(-2.6, 0.05, -36, 1.2, 0.3, 40, 50, 0.85), flowerBed(2.6, 0.05, -36, 1.2, 0.3, 40, 50, 0.85));
  // grass blades in the courtyard beds, swaying in the wind
  const grassMeshes = [grassField([[-4.6, -32, 5, 50], [4.6, -32, 5, 50]], 5500, 5)];
  add(grassMeshes[0]);

  beginZone(-1, 1.3);
  // ── station 0: intro drapes (with a gold rod, a garland and two lanterns in front) ──
  const drapeL = createDrape(-1, 3, 9.8);
  const drapeR = createDrape(1, 3, 9.8);
  drapeL.mesh.position.set(-1.5, 4.5, 0);
  drapeR.mesh.position.set(1.5, 4.5, 0);
  add(drapeL.mesh, drapeR.mesh);
  const rod = new Mesh(new CylinderGeometry(0.06, 0.06, 6, 8).rotateZ(Math.PI / 2), MAT.goldTrim);
  rod.position.set(0, 9.35, 0.15);
  add(rod);
  const garland = new CatmullRomCurve3([new Vector3(-2.8, 9.2, 0.4), new Vector3(-1.4, 8.1, 0.5), new Vector3(0, 8.8, 0.5), new Vector3(1.4, 8.1, 0.5), new Vector3(2.8, 9.2, 0.4)]);
  const garlandFlowers = flowersAlong(garland, 60, 0.75, 0.12);
  add(garlandFlowers);
  hangs.push({top: [-1.6, 10, 1.6], chain: 1.5, scale: 0.42}, {top: [1.55, 10, 1.9], chain: 2.1, scale: 0.38});

  beginZone(-1, 2.3);
  // ── station 1: hero courtyard (palms, hanging lanterns, flower beds; the palace is on the horizon layer) ──
  const heroFlowers: Mesh[] = [];
  for (const [x, z, h, lean] of [
    [-6.4, -26, 7, -0.8],
    [6.6, -28, 7.6, 0.9],
    [-8.5, -30, 8.4, -1.1],
    [8.8, -32, 8, 1],
    [-6.5, -40, 7.4, -0.6],
    [6.8, -42, 7.8, 0.7],
  ]) {
    palm(statics, x, z, h, lean);
    shadow(x, z, 3.2, 2.4);
    heroFlowers.push(flowerBed(x, 0.15, z + 0.8, 2.4, 0.6, 1.2, 14, 1.1));
  }
  add(...heroFlowers);
  add(
    bushes([[-6.0, 0.5, -25, 0.9], [6.2, 0.5, -27, 0.9], [-8.0, 0.5, -29, 1.0], [8.4, 0.5, -31, 1.0], [-6.1, 0.5, -39, 0.9], [6.4, 0.5, -41, 0.9]], 60, 21),
    hedge(new Vector3(-7.4, 0, -16), new Vector3(-7.4, 0, -54), 1.6, 0.85, 22),
    hedge(new Vector3(7.4, 0, -16), new Vector3(7.4, 0, -54), 1.6, 0.85, 23),
  );
  for (const [x, z, top, chain] of [
    [-3.6, -19, 8.2, 1.6],
    [3.6, -21, 8.4, 2.0],
    [-4.2, -26, 8.8, 1.8],
    [4.2, -28, 8.6, 1.4],
    [-3.4, -33, 9.4, 2.4],
    [3.6, -35, 9.4, 2.0],
  ])
    hangs.push({top: [x, top, z], chain, scale: 0.55});

  beginZone(1.35, 4.4);
  // ── stations 2–3: colonnade of three pointed arches with lotus sprays ──
  const archZ = -66;
  for (const x of [-6.2, 0, 6.2]) {
    statics.add(mughalArch(5.6, 10.5, 3.4, 5.6, 1.2), MAT.blush, [x, 0, archZ]);
    statics.add(new BoxGeometry(5.8, 0.28, 1.4), MAT.goldTrim, [x, 10.6, archZ - 0.6]);
    statics.add(new BoxGeometry(5.8, 0.4, 1.5), MAT.cream, [x, 0.2, archZ - 0.6]);
    for (const side of [-1, 1]) statics.add(new PlaneGeometry(1.05, 1.3), lotusMaterial, [x + side * 2.25, 3.2, archZ + 0.02]);
    statics.add(new PlaneGeometry(1.3, 1.5), lotusMaterial, [x, 9.3, archZ + 0.02]);
    shadow(x, archZ + 0.8, 6.5, 2.4);
  }
  hangs.push(
    {top: [0, 9.2, archZ - 0.6], chain: 0.9, scale: 0.5},
    {top: [-6.2, 9.2, archZ - 0.6], chain: 1.3, scale: 0.45},
    {top: [6.2, 9.2, archZ - 0.6], chain: 1.1, scale: 0.45},
    {top: [-3.6, 12.5, -56], chain: 3.2, scale: 0.5},
    {top: [3.8, 12.5, -58], chain: 2.6, scale: 0.5},
  );
  // small gold crescents and stars on strings, in front of the arches
  const star = new Shape();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? 0.09 : 0.22;
    const a = (i / 10) * Math.PI * 2 + Math.PI / 2;
    if (i) star.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    else star.moveTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  const moon = new Shape();
  moon.absarc(0, 0, 0.24, Math.PI * 0.25, Math.PI * 1.75, false);
  moon.absarc(0.1, 0, 0.19, Math.PI * 1.6, Math.PI * 0.4, true);
  const starGeo = new ExtrudeGeometry(star, {depth: 0.04, bevelEnabled: false});
  const moonGeo = new ExtrudeGeometry(moon, {depth: 0.04, bevelEnabled: false, curveSegments: 8});
  [-4.6, -2.8, -1.1, 1.3, 3.1, 4.7].forEach((x, i) => {
    const len = 1 + ((i * 7) % 5) * 0.45;
    const y = 11.6 - len;
    statics.add(new CylinderGeometry(0.01, 0.01, len, 3), MAT.goldTrim, [x, y + len / 2, -61 - (i % 3)]);
    statics.add(i % 2 ? starGeo : moonGeo, MAT.goldTrim, [x, y - 0.22, -61 - (i % 3)]);
  });
  add(flowerBed(0, 0.1, archZ - 4, 16, 0.5, 3, 40, 1.1));
  add(bushes([[-10.6, 0.6, archZ + 1, 1.2], [10.6, 0.6, archZ + 1, 1.2], [-3.2, 0.4, archZ + 1.8, 0.6], [3.2, 0.4, archZ + 1.8, 0.6]], 70, 31));

  beginZone(2.9, 5.4);
  // ── station 4: Nikah: a round arch of white flowers by a calm lake, pines on the far shore ──
  const nikahZ = -112;
  const arc = new CatmullRomCurve3(
    Array.from({length: 13}, (_, i) => {
      const a = Math.PI - (i / 12) * Math.PI;
      return new Vector3(Math.cos(a) * 2.9, 1.6 + Math.sin(a) * 2.9, nikahZ);
    }),
  );
  const posts = new CatmullRomCurve3([new Vector3(-2.9, 0, nikahZ), new Vector3(-2.9, 1.6, nikahZ)]);
  const posts2 = new CatmullRomCurve3([new Vector3(2.9, 0, nikahZ), new Vector3(2.9, 1.6, nikahZ)]);
  const white = ['#FFFFFF', '#FFFFFF', '#FFFFFF', '#F8DBD4'];
  add(
    flowersAlong(arc, 150, 1.25, 0.45, white.map((c) => new Color(c))),
    flowersAlong(posts, 24, 1.2, 0.35, white.map((c) => new Color(c))),
    flowersAlong(posts2, 24, 1.2, 0.35, white.map((c) => new Color(c))),
    flowerBed(-3.2, 0.1, nikahZ, 1.8, 0.6, 1.2, 16, 1.2),
    flowerBed(3.2, 0.1, nikahZ, 1.8, 0.6, 1.2, 16, 1.2),
  );
  statics.add(new TubeGeometry(arc, 40, 0.16, 6), MAT.leaf);
  shadow(0, nikahZ, 7, 2.5);
  const lake = createLake(220, 62);
  lake.mesh.position.set(0, 0.04, -146);
  add(lake.mesh);
  // flowering bushes along the near shore
  add(flowerBed(-6.5, 0.05, -104, 7, 0.7, 4, 40, 1.1), flowerBed(6.5, 0.05, -104, 7, 0.7, 4, 40, 1.1));
  grassMeshes.push(grassField([[0, -106, 30, 16]], 5000, 6));
  add(grassMeshes[grassMeshes.length - 1], bushes([[-9, 0.6, -108, 1.3], [9, 0.6, -110, 1.3], [-14, 0.6, -112, 1.5], [14, 0.6, -113, 1.5]], 70, 41));
  for (let i = 0; i < 14; i++) {
    const side = i % 2 ? 1 : -1;
    pine(statics, side * (7 + ((i * 5.3) % 22)), -178 - ((i * 3.7) % 8), 5 + ((i * 1.9) % 4));
  }

  beginZone(3.9, 6.8);
  // ── station 5: Valima: petal path with candles & lanterns to a lit floral mandap; white arches on each side ──
  const mandapZ = -228;
  statics.add(groundPlane(3.2, 44, 1.6), MAT.path, [0, 0.02, -204]);
  add(flowerBed(0, 0.03, -204, 2.6, 0.02, 40, 70, 0.45, ['#F3A9B6', '#F8DBD4', '#FFFFFF', '#E8A0B0'].map((c) => new Color(c))));
  const candlePos: number[] = [];
  for (let z = -188; z > -222; z -= 3.4)
    for (const side of [-1, 1]) {
      const x = side * 1.9;
      statics.add(new CylinderGeometry(0.06, 0.06, 0.32, 8), MAT.cream, [x, 0.16, z]);
      statics.add(new CylinderGeometry(0.02, 0.04, 0.1, 5), MAT.warm, [x, 0.38, z]);
      candlePos.push(x, 0.45, z);
    }
  for (let k = 0; k < 4; k++)
    for (const side of [-1, 1]) {
      const z = -192 - k * 8;
      statics.add(new CylinderGeometry(0.04, 0.05, 2.6, 6), MAT.goldTrim, [side * 2.6, 1.3, z]);
      statics.add(new BoxGeometry(0.6, 0.05, 0.05), MAT.goldTrim, [side * 2.35, 2.6, z]);
      hangs.push({top: [side * 2.15, 2.6, z], chain: 0.2, scale: 0.28});
    }
  mandap(statics, 0, mandapZ);
  grassMeshes.push(grassField([[-6.5, -205, 8, 40], [6.5, -205, 8, 40]], 4000, 7));
  add(
    grassMeshes[grassMeshes.length - 1],
    hedge(new Vector3(-3.4, 0, -188), new Vector3(-3.4, 0, -222), 1.5, 0.6, 51),
    hedge(new Vector3(3.4, 0, -188), new Vector3(3.4, 0, -222), 1.5, 0.6, 52),
  );
  add(flowerBed(0, 5.2, mandapZ + 3.4, 7, 0.6, 0.6, 50, 1.1), flowerBed(0, 0.4, mandapZ + 3, 7.5, 0.4, 1, 30, 1));
  shadow(0, mandapZ, 9, 9);
  for (const side of [-1, 1]) {
    statics.add(mughalArch(4.6, 8, 2.6, 4.4, 0.8), MAT.marble, [side * 7, 0, -212]);
    statics.add(mughalArch(4.6, 8, 2.6, 4.4, 0.8), MAT.marble, [side * 8.5, 0, -220]);
    shadow(side * 7, -211.5, 5, 1.8);
  }
  const candleGeo = new BufferGeometry();
  candleGeo.setAttribute('position', new BufferAttribute(new Float32Array(candlePos), 3));
  const warmGlow = (geo: BufferGeometry, size: number) =>
    new Points(geo, new PointsMaterial({map: glowTexture, size, color: '#FFD08A', transparent: true, depthWrite: false, blending: AdditiveBlending}));
  add(warmGlow(candleGeo, 1.1));
  const mandapGlowGeo = new BufferGeometry();
  mandapGlowGeo.setAttribute('position', new BufferAttribute(new Float32Array([0, 2.6, mandapZ, -1.6, 3.6, mandapZ + 2, 1.6, 3.6, mandapZ + 2]), 3));
  add(warmGlow(mandapGlowGeo, 7));

  // ── stations 6–8: lanterns floating in the open dusk sky ──
  for (let i = 0; i < 14; i++) {
    const side = i % 2 ? 1 : -1;
    const x = side * (3 + ((i * 3.3) % 6));
    const y = 24 + ((i * 4.1) % 11);
    const z = -236 - ((i * 7.9) % 44);
    hangs.push({top: [x, y + 0.6, z], chain: 0.01, scale: 0.6 + ((i * 0.37) % 0.4)});
  }

  beginZone(7.3, 99);
  // ── station 9: white marble mosque at golden sunset; lanterns hang in the foreground ──
  const mosqueZ = -352;
  statics.add(groundPlane(80, 60, 3), MAT.terrace, [0, 0.01, mosqueZ + 22]);
  add(flowerBed(-5, 0.05, mosqueZ + 26, 4, 0.4, 30, 50, 1), flowerBed(5, 0.05, mosqueZ + 26, 4, 0.4, 30, 50, 1));
  hall(statics, 0, mosqueZ, 22, 7, 9, 5);
  dome(statics, 0, 7, mosqueZ, 4.2);
  dome(statics, -7, 7, mosqueZ, 1.9);
  dome(statics, 7, 7, mosqueZ, 1.9);
  hall(statics, 0, mosqueZ + 5.2, 6, 8.5, 1.6, 1); // the central iwan
  for (const [x, z] of [
    [-14, mosqueZ + 3],
    [14, mosqueZ + 3],
    [-16, mosqueZ - 4],
    [16, mosqueZ - 4],
  ])
    minaret(statics, x, z, 21, 0.75);
  // reflecting pool: the same water shader as the lake
  const pool = createLake(4, 26);
  pool.mesh.position.set(0, 0.05, mosqueZ + 22);
  add(pool.mesh, bushes([[-3.4, 0.5, mosqueZ + 14, 0.8], [3.4, 0.5, mosqueZ + 14, 0.8], [-3.4, 0.5, mosqueZ + 26, 0.8], [3.4, 0.5, mosqueZ + 26, 0.8]], 60, 61));
  for (const side of [-1, 1]) statics.add(new BoxGeometry(0.4, 0.3, 26.4), MAT.marble, [side * 2.2, 0.15, mosqueZ + 22]); // pool kerbs
  shadow(0, mosqueZ + 4.8, 26, 4);
  for (const [x, top, z, chain] of [
    [-2.6, 13.5, -301, 2.2],
    [2.4, 13.5, -302, 1.6],
    [-4.4, 14, -305, 3.2],
    [4.6, 14, -306, 2.8],
    [0.9, 14.2, -308, 3.6],
  ])
    hangs.push({top: [x, top, z], chain, scale: 0.6});

  // ── the couple (off by default) ──
  if (SHOW_COUPLE) {
    const c = document.createElement('canvas');
    c.width = 128;
    c.height = 192;
    const g = c.getContext('2d')!;
    g.fillStyle = '#3B4458';
    g.beginPath();
    g.ellipse(46, 40, 15, 17, 0, 0, Math.PI * 2);
    g.ellipse(84, 46, 14, 16, 0, 0, Math.PI * 2);
    g.fill();
    g.fillRect(30, 56, 32, 136);
    g.beginPath();
    g.moveTo(68, 60);
    g.quadraticCurveTo(120, 140, 112, 192);
    g.lineTo(62, 192);
    g.fill();
    const tex = new CanvasTexture(c);
    tex.colorSpace = SRGBColorSpace;
    const mat = new MeshBasicMaterial({map: tex, transparent: true, alphaTest: 0.5, fog: true});
    for (const z of [-200, -318]) {
      const m = new Mesh(new PlaneGeometry(1.2, 1.8), mat);
      m.position.set(0.2, 0.9, z);
      add(m);
    }
  }

  // merge each zone's static parts (one mesh per material per zone); later objects go to the always-on zone
  for (const z of zones) for (const m of z.batch.build()) z.group.add(m);
  zone = zones[0];
  const casters = new Set<unknown>([MAT.bark, MAT.frond, MAT.blush, MAT.marble, MAT.cream, MAT.goldTrim, MAT.pine, MAT.aqua, MAT.leaf]);
  const receivers = new Set<unknown>([MAT.grass, MAT.stone, MAT.terrace, MAT.path, MAT.marble, MAT.cream, MAT.blush]);
  for (const z of zones)
    z.group.traverse((o) => {
      const m = (o as Mesh).material;
      if (!m) return;
      if (casters.has(m)) o.castShadow = true;
      if (receivers.has(m)) o.receiveShadow = true;
    });
  const clouds = createClouds();

  const lanterns = createLanterns(hangs.slice(0, 40));
  add(...lanterns.objects);

  // ── horizon layer: distant palace (hero) and mountains (Nikah) travel with the camera, hazed, no fog ──
  const horizon = new Group();
  add(horizon);
  horizon.add(clouds.group);
  const hazed = (base: MeshStandardMaterial) => {
    const m = base.clone();
    m.fog = false;
    m.transparent = true;
    return m;
  };
  const palaceMat = hazed(MAT.marble);
  const palaceTrim = hazed(MAT.goldTrim);
  const palace = new Batch();
  hall(palace, 0, 0, 30, 9, 8, 7);
  dome(palace, 0, 9, 0, 6);
  dome(palace, -10, 9, 0, 2.6);
  dome(palace, 10, 9, 0, 2.6);
  minaret(palace, -18, 0, 26, 0.9);
  minaret(palace, 18, 0, 26, 0.9);
  const palaceMeshes = palace.build();
  palaceMeshes.forEach((m) => {
    m.material = (m.material as Material) === MAT.goldTrim ? palaceTrim : palaceMat;
    m.position.z = -118;
    m.scale.setScalar(1.25);
    horizon.add(m);
  });
  // mountains are flat haze (unlit), tinted towards the horizon colour every frame
  const mountainMat = new MeshBasicMaterial({color: '#9FB3CB', fog: false, transparent: true, vertexColors: true});
  const range = new Batch();
  mountains(range, 0, 320, 24, 1.3);
  mountains(range, -14, 360, 18, 4.1);
  range.build().forEach((m) => {
    m.material = mountainMat;
    m.position.z = -100;
    horizon.add(m);
  });

  // ── particles ──
  const petals = createParticles('petals', 60);
  const sparkles = createParticles('sparkles', 80);
  add(petals.points, sparkles.points);

  // ── sizing ──
  const resize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w < h ? 62 : 48;
    camera.updateProjectionMatrix();
  };
  resize();
  addEventListener('resize', resize);

  // ── state & loop ──
  const pal = newPalette();
  const camPos = new Vector3();
  const look = new Vector3();
  const fwd = new Vector3();
  let target = 0;
  let cp = 0;
  let holdT = 0;
  let open = 0; // drape opening 0→1
  let openStart = -1;
  let last = -1;
  let probe: number[] | null = null;
  let fps = 0;
  let fpsAcc = 0;
  let fpsN = 0;

  const place = (t: number, dt: number) => {
    if (opts.reducedMotion) cp = target;
    // the push through the drapes into the courtyard is slower (~1.5 s) than the section-to-section follow
    else cp += (target - cp) * Math.min(1, dt * (cp < 1 ? 2.4 : 5.5));
    if (Math.abs(target - cp) < 0.0005) cp = target;
    const u = MathUtils.clamp(cp, 0, LAST) / LAST;
    camPath.getPoint(u, camPos);
    lookPath.getPoint(u, look);
    // while a section is held: ~3 % dolly-in and a slow ±2° orbit
    const held = !opts.reducedMotion && Math.abs(target - cp) < 0.02 && Math.abs(cp - Math.round(cp)) < 0.02 && cp > 0.5;
    holdT = held ? holdT + dt : Math.max(0, holdT - dt * 3);
    if (holdT > 0) {
      const k = Math.min(1, holdT / 9);
      camPos.lerp(look, 0.03 * k);
      const ang = MathUtils.degToRad(2) * Math.sin(t * 0.22) * Math.min(1, holdT / 2);
      const dx = camPos.x - look.x;
      const dz = camPos.z - look.z;
      camPos.x = look.x + dx * Math.cos(ang) - dz * Math.sin(ang);
      camPos.z = look.z + dx * Math.sin(ang) + dz * Math.cos(ang);
    }
    // a faint breathing motion while a page is held
    if (holdT > 0) camPos.y += Math.sin(t * 0.6) * 0.05 * Math.min(1, holdT / 2);
    camera.position.copy(camPos);
    camera.lookAt(look);
  };

  const frame = (now: number) => {
    const t = now / 1000;
    const dt = last < 0 ? 0.016 : Math.min(0.05, t - last);
    last = t;

    // intro drapes: 1.4 s, cubic-bezier(.65,0,.35,1) ≈ easeInOutCubic
    if (openStart >= 0) open = easeInOutCubic(Math.min(1, (t - openStart) / 1.4));
    drapeL.mat.uniforms.uOpen.value = drapeR.mat.uniforms.uOpen.value = open;
    drapeL.mat.uniforms.uTime.value = drapeR.mat.uniforms.uTime.value = t;
    const introVisible = cp < 1.2;
    drapeL.mesh.visible = drapeR.mesh.visible = rod.visible = garlandFlowers.visible = introVisible;

    place(t, dt);
    for (const z of zones) z.group.visible = cp >= z.from && cp <= z.to;
    paletteAt(cp, pal);
    sky.update(pal, camera.position, t);
    fog.color.copy(pal.horizon);
    fog.near = pal.fogNear;
    fog.far = pal.fogFar;
    hemi.color.copy(pal.hemiSky);
    hemi.groundColor.copy(pal.hemiGround);
    hemi.intensity = pal.hemi;
    sun.color.copy(pal.light);
    sun.intensity = pal.lightI;
    // sun from the side and above: soft shadows fall across the ground, faces stay lit; the shadow box follows the view
    sun.target.position.copy(look);
    sun.position.set(0.75, 0.95 + pal.sunY, 0.45).multiplyScalar(60).add(look);
    wind.value = t;
    clouds.update(pal.horizon, 1 - pal.stars * 0.75, t);
    pool.update(pal.top, pal.horizon, t);
    lake.update(pal.top, pal.horizon, t);

    // horizon layer
    horizon.position.set(camera.position.x, 0, camera.position.z);
    const pw = bump(cp, 1.15, 0.9);
    const mw = Math.max(bump(cp, 4, 1.2), 0);
    palaceMat.opacity = palaceTrim.opacity = pw;
    palaceMat.color.set('#F4EFE8').lerp(pal.horizon, 0.35);
    palaceMat.emissive.copy(pal.horizon).multiplyScalar(0.12);
    mountainMat.opacity = mw;
    mountainMat.color.set('#9FB3CB').lerp(pal.horizon, 0.22);
    palaceMeshes.forEach((m) => (m.visible = pw > 0.01));
    horizon.children.forEach((m) => {
      if (!palaceMeshes.includes(m as Mesh)) m.visible = mw > 0.01;
    });

    lanterns.update(t);
    if (!opts.reducedMotion) {
      camera.getWorldDirection(fwd);
      const centre = camera.position.clone().addScaledVector(fwd, 9);
      const scale = (renderer.getPixelRatio() * window.innerHeight) / (2 * Math.tan(MathUtils.degToRad(camera.fov / 2)));
      petals.update(t, centre, bump(cp, 4.05, 0.85), scale);
      const sp = Math.min(1, Math.max(0, (cp - 4.5) * 2)) * Math.min(1, Math.max(0, (8.6 - cp) * 2));
      sparkles.update(t, centre, sp, scale);
    } else {
      petals.points.visible = sparkles.points.visible = false;
    }

    renderer.render(scene, camera);

    // fps + quality probe (1 s of frames after the tap)
    fpsAcc += dt;
    fpsN++;
    if (fpsAcc >= 1) {
      fps = Math.round(fpsN / fpsAcc);
      fpsAcc = 0;
      fpsN = 0;
    }
    if (probe) {
      probe.push(dt * 1000);
      if (probe.reduce((a, b) => a + b, 0) > 1000) {
        const avg = probe.reduce((a, b) => a + b, 0) / probe.length;
        probe = null;
        if (!forcedTier) {
          tier = tierFromProbe(avg);
          applyDpr();
          resize();
          const k = TIER[tier].particles;
          petals.points.geometry.setDrawRange(0, Math.round(60 * k));
          sparkles.points.geometry.setDrawRange(0, Math.round(80 * k));
          document.body.classList.toggle('q-high', tier === 'high');
          applyTierExtras();
        }
      }
    }
    raf = requestAnimationFrame(frame);
  };
  // low tier: shadows off (materials recompile once) and half the grass
  const grassFull = grassMeshes.map((g) => g.count);
  function applyTierExtras() {
    const low = tier === 'low';
    grassMeshes.forEach((g, i) => (g.count = Math.round(grassFull[i] * (low ? 0.5 : 1))));
    if (renderer.shadowMap.enabled === !low) return;
    renderer.shadowMap.enabled = !low;
    sun.castShadow = !low;
    scene.traverse((o) => {
      const m = (o as Mesh).material as Material | Material[] | undefined;
      if (m) (Array.isArray(m) ? m : [m]).forEach((x) => (x.needsUpdate = true));
    });
  }
  applyTierExtras();
  if (forcedTier) {
    const k = TIER[forcedTier].particles;
    petals.points.geometry.setDrawRange(0, Math.round(60 * k));
    sparkles.points.geometry.setDrawRange(0, Math.round(80 * k));
    document.body.classList.toggle('q-high', forcedTier === 'high');
  }

  let raf = requestAnimationFrame(frame);
  document.addEventListener('visibilitychange', () => {
    cancelAnimationFrame(raf);
    if (!document.hidden) {
      last = -1;
      raf = requestAnimationFrame(frame);
    }
  });

  return {
    setTarget: (p) => {
      target = MathUtils.clamp(p, 0, LAST);
    },
    jump: (p) => {
      target = cp = MathUtils.clamp(p, 0, LAST);
    },
    goTo: (i) => {
      target = MathUtils.clamp(i, 0, LAST);
    },
    openDrapes: () => {
      openStart = last < 0 ? 0 : last;
      probe = [];
    },
    info: () => ({tier, calls: renderer.info.render.calls, triangles: renderer.info.render.triangles, fps}),
  };
};

