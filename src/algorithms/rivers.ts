import { createRandom } from './random';
import type { Biome } from '../types/world';

function getNeighborIndices(index: number, width: number, height: number): number[] {
  const x = index % width;
  const y = Math.floor(index / width);
  const neighbors: number[] = [];

  for (let dy = -1; dy <= 1; dy += 1) {
    for (let dx = -1; dx <= 1; dx += 1) {
      if (dx === 0 && dy === 0) {
        continue;
      }

      const nx = x + dx;
      const ny = y + dy;

      if (nx < 0 || nx >= width || ny < 0 || ny >= height) {
        continue;
      }

      neighbors.push(ny * width + nx);
    }
  }

  return neighbors;
}

export function generateRivers(
  elevation: Float32Array,
  biomes: Biome[],
  width: number,
  height: number,
  seed: number,
): number[][] {
  if (width <= 0 || height <= 0) {
    throw new Error('World dimensions must be positive.');
  }

  if (elevation.length !== width * height || biomes.length !== width * height) {
    throw new Error('Elevation and biome arrays must match the world dimensions.');
  }

  const sources: number[] = [];
  for (let index = 0; index < biomes.length; index += 1) {
    if (biomes[index] !== 'ocean' && elevation[index] > 0.45) {
      sources.push(index);
    }
  }

  const rng = createRandom(seed ^ 0x9e3779b9);
  const rivers: number[][] = [];
  const usedCells = new Set<number>();
  const maxRivers = Math.min(8, Math.max(2, Math.floor(Math.sqrt(width * height) / 4)));

  let attempts = 0;
  while (rivers.length < maxRivers && sources.length > 0 && attempts < sources.length * 8) {
    attempts += 1;
    const pickIndex = Math.floor(rng() * sources.length);
    const source = sources.splice(pickIndex, 1)[0];

    if (source === undefined || usedCells.has(source)) {
      continue;
    }

    const path: number[] = [source];
    const visited = new Set<number>([source]);
    let current = source;
    let previous = -1;
    let terminated = false;

    for (let step = 0; step < 250; step += 1) {
      const neighbors = getNeighborIndices(current, width, height)
        .filter((neighbor) => neighbor !== previous)
        .filter((neighbor) => !visited.has(neighbor));

      if (neighbors.length === 0) {
        break;
      }

      let bestNeighbor: number | null = null;
      let bestElevation = Number.POSITIVE_INFINITY;

      for (const neighbor of neighbors) {
        const neighborElevation = elevation[neighbor];
        const isOcean = biomes[neighbor] === 'ocean';

        if (isOcean) {
          if (neighborElevation < bestElevation || bestNeighbor === null) {
            bestNeighbor = neighbor;
            bestElevation = neighborElevation;
          }
          continue;
        }

        if (neighborElevation < bestElevation) {
          bestNeighbor = neighbor;
          bestElevation = neighborElevation;
        }
      }

      if (bestNeighbor === null) {
        break;
      }

      const next = bestNeighbor;
      visited.add(next);
      path.push(next);
      previous = current;
      current = next;

      if (biomes[next] === 'ocean') {
        terminated = true;
        break;
      }
    }

    if (terminated && path.length >= 4) {
      const uniquePath = [...new Set(path)];
      if (uniquePath.length >= 4) {
        for (const cell of uniquePath) {
          usedCells.add(cell);
        }
        rivers.push(uniquePath);
      }
    }
  }

  return rivers;
}
