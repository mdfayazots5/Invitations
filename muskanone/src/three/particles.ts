import {AdditiveBlending, BufferAttribute, BufferGeometry, NormalBlending, Points, ShaderMaterial, Vector3} from 'three';

/**
 * Petals (Nikah) and gold sparkles (Valima / countdown) as Points with a custom shader:
 * size attenuation, rotation, a sine drift while falling (petals) or rising (sparkles).
 * Positions wrap inside a box around the camera in the shader, so they never run out.
 * `amount` (0…1) fades the whole system in and out by station.
 */
export const createParticles = (kind: 'petals' | 'sparkles', count: number) => {
  const box = new Vector3(18, 14, 22);
  const seed = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) seed.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);
  const geo = new BufferGeometry();
  geo.setAttribute('position', new BufferAttribute(new Float32Array(count * 3), 3));
  geo.setAttribute('aSeed', new BufferAttribute(seed, 4));
  const petals = kind === 'petals';
  const mat = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: petals ? NormalBlending : AdditiveBlending,
    toneMapped: false,
    uniforms: {uTime: {value: 0}, uCam: {value: new Vector3()}, uBox: {value: box}, uAmount: {value: 0}, uScale: {value: 300}},
    vertexShader: /* glsl */ `
      attribute vec4 aSeed;
      uniform float uTime, uScale; uniform vec3 uCam, uBox;
      varying float vRot; varying float vSeed;
      void main() {
        vec3 p = aSeed.xyz * uBox;
        ${
          petals
            ? `p.y -= uTime * (0.55 + aSeed.w * 0.5);   // fall
               p.x += sin(uTime * 0.7 + aSeed.w * 30.0) * 0.9 + uTime * 0.25;  // drift`
            : `p.y += uTime * (0.25 + aSeed.w * 0.3);   // float up
               p.x += sin(uTime * 0.5 + aSeed.w * 20.0) * 0.5;`
        }
        // wrap around the camera
        p = mod(p - uCam + uBox * 0.5, uBox) - uBox * 0.5 + uCam;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = (${petals ? '0.22' : '0.12'} + aSeed.w * ${petals ? '0.12' : '0.1'}) * uScale / -mv.z;
        vRot = uTime * (0.8 + aSeed.w) + aSeed.x * 6.28;
        vSeed = aSeed.w;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uAmount, uTime;
      varying float vRot; varying float vSeed;
      void main() {
        vec2 q = gl_PointCoord - 0.5;
        ${
          petals
            ? `float c = cos(vRot), s = sin(vRot);
               q = mat2(c, -s, s, c) * q;
               float d = length(q / vec2(0.5, 0.28));
               if (d > 1.0) discard;
               vec3 col = mix(vec3(0.95, 0.66, 0.71), vec3(0.97, 0.79, 0.79), vSeed);
               col += 0.12 * (1.0 - d);
               gl_FragColor = vec4(col, (1.0 - smoothstep(0.8, 1.0, d)) * 0.9 * uAmount);`
            : `float d = length(q) * 2.0;
               float core = exp(-d * d * 9.0);
               float tw = 0.55 + 0.45 * sin(uTime * 3.0 + vSeed * 40.0);
               vec3 col = vec3(1.0, 0.86, 0.55) * (core + exp(-d * 3.0) * 0.35);
               gl_FragColor = vec4(col * tw * uAmount, 1.0);`
        }
      }`,
  });
  const points = new Points(geo, mat);
  points.frustumCulled = false;
  return {
    points,
    update: (t: number, cam: Vector3, amount: number, scale: number) => {
      mat.uniforms.uTime.value = t;
      mat.uniforms.uCam.value.copy(cam);
      mat.uniforms.uAmount.value = amount;
      mat.uniforms.uScale.value = scale;
      points.visible = amount > 0.01;
    },
  };
};
