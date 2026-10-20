import { classifyBiomes } from './biomes';
import { fbm2D } from './noise';
import { createRandom, normalizeSeed } from './random';
import { generateRivers } from './rivers';
import type { WorldConfig, WorldData } from '../types/world';

export const GENERATOR_VERSION = '1.0.0';

export function validateWorldConfig(config: WorldConfig): void {
  if (!Number.isInteger(config.seed) || !Number.isSafeInteger(config.seed)) {
    throw new Error('Seed must be a safe integer.');
  }

  if (!Number.isInteger(config.width) || !Number.isInteger(config.height)) {
    throw new Error('World dimensions must be integers.');
  }

  if (config.width < 16 || config.height < 16) {
    throw new Error('World dimensions must be at least 16x16.');
  }

  if (config.width > 300 || config.height > 200) {
    throw new Error('World dimensions are above the supported maximum.');
  }

  normalizeSeed(config.seed);
}

function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

export function generateWorld(config: WorldConfig): WorldData {
  validateWorldConfig(config);

  const { width, height, seed } = config;
  const elevation = new Float32Array(width * height);
  const moisture = new Float32Array(width * height);

  const baseRng = createRandom(seed ^ 0x4f1bbcdc);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = y * width + x;
      const nx = x / width;
      const ny = y / height;
      const dx = nx - 0.5;
      const dy = ny - 0.5;
      const radialDistance = Math.hypot(dx, dy) / Math.hypot(0.5, 0.5);
      const landMask = 1 - Math.min(1, radialDistance * 1.45);

      const elevationNoise =
        fbm2D(nx * 4.4 + baseRng(), ny * 4.4 + baseRng(), seed + 11, 5) * 0.75 +
        fbm2D(nx * 12.3 + 3.47, ny * 12.3 + 2.91, seed + 29, 4) * 0.25;
      const moistureNoise =
        fbm2D(nx * 5.2 + 5.8, ny * 5.2 + 2.3, seed + 103, 5) * 0.7 +
        fbm2D(nx * 14.8 + 7.1, ny * 14.8 + 9.8, seed + 177, 4) * 0.3;

      const terrainValue = clamp((elevationNoise * landMask + 0.18) * 1.2 - 0.12, 0, 1);
      elevation[index] = clamp(terrainValue, 0, 1);
      moisture[index] = clamp(moistureNoise * (1.1 - radialDistance * 0.8) + 0.12, 0, 1);
    }
  }

  const biomes = classifyBiomes(elevation, moisture);
  const rivers = generateRivers(elevation, biomes, width, height, seed + 377);

  return {
    config: { seed, width, height },
    elevation,
    moisture,
    biomes,
    rivers,
    generatorVersion: GENERATOR_VERSION,
  };
}
