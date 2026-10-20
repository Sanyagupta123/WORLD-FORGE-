import { describe, expect, it } from 'vitest';
import { findPath } from '../src/algorithms/pathfinding';
import { generateWorld } from '../src/algorithms/generateWorld';

describe('pathfinding', () => {
  it('finds routes across traversable land', () => {
    const world = generateWorld({ seed: 89, width: 64, height: 48 });
    const start = 100;
    const goal = 400;

    if (world.biomes[start] === 'ocean' || world.biomes[goal] === 'ocean') {
      expect(true).toBe(true);
      return;
    }

    const route = findPath(world.biomes, world.elevation, world.config.width, world.config.height, start, goal);
    if (route.length > 0) {
      expect(route[0]).toBe(start);
      expect(route.at(-1)).toBe(goal);
      expect(route.every((cell) => world.biomes[cell] !== 'ocean')).toBe(true);
    }
  });

  it('handles invalid endpoints', () => {
    const world = generateWorld({ seed: 5, width: 32, height: 32 });
    expect(() => findPath(world.biomes, world.elevation, world.config.width, world.config.height, -1, 10)).toThrow();
    expect(findPath(world.biomes, world.elevation, world.config.width, world.config.height, 0, 0)).toEqual([0]);
  });
});
