import { normalizeSeed } from './random';

export function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function hash2D(x: number, y: number, seed: number): number {
  const normalizedSeed = normalizeSeed(seed);
  let value = normalizedSeed ^ (x * 374761393 + y * 668265263);
  value = (value ^ (value >>> 13)) * 127773;
  value = (value ^ (value >>> 16)) >>> 0;
  return (value % 1000003) / 1000003;
}

export function valueNoise2D(x: number, y: number, seed: number): number {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const xf = x - x0;
  const yf = y - y0;

  const a = hash2D(x0, y0, seed);
  const b = hash2D(x0 + 1, y0, seed);
  const c = hash2D(x0, y0 + 1, seed);
  const d = hash2D(x0 + 1, y0 + 1, seed);

  const ux = smoothstep(0, 1, xf);
  const uy = smoothstep(0, 1, yf);

  const x1 = lerp(a, b, ux);
  const x2 = lerp(c, d, ux);
  return lerp(x1, x2, uy);
}

export function fbm2D(
  x: number,
  y: number,
  seed: number,
  octaves = 5,
  lacunarity = 2,
  persistence = 0.5,
): number {
  let total = 0;
  let amplitude = 0.5;
  let frequency = 1;
  let normalization = 0;

  for (let octave = 0; octave < octaves; octave += 1) {
    total += valueNoise2D(x * frequency, y * frequency, seed + octave * 97) * amplitude;
    normalization += amplitude;
    frequency *= lacunarity;
    amplitude *= persistence;
  }

  return total / normalization;
}
