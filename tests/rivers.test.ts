import { describe, expect, it } from 'vitest';
import { generateWorld } from '../src/algorithms/generateWorld';

describe('rivers', () => {
  it('generates valid river paths', () => {
    const world = generateWorld({ seed: 1024, width: 64, height: 48 });
    expect(world.rivers.length).toBeGreaterThan(0);

    for (const river of world.rivers) {
      expect(river.length).toBeGreaterThanOrEqual(4);
      const uniqueSet = new Set(river);
      expect(uniqueSet.size).toBe(river.length);
      expect(river.every((cell) => cell >= 0 && cell < world.biomes.length)).toBe(true);
    }
  });
});
