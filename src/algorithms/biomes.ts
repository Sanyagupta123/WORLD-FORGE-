import type { Biome } from '../types/world';

export const BIOME_ORDER: Biome[] = [
  'ocean',
  'beach',
  'grassland',
  'forest',
  'desert',
  'tundra',
  'mountain',
  'snow',
];

export const BIOME_COLORS: Record<Biome, [number, number, number]> = {
  ocean: [26, 54, 110],
  beach: [203, 170, 120],
  grassland: [98, 160, 90],
  forest: [46, 102, 62],
  desert: [199, 169, 102],
  tundra: [140, 156, 167],
  mountain: [106, 109, 116],
  snow: [240, 244, 248],
};

export function classifyBiomes(
  elevation: Float32Array,
  moisture: Float32Array,
): Biome[] {
  if (elevation.length !== moisture.length) {
    throw new Error('Elevation and moisture arrays must be the same length.');
  }

  const biomes: Biome[] = new Array(elevation.length);

  for (let i = 0; i < elevation.length; i += 1) {
    const elevationValue = elevation[i];
    const moistureValue = moisture[i];

    if (elevationValue < 0.32) {
      biomes[i] = 'ocean';
    } else if (elevationValue < 0.36) {
      biomes[i] = 'beach';
    } else if (elevationValue >= 0.82) {
      biomes[i] = 'snow';
    } else if (elevationValue >= 0.68) {
      biomes[i] = 'mountain';
    } else if (moistureValue < 0.22) {
      biomes[i] = 'desert';
    } else if (moistureValue > 0.68) {
      biomes[i] = 'forest';
    } else if (elevationValue < 0.55 && moistureValue < 0.46) {
      biomes[i] = 'tundra';
    } else {
      biomes[i] = 'grassland';
    }
  }

  return biomes;
}
