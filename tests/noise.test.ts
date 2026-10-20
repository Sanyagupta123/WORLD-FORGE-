import { describe, expect, it } from 'vitest';
import { fbm2D, valueNoise2D } from '../src/algorithms/noise';

describe('noise', () => {
  it('is reproducible for the same seed', () => {
    expect(valueNoise2D(3.2, 4.8, 42)).toBeCloseTo(valueNoise2D(3.2, 4.8, 42), 10);
    expect(fbm2D(0.5, 0.7, 42)).toBeCloseTo(fbm2D(0.5, 0.7, 42), 10);
  });

  it('stays in the expected range', () => {
    const value = fbm2D(1.2, 2.3, 77);
    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThanOrEqual(1);
  });
});
