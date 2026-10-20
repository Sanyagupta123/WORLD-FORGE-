import { BIOME_ORDER } from './biomes';
import type { Biome, WorldData, WorldStats } from '../types/world';

export function computeWorldStats(world: WorldData, routeLength?: number): WorldStats {
  const biomeCounts = BIOME_ORDER.reduce(
    (acc, biome) => ({ ...acc, [biome]: 0 }),
    {} as Record<Biome, number>,
  );

  for (const biome of world.biomes) {
    biomeCounts[biome] += 1;
  }

  const totalCells = world.elevation.length;
  const oceanCount = biomeCounts.ocean;
  const landCount = totalCells - oceanCount;

  return {
    seed: world.config.seed,
    width: world.config.width,
    height: world.config.height,
    totalCells,
    landPercent: (landCount / totalCells) * 100,
    oceanPercent: (oceanCount / totalCells) * 100,
    biomeCounts,
    riverCount: world.rivers.length,
    routeLength,
  };
}
