import {isForcedDpr, pixelRatio} from './dpr';
import {
  AdditiveBlending,
  AmbientLight,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  DirectionalLight,
  DoubleSide,
  FogExp2,
  Group,
  InstancedMesh,
  LatheGeometry,
  Line,
  LineBasicMaterial,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  PointsMaterial,
  Scene,
  Sprite,
  SpriteMaterial,
  TorusGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';

/**
 * Night-sky 3D backdrop for the family invite: hanging gold lanterns, a crescent moon,
 * a deep star field, tumbling rose & gold petals and soft bokeh near the lens.
 * The camera glides down through the scene as the page scrolls (the auto-scroll makes it a journey).
 *
 * Budget for mid-range phones: DPR ≤ 1.5, counts scaled to the device, paused when hidden,
 * and a frame-time watchdog that sheds petals and resolution if frames get slow.
 * Returns false when WebGL is unavailable so the caller can fall back to 2D dust.
 */
export const startScene = (canvas: HTMLCanvasElement, reducedMotion: boolean): boolean => {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({
      canvas,
      antialias: false,
      alpha: true,
      powerPreference: 'low-power',
      // ?autotest: keep the frame so the phone tester's screenshots show the sky.
      preserveDrawingBuffer: location.search.includes('autotest'),
    });
  } catch {
    return false;
  }
  const cores = navigator.hardwareConcurrency || 4;
  const q = cores >= 8 ? 1 : cores >= 6 ? 0.8 : 0.6; // quality tier
  // Phones: cap at 1.5 for speed. HD video (?dpr=): render at the full requested resolution.
  let dpr = isForcedDpr ? pixelRatio() : Math.min(pixelRatio(), 1.5);
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  scene.fog = new FogExp2(0x2a0d16, 0.026);
  const camera = new PerspectiveCamera(55, 1, 0.1, 120);
  camera.position.set(0, 0, 10);

  scene.add(new AmbientLight(0x7d4f5c, 1.1));
  const key = new DirectionalLight(0xffe2a8, 2.2);
  key.position.set(4, 6, 8);
  scene.add(key);

  // ── sprites drawn once on small canvases ──
  const glowTex = (inner: string, outer: string) => {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d')!;
    const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    r.addColorStop(0, inner);
    r.addColorStop(0.35, outer);
    r.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = r;
    g.fillRect(0, 0, 64, 64);
    return new CanvasTexture(c);
  };
  const warmGlow = glowTex('rgba(255,236,190,1)', 'rgba(255,190,90,0.45)');
  const softDot = glowTex('rgba(255,248,225,1)', 'rgba(233,207,138,0.35)');

  const moonTex = (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d')!;
    // Crescent first: a disc with an offset disc cut out of it.
    g.fillStyle = '#F8E7B5';
    g.beginPath();
    g.arc(128, 128, 62, 0, Math.PI * 2);
    g.fill();
    g.globalCompositeOperation = 'destination-out';
    g.beginPath();
    g.arc(156, 112, 56, 0, Math.PI * 2);
    g.fill();
    // Then the halo *behind* it, so the cut-out reads as glowing sky, not a dark "eclipse" disc.
    g.globalCompositeOperation = 'destination-over';
    const halo = g.createRadialGradient(118, 136, 30, 128, 128, 128);
    halo.addColorStop(0, 'rgba(255,240,200,0.28)');
    halo.addColorStop(1, 'rgba(255,240,200,0)');
    g.fillStyle = halo;
    g.fillRect(0, 0, 256, 256);
    return new CanvasTexture(c);
  })();

  // ── camera rig: things attached here stay "far away" while the camera travels ──
  const rig = new Group();
  scene.add(rig);

  // Star field: a deep shell around the viewer.
  const starCount = Math.round(900 * q);
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const r = 35 + Math.random() * 40;
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    starPos.set([r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph), -Math.abs(r * Math.sin(ph) * Math.sin(th))], i * 3);
  }
  const starGeo = new BufferGeometry();
  starGeo.setAttribute('position', new BufferAttribute(starPos, 3));
  const starMat = new PointsMaterial({size: 0.35, map: softDot, color: 0xfff3d6, transparent: true, depthWrite: false, blending: AdditiveBlending, fog: false});
  const stars = new Points(starGeo, starMat);
  rig.add(stars);

  const moon = new Sprite(new SpriteMaterial({map: moonTex, transparent: true, depthWrite: false, fog: false}));
  moon.scale.set(9, 9, 1);
  moon.position.set(-6, 9, -40);
  rig.add(moon);

  // ── lanterns: faceted lathe body + crown ring + chain + warm glow ──
  const profile = [
    [0, -1.15],
    [0.22, -1.08],
    [0.48, -0.78],
    [0.6, -0.25],
    [0.56, 0.25],
    [0.38, 0.62],
    [0.18, 0.88],
    [0.08, 1.12],
    [0, 1.3],
  ].map(([x, y]) => new Vector2(x, y));
  const bodyGeo = new LatheGeometry(profile, 8);
  const ringGeo = new TorusGeometry(0.13, 0.035, 6, 12);
  const goldMat = new MeshStandardMaterial({color: 0xd4ad55, metalness: 0.85, roughness: 0.32, emissive: 0x8a5e18, emissiveIntensity: 1.15, flatShading: true});
  const chainMat = new LineBasicMaterial({color: 0xc9a24a, transparent: true, opacity: 0.6});
  const chainGeo = new BufferGeometry().setFromPoints([new Vector3(0, 1.45, 0), new Vector3(0, 7, 0)]);

  type Lantern = {g: Group; baseY: number; phase: number; spin: number};
  const lanterns: Lantern[] = [];
  const lanternCount = Math.round(13 * q);
  for (let i = 0; i < lanternCount; i++) {
    const g = new Group();
    g.add(new Mesh(bodyGeo, goldMat));
    const ring = new Mesh(ringGeo, goldMat);
    ring.position.y = 1.38;
    ring.rotation.x = Math.PI / 2;
    g.add(ring);
    g.add(new Line(chainGeo, chainMat));
    const glow = new Sprite(new SpriteMaterial({map: warmGlow, color: 0xffd27a, transparent: true, opacity: 0.95, depthWrite: false, blending: AdditiveBlending}));
    glow.scale.set(4.2, 4.2, 1);
    g.add(glow);
    // Keep lanterns off the centre column (where the text panels are) and spread down the page.
    const side = i % 2 ? 1 : -1;
    const z = -3 - Math.random() * 12;
    const spread = Math.tan(MathUtils.degToRad(27.5)) * (10 - z) * 0.6;
    g.position.set(side * (1.6 + Math.random() * spread), 6 - (i / lanternCount) * 46 + Math.random() * 3, z);
    const s = 0.55 + Math.random() * 0.45;
    g.scale.setScalar(s);
    scene.add(g);
    lanterns.push({g, baseY: g.position.y, phase: Math.random() * Math.PI * 2, spin: (Math.random() - 0.5) * 0.4});
  }

  // ── petals: one instanced, gently curved quad ──
  const petalGeo = new PlaneGeometry(0.34, 0.5, 2, 2);
  const pp = petalGeo.attributes.position as BufferAttribute;
  for (let i = 0; i < pp.count; i++) pp.setZ(i, 0.09 * (pp.getX(i) / 0.17) ** 2 - 0.04 * (pp.getY(i) / 0.25));
  petalGeo.computeVertexNormals();
  // Petal silhouette (rounded top, pointed base) with a soft centre vein, used as colour map + cut-out.
  const petalTex = (() => {
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 96;
    const g = c.getContext('2d')!;
    g.fillStyle = '#ffffff';
    g.beginPath();
    g.moveTo(32, 94);
    g.bezierCurveTo(4, 70, 0, 30, 18, 10);
    g.bezierCurveTo(26, 2, 38, 2, 46, 10);
    g.bezierCurveTo(64, 30, 60, 70, 32, 94);
    g.fill();
    const vein = g.createLinearGradient(0, 0, 64, 0);
    vein.addColorStop(0.35, 'rgba(200,170,170,0)');
    vein.addColorStop(0.5, 'rgba(200,150,155,0.35)');
    vein.addColorStop(0.65, 'rgba(200,170,170,0)');
    g.globalCompositeOperation = 'source-atop';
    g.fillStyle = vein;
    g.fillRect(0, 0, 64, 96);
    return new CanvasTexture(c);
  })();
  const petalMat = new MeshStandardMaterial({
    map: petalTex,
    alphaTest: 0.5,
    side: DoubleSide,
    roughness: 0.6,
    metalness: 0.2,
    emissive: 0x3a1a1e,
    emissiveIntensity: 0.4,
  });
  const maxPetals = Math.round(70 * q);
  const petals = new InstancedMesh(petalGeo, petalMat, maxPetals);
  const tints = [new Color(0xe9b4bc), new Color(0xf3d2d6), new Color(0xe2c27a), new Color(0xd99aa5)];
  type Petal = {x: number; y: number; z: number; vy: number; sway: number; phase: number; rx: number; ry: number; rz: number; s: number};
  const pState: Petal[] = [];
  const spawn = (p: Partial<Petal> = {}, top = false): Petal => ({
    x: (Math.random() - 0.5) * 14,
    y: camera.position.y + (top ? 8 + Math.random() * 3 : (Math.random() - 0.5) * 18),
    z: -1 - Math.random() * 9,
    vy: 0.35 + Math.random() * 0.45,
    sway: 0.3 + Math.random() * 0.5,
    phase: Math.random() * Math.PI * 2,
    rx: Math.random() * 6,
    ry: Math.random() * 6,
    rz: Math.random() * 6,
    s: 0.7 + Math.random() * 0.8,
    ...p,
  });
  for (let i = 0; i < maxPetals; i++) {
    pState.push(spawn());
    petals.setColorAt(i, tints[i % tints.length]);
  }
  scene.add(petals);

  // ── bokeh near the lens ──
  const bokehCount = Math.round(36 * q);
  const bPos = new Float32Array(bokehCount * 3);
  for (let i = 0; i < bokehCount; i++) bPos.set([(Math.random() - 0.5) * 10, (Math.random() - 0.5) * 14, 3 + Math.random() * 4], i * 3);
  const bGeo = new BufferGeometry();
  bGeo.setAttribute('position', new BufferAttribute(bPos, 3));
  const bokeh = new Points(bGeo, new PointsMaterial({size: 0.5, map: softDot, color: 0xe9cf8a, transparent: true, opacity: 0.45, depthWrite: false, blending: AdditiveBlending, fog: false}));
  rig.add(bokeh);

  // ── sizing ──
  const resize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Portrait phones: widen the vertical FOV a little so lanterns frame the column.
    camera.fov = w < h ? 60 : 50;
    camera.updateProjectionMatrix();
  };
  resize();
  window.addEventListener('resize', resize);

  const dummy = new Object3D();
  const progress = () => {
    // Pages scroll inside the fixed #app scroller, not the document.
    const app = document.getElementById('app');
    if (!app) return 0;
    const max = app.scrollHeight - app.clientHeight;
    return max > 0 ? Math.min(1, app.scrollTop / max) : 0;
  };

  let camY = 0;
  let last = performance.now();
  let raf = 0;
  let slow = 0;
  let frames = 0;
  let acc = 0;

  const frame = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const t = now / 1000;

    // Camera glides down through the lanterns as the page scrolls (eased, never jumpy).
    const target = -progress() * 40;
    camY += (target - camY) * Math.min(1, dt * 2.5);
    camera.position.set(Math.sin(t * 0.13) * 0.5, camY, 10);
    camera.rotation.z = Math.sin(t * 0.07) * 0.015;
    rig.position.set(camera.position.x * 0.9, camY * 0.97, 0); // far layer: slight parallax only
    stars.rotation.y = t * 0.004;
    bokeh.position.y = Math.sin(t * 0.2) * 0.4;

    for (const L of lanterns) {
      L.g.position.y = L.baseY + Math.sin(t * 0.6 + L.phase) * 0.25;
      L.g.rotation.y += L.spin * dt;
      L.g.rotation.z = Math.sin(t * 0.5 + L.phase) * 0.04;
    }

    for (let i = 0; i < petals.count; i++) {
      const p = pState[i];
      p.y -= p.vy * dt;
      p.x += Math.sin(t * p.sway + p.phase) * 0.004;
      p.rx += dt * 0.9;
      p.ry += dt * 0.6;
      p.rz += dt * 0.4;
      if (p.y < camera.position.y - 10) pState[i] = spawn({}, true);
      dummy.position.set(p.x, p.y, p.z);
      dummy.rotation.set(p.rx, p.ry, p.rz);
      dummy.scale.setScalar(p.s);
      dummy.updateMatrix();
      petals.setMatrixAt(i, dummy.matrix);
    }
    petals.instanceMatrix.needsUpdate = true;

    renderer.render(scene, camera);

    // Watchdog: if the device struggles, shed petals and resolution once or twice.
    acc += dt;
    frames++;
    if (frames === 90) {
      if (acc / frames > 0.024 && slow < 2 && !isForcedDpr) {
        slow++;
        petals.count = Math.max(16, Math.round(petals.count / 2));
        dpr = Math.max(0.75, dpr * 0.75);
        renderer.setPixelRatio(dpr);
        resize();
      }
      frames = 0;
      acc = 0;
    }
    raf = requestAnimationFrame(frame);
  };

  if (reducedMotion) {
    renderer.render(scene, camera);
    document.getElementById('app')?.addEventListener('scroll', () => {
      camY = -progress() * 40;
      camera.position.y = camY;
      rig.position.y = camY * 0.97;
      renderer.render(scene, camera);
    });
  } else {
    raf = requestAnimationFrame(frame);
    document.addEventListener('visibilitychange', () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    });
  }
  canvas.classList.add('on');
  return true;
};
