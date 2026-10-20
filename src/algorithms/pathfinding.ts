import type { Biome } from '../types/world';

class MinHeap {
  private data: Array<[number, number, number]> = [];

  push(value: [number, number, number]): void {
    this.data.push(value);
    this.bubbleUp(this.data.length - 1);
  }

  pop(): [number, number, number] | undefined {
    if (this.data.length === 0) {
      return undefined;
    }

    const first = this.data[0];
    const last = this.data.pop();

    if (this.data.length > 0 && last) {
      this.data[0] = last;
      this.bubbleDown(0);
    }

    return first;
  }

  get length(): number {
    return this.data.length;
  }

  private bubbleUp(index: number): void {
    let current = index;
    while (current > 0) {
      const parent = Math.floor((current - 1) / 2);
      if (this.data[parent][0] <= this.data[current][0]) {
        break;
      }
      [this.data[parent], this.data[current]] = [this.data[current], this.data[parent]];
      current = parent;
    }
  }

  private bubbleDown(index: number): void {
    let current = index;
    while (true) {
      const leftChild = current * 2 + 1;
      const rightChild = current * 2 + 2;
      let swapIndex = -1;

      if (leftChild < this.data.length && this.data[leftChild][0] < this.data[current][0]) {
        swapIndex = leftChild;
      }

      if (
        rightChild < this.data.length &&
        this.data[rightChild][0] < (swapIndex === -1 ? this.data[current][0] : this.data[leftChild][0])
      ) {
        swapIndex = rightChild;
      }

      if (swapIndex === -1) {
        break;
      }

      [this.data[current], this.data[swapIndex]] = [this.data[swapIndex], this.data[current]];
      current = swapIndex;
    }
  }
}

function getNeighbors(index: number, width: number, height: number): number[] {
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
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        neighbors.push(ny * width + nx);
      }
    }
  }

  return neighbors;
}

function octileDistance(fromX: number, fromY: number, toX: number, toY: number): number {
  const dx = Math.abs(toX - fromX);
  const dy = Math.abs(toY - fromY);
  const diagonal = Math.min(dx, dy);
  const straight = Math.abs(dx - dy);
  return diagonal * Math.SQRT2 + straight;
}

export function findPath(
  biomes: Biome[],
  _elevation: Float32Array,
  width: number,
  height: number,
  start: number,
  goal: number,
): number[] {
  if (!Number.isInteger(start) || !Number.isInteger(goal)) {
    throw new Error('Start and goal indices must be integers.');
  }

  if (start < 0 || goal < 0 || start >= biomes.length || goal >= biomes.length) {
    throw new Error('Start and goal must be valid indices within the map.');
  }

  if (width <= 0 || height <= 0) {
    throw new Error('World dimensions must be positive.');
  }

  if (start === goal) {
    return [start];
  }

  if (biomes[start] === 'ocean' || biomes[goal] === 'ocean') {
    return [];
  }

  const openHeap = new MinHeap();
  const gScore = new Map<number, number>();
  const cameFrom = new Map<number, number>();
  const closed = new Set<number>();

  const startX = start % width;
  const startY = Math.floor(start / width);
  const goalX = goal % width;
  const goalY = Math.floor(goal / width);

  gScore.set(start, 0);
  openHeap.push([octileDistance(startX, startY, goalX, goalY), 0, start]);

  while (openHeap.length > 0) {
    const entry = openHeap.pop();
    if (!entry) {
      break;
    }

    const [, _currentCost, currentIndex] = entry;
    if (closed.has(currentIndex)) {
      continue;
    }

    if (currentIndex === goal) {
      const route: number[] = [];
      let cursor = goal;
      while (cursor !== start) {
        route.push(cursor);
        const previous = cameFrom.get(cursor);
        if (previous === undefined) {
          return [];
        }
        cursor = previous;
      }
      route.push(start);
      route.reverse();
      return route;
    }

    closed.add(currentIndex);

    for (const neighbor of getNeighbors(currentIndex, width, height)) {
      if (closed.has(neighbor) || biomes[neighbor] === 'ocean') {
        continue;
      }

      const dx = Math.abs((neighbor % width) - (currentIndex % width));
      const dy = Math.abs(Math.floor(neighbor / width) - Math.floor(currentIndex / width));
      const stepCost = dx === 0 || dy === 0 ? 1 : Math.SQRT2;
      const tentative = (gScore.get(currentIndex) ?? Infinity) + stepCost;

      if (tentative < (gScore.get(neighbor) ?? Infinity)) {
        cameFrom.set(neighbor, currentIndex);
        gScore.set(neighbor, tentative);
        const estimated = tentative + octileDistance(
          neighbor % width,
          Math.floor(neighbor / width),
          goalX,
          goalY,
        );
        openHeap.push([estimated, tentative, neighbor]);
      }
    }
  }

  return [];
}
