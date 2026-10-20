export function normalizeSeed(seed: number): number {
  if (!Number.isInteger(seed) || !Number.isSafeInteger(seed)) {
    throw new Error('Seed must be a safe integer value.');
  }

  if (seed < -2147483648 || seed > 2147483647) {
    throw new Error('Seed out of range. Use a 32-bit integer seed.');
  }

  return seed >>> 0;
}

export function createRandom(seed: number): () => number {
  const value = normalizeSeed(seed) || 1;
  let state = value >>> 0;

  return () => {
    state ^= state << 13;
    state ^= state >>> 7;
    state ^= state << 17;
    return (state >>> 0) / 4294967296;
  };
}
