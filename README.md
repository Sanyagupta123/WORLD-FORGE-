# WorldForge

WorldForge is a procedural 2D world-generation studio built with React, TypeScript, Vite, and HTML Canvas. It generates reproducible terrain from numeric seeds, exposes elevation and moisture maps, classifies eight biome types, draws downhill rivers, and runs A* pathfinding across traversable land.

## Features

- Deterministic seed-based generation
- Elevation and moisture fields
- Eight biome classifications
- River generation using downhill routing
- Biomes, elevation, and moisture visualization layers
- Route selection across land using A*
- PNG and JSON export
- Automated tests with Vitest

## Technology Stack

- React + TypeScript
- Vite
- Canvas rendering
- Custom xorshift-based RNG
- Value noise and fractal Brownian motion
- A* pathfinding with binary heap
- Vitest + Testing Library
- Lucide React icons

## Installation

```bash
npm install
```

### Windows PowerShell

```powershell
npm install
npm run dev
```

### Git Bash

```bash
npm install
npm run dev
```

## Development

```bash
npm run dev -- --host 0.0.0.0
```

## Test Commands

```bash
npm test
npm run build
```

## How seeded generation works

The generator validates an integer seed and size constraints, then synthesizes elevation and moisture with fractal noise. A radial island mask approximates coastlines and landmasses while preserving reproducibility. Each world is classified into biome categories, and rivers are traced downhill through valid cells until they reach the ocean.

## A* Pathfinding

The route planner uses an eight-neighbor grid with orthogonal cost 1 and diagonal cost sqrt(2). The heuristic is the octile distance, which remains admissible for the configured movement model. Routes are rejected when endpoints are ocean cells or when no path exists.

## Notes

The project is designed to be reproducible: the same seed, dimensions, and generator version produce the same world data.
