import { useMemo, useRef, useState } from 'react';
import { AlertTriangle, Compass, Droplets, MapPinned, Mountain, Route } from 'lucide-react';
import { generateWorld } from './algorithms/generateWorld';
import { findPath } from './algorithms/pathfinding';
import { computeWorldStats } from './algorithms/statistics';
import { Controls } from './components/Controls';
import { Legend } from './components/Legend';
import { StatsPanel } from './components/StatsPanel';
import { WorldCanvas } from './components/WorldCanvas';
import type { LayerMode, SelectedCell, WorldData } from './types/world';

const DEFAULT_SEED = 1337;
const DEFAULT_WIDTH = 120;
const DEFAULT_HEIGHT = 80;

function App() {
  const [seedInput, setSeedInput] = useState<number>(DEFAULT_SEED);
  const [width, setWidth] = useState<number>(DEFAULT_WIDTH);
  const [height, setHeight] = useState<number>(DEFAULT_HEIGHT);
  const [layer, setLayer] = useState<LayerMode>('biomes');
  const [world, setWorld] = useState<WorldData>(() =>
    generateWorld({ seed: DEFAULT_SEED, width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT }),
  );
  const [route, setRoute] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedCell, setSelectedCell] = useState<SelectedCell>(null);
  const [startCell, setStartCell] = useState<number | null>(null);
  const [goalCell, setGoalCell] = useState<number | null>(null);
  const [status, setStatus] = useState<string>('Ready');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const stats = useMemo(() => computeWorldStats(world, route.length), [world, route.length]);

  const generateCurrentWorld = (nextSeed: number, nextWidth: number, nextHeight: number) => {
    try {
      const nextWorld = generateWorld({ seed: nextSeed, width: nextWidth, height: nextHeight });
      setWorld(nextWorld);
      setRoute([]);
      setStartCell(null);
      setGoalCell(null);
      setSelectedCell(null);
      setError(null);
      setStatus(`Generated ${nextWorld.config.width}×${nextWorld.config.height} world`);
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : 'Unable to generate the world.');
    }
  };

  const handleGenerate = () => {
    generateCurrentWorld(seedInput, width, height);
  };

  const handleRandomize = () => {
    const nextSeed = Math.floor(Math.random() * 2147483647) - 1073741824;
    setSeedInput(nextSeed);
    generateCurrentWorld(nextSeed, width, height);
  };

  const handleCellClick = (index: number, x: number, y: number) => {
    const biome = world.biomes[index];
    setSelectedCell({ x, y, index });

    if (biome === 'ocean') {
      setError('Ocean cells cannot be used as route endpoints.');
      return;
    }

    if (startCell === null) {
      setStartCell(index);
      setGoalCell(null);
      setError(null);
      setStatus(`Start set at ${x}, ${y}`);
      return;
    }

    if (goalCell === null) {
      const path = findPath(world.biomes, world.elevation, world.config.width, world.config.height, startCell, index);
      if (path.length === 0) {
        setError('No valid route exists between those land cells.');
        setRoute([]);
        setGoalCell(null);
        setStatus('Route unavailable');
        return;
      }

      setGoalCell(index);
      setRoute(path);
      setError(null);
      setStatus(`Route found with ${path.length} cells`);
      return;
    }

    setStartCell(index);
    setGoalCell(null);
    setRoute([]);
    setError(null);
    setStatus(`Start set at ${x}, ${y}`);
  };

  const handleExportPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      setError('Map canvas is unavailable for export.');
      return;
    }

    const link = document.createElement('a');
    link.download = `worldforge-seed-${world.config.seed}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    setStatus('PNG export created');
  };

  const handleExportJson = () => {
    const payload = {
      generatorVersion: world.generatorVersion,
      seed: world.config.seed,
      width: world.config.width,
      height: world.config.height,
      elevation: Array.from(world.elevation),
      moisture: Array.from(world.moisture),
      biomes: world.biomes,
      rivers: world.rivers,
      route,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `worldforge-seed-${world.config.seed}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    setStatus('JSON export created');
  };

  const routeCost = route.length > 1
    ? route.reduce((acc, index, currentIndex) => {
        if (currentIndex === 0) {
          return acc;
        }
        const previous = route[currentIndex - 1];
        const px = previous % world.config.width;
        const py = Math.floor(previous / world.config.width);
        const cx = index % world.config.width;
        const cy = Math.floor(index / world.config.width);
        const dx = Math.abs(cx - px);
        const dy = Math.abs(cy - py);
        const step = dx === 0 || dy === 0 ? 1 : Math.SQRT2;
        return acc + step;
      }, 0)
    : 0;

  const selectedCellData = selectedCell
    ? {
        x: selectedCell.x,
        y: selectedCell.y,
        biome: world.biomes[selectedCell.index],
        elevation: world.elevation[selectedCell.index],
        moisture: world.moisture[selectedCell.index],
        onRiver: world.rivers.some((river) => river.includes(selectedCell.index)),
        onRoute: route.includes(selectedCell.index),
      }
    : null;

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">One seed. A whole new world.</p>
          <h1>WorldForge</h1>
        </div>
        <div className="topbar-meta">
          <span>Seed: {world.config.seed}</span>
          <span>{world.config.width} × {world.config.height}</span>
          <span>{status}</span>
        </div>
      </header>

      <main className="workspace-grid">
        <section className="primary-panel">
          <div className="controls-wrap">
            <Controls
              seed={seedInput}
              width={width}
              height={height}
              layer={layer}
              onSeedChange={setSeedInput}
              onWidthChange={setWidth}
              onHeightChange={setHeight}
              onLayerChange={setLayer}
              onGenerate={handleGenerate}
              onRandomize={handleRandomize}
              onClearRoute={() => {
                setRoute([]);
                setStartCell(null);
                setGoalCell(null);
                setError(null);
                setStatus('Route cleared');
              }}
              onExportPng={handleExportPng}
              onExportJson={handleExportJson}
              canGenerate={Number.isFinite(seedInput)}
            />
            {error && (
              <div className="error-banner">
                <AlertTriangle size={16} /> {error}
              </div>
            )}
          </div>

          <div className="canvas-card">
            <WorldCanvas
              ref={canvasRef}
              world={world}
              layer={layer}
              route={route}
              start={startCell}
              goal={goalCell}
              selectedCell={selectedCell}
              onCellClick={handleCellClick}
            />
          </div>
        </section>

        <aside className="sidebar">
          <Legend />
          <StatsPanel stats={stats} routeCount={route.length} routeCost={routeCost} />
          <div className="inspector-panel">
            <h3>Explorer</h3>
            {selectedCellData ? (
              <ul className="inspector-list">
                <li>
                  <MapPinned size={16} /> {selectedCellData.x}, {selectedCellData.y}
                </li>
                <li>
                  <Mountain size={16} /> {selectedCellData.biome}
                </li>
                <li>
                  <Compass size={16} /> Elevation: {selectedCellData.elevation.toFixed(3)}
                </li>
                <li>
                  <Droplets size={16} /> Moisture: {selectedCellData.moisture.toFixed(3)}
                </li>
                <li>
                  <Route size={16} /> River: {selectedCellData.onRiver ? 'Yes' : 'No'}
                </li>
                <li>
                  <Route size={16} /> Route: {selectedCellData.onRoute ? 'Yes' : 'No'}
                </li>
              </ul>
            ) : (
              <p>Select a map cell to inspect it.</p>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}

export default App;
