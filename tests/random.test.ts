import { describe, expect, it } from 'vitest';
import { createRandom } from '../src/algorithms/random';

describe('random', () => {
  it('returns the same sequence for the same seed', () => {
    const a = createRandom(1234);
    const b = createRandom(1234);

    expect(Array.from({ length: 20 }, a)).toEqual(Array.from({ length: 20 }, b));
  });

  it('returns values in [0, 1)', () => {
    const random = createRandom(0);
    for (let i = 0; i < 100; i += 1) {
      const value = random();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});
