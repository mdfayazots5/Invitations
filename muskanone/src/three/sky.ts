import {BackSide, Color, Mesh, ShaderMaterial, SphereGeometry, Vector3} from 'three';
import type {MixedPalette} from './stations';

/**
 * Sky dome: an inverted sphere that follows the camera, with a 3-stop gradient (top → mid → horizon),
 * a sun glow, a soft cloud band from 2-octave value noise and stars that fade in at dusk.
 * Not tone-mapped, so the brief's pastel hexes come out exactly.
 */
export const createSky = () => {
  const uniforms = {
    uTop: {value: new Color()},
    uMid: {value: new Color()},
    uHorizon: {value: new Color()},
    uSun: {value: new Color()},
    uSunDir: {value: new Vector3(0, 0.15, -1).normalize()},
    uStars: {value: 0},
    uClouds: {value: 0.6},
    uTime: {value: 0},
  };
  const material = new ShaderMaterial({
    uniforms,
    side: BackSide,
    depthWrite: false,
    fog: false,
    toneMapped: false,
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_Position = p.xyww; // always at the far plane
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uTop, uMid, uHorizon, uSun, uSunDir;
      uniform float uStars, uClouds, uTime;
      varying vec3 vDir;
      float hash(vec3 p) { return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453); }
      float noise(vec2 p) {
        vec2 i = floor(p), f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float a = hash(vec3(i, 0.0)), b = hash(vec3(i + vec2(1, 0), 0.0));
        float c = hash(vec3(i + vec2(0, 1), 0.0)), d = hash(vec3(i + vec2(1, 1), 0.0));
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }
      void main() {
        vec3 d = normalize(vDir);
        float y = d.y;
        // horizon band → mid → top
        vec3 col = mix(uHorizon, uMid, smoothstep(-0.02, 0.28, y));
        col = mix(col, uTop, smoothstep(0.22, 0.75, y));
        // below the horizon: a soft continuation of the horizon colour
        col = mix(col, uHorizon * 0.96, smoothstep(0.0, -0.2, y));
        // sun glow
        float s = max(dot(d, normalize(uSunDir)), 0.0);
        col += uSun * (pow(s, 8.0) * 0.35 + pow(s, 64.0) * 0.6);
        // soft cloud band (2 octaves), drifting slowly
        vec2 uv = vec2(atan(d.x, -d.z) * 2.2 + uTime * 0.004, y * 9.0);
        float n = noise(uv * vec2(1.6, 1.0)) * 0.65 + noise(uv * vec2(3.4, 2.1) + 7.0) * 0.35;
        float band = smoothstep(0.02, 0.12, y) * smoothstep(0.42, 0.18, y);
        col = mix(col, mix(vec3(1.0), uHorizon, 0.25), smoothstep(0.52, 0.82, n) * band * 0.55 * uClouds);
        // stars at dusk
        if (uStars > 0.0 && y > 0.12) {
          vec3 g = floor(d * 260.0);
          float h = hash(g);
          float tw = 0.6 + 0.4 * sin(uTime * 1.7 + h * 40.0);
          col += vec3(1.0, 0.95, 0.85) * step(0.9965, h) * tw * uStars * smoothstep(0.12, 0.4, y);
        }
        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
      }`,
  });
  const mesh = new Mesh(new SphereGeometry(500, 32, 16), material);
  mesh.frustumCulled = false;
  mesh.renderOrder = -1;

  return {
    mesh,
    update: (pal: MixedPalette, camPos: Vector3, t: number) => {
      uniforms.uTop.value.copy(pal.top);
      uniforms.uMid.value.copy(pal.mid);
      uniforms.uHorizon.value.copy(pal.horizon);
      uniforms.uSun.value.copy(pal.sun);
      uniforms.uSunDir.value.set(0.35, pal.sunY, -1).normalize();
      uniforms.uStars.value = pal.stars;
      uniforms.uClouds.value = pal.clouds;
      uniforms.uTime.value = t;
      mesh.position.copy(camPos);
    },
  };
};
