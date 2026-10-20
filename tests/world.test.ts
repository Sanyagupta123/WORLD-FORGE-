import { describe, expect, it } from 'vitest';
import { generateWorld, validateWorldConfig } from '../src/algorithms/generateWorld';

describe('world generation', () => {
  it('creates deterministic worlds', () => {
    const config = { seed: 3721, width: 48, height: 32 };
    const worldA = generateWorld(config);
    const worldB = generateWorld(config);

    expect(Array.from(worldA.elevation)).toEqual(Array.from(worldB.elevation));
    expect(Array.from(worldA.moisture)).toEqual(Array.from(worldB.moisture));
    expect(worldA.biomes).toEqual(worldB.biomes);
    expect(worldA.rivers).toEqual(worldB.rivers);
  });

  it('validates dimensions and seeds', () => {
    expect(() => validateWorldConfig({ seed: 123, width: 12, height: 32 })).toThrow();
    expect(() => validateWorldConfig({ seed: 1.2, width: 32, height: 32 })).toThrow();
  });
});
