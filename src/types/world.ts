export type Biome =
  | 'ocean'
  | 'beach'
  | 'grassland'
  | 'forest'
  | 'desert'
  | 'tundra'
  | 'mountain'
  | 'snow';

export type WorldConfig = {
  seed: number;
  width: number;
  height: number;
};

export type WorldData = {
  config: WorldConfig;
  elevation: Float32Array;
  moisture: Float32Array;
  biomes: Biome[];
  rivers: number[][];
  generatorVersion: string;
};

export type WorldStats = {
  seed: number;
  width: number;
  height: number;
  totalCells: number;
  landPercent: number;
  oceanPercent: number;
  biomeCounts: Record<Biome, number>;
  riverCount: number;
  routeLength?: number;
};

export type LayerMode = 'biomes' | 'elevation' | 'moisture';

export type SelectedCell = {
  x: number;
  y: number;
  index: number;
} | null;
