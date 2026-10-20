import { forwardRef, useEffect, useRef } from 'react';
import { BIOME_COLORS } from '../algorithms/biomes';
import type { Biome, SelectedCell, WorldData } from '../types/world';

export type WorldCanvasProps = {
  world: WorldData;
  layer: 'biomes' | 'elevation' | 'moisture';
  route: number[];
  start: number | null;
  goal: number | null;
  selectedCell: SelectedCell;
  onCellClick: (index: number, x: number, y: number) => void;
};

const ROUTE_COLOR = [255, 211, 92] as const;
const RIVER_COLOR = [98, 186, 255] as const;
const START_COLOR = [85, 255, 163] as const;
const GOAL_COLOR = [255, 100, 100] as const;

const clamp = (value: number, min = 0, max = 1): number => Math.min(max, Math.max(min, value));

export const WorldCanvas = forwardRef<HTMLCanvasElement, WorldCanvasProps>(
  ({ world, layer, route, start, goal, selectedCell, onCellClick }, ref) => {
    const internalCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const canvasRef = (ref as React.RefObject<HTMLCanvasElement> | undefined) ?? internalCanvasRef;

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }

      const width = world.config.width;
      const height = world.config.height;
      const pixels = new Uint8ClampedArray(width * height * 4);
      const routeSet = new Set(route);
      const riverSet = new Set(world.rivers.flat());

      for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
          const index = y * width + x;
          let color: [number, number, number];

          if (layer === 'biomes') {
            color = BIOME_COLORS[world.biomes[index] as Biome];
          } else if (layer === 'elevation') {
            const elevation = clamp(world.elevation[index]);
            const brightness = Math.round(elevation * 255);
            color = [brightness, brightness, brightness];
          } else {
            const moisture = clamp(world.moisture[index]);
            const tone = Math.round(moisture * 255);
            color = [tone, 120 + Math.round(tone * 0.3), 255 - Math.round(tone * 0.3)];
          }

          const pixelOffset = index * 4;

          if (routeSet.has(index)) {
            color = [...ROUTE_COLOR] as [number, number, number];
          }

          if (riverSet.has(index) && !routeSet.has(index)) {
            color = [...RIVER_COLOR] as [number, number, number];
          }

          if (start === index) {
            color = [...START_COLOR] as [number, number, number];
          }

          if (goal === index) {
            color = [...GOAL_COLOR] as [number, number, number];
          }

          if (selectedCell && selectedCell.index === index) {
            color = [
              Math.min(255, color[0] + 30),
              Math.min(255, color[1] + 30),
              Math.min(255, color[2] + 30),
            ];
          }

          pixels[pixelOffset] = color[0];
          pixels[pixelOffset + 1] = color[1];
          pixels[pixelOffset + 2] = color[2];
          pixels[pixelOffset + 3] = 255;
        }
      }

      const imageData = new ImageData(pixels, width, height);
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return;
      }

      canvas.width = width;
      canvas.height = height;
      ctx.putImageData(imageData, 0, 0);
    }, [world, layer, route, start, goal, selectedCell]);

    const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const scaleX = event.currentTarget.width / rect.width;
      const scaleY = event.currentTarget.height / rect.height;
      const x = Math.max(0, Math.min(world.config.width - 1, Math.floor((event.clientX - rect.left) * scaleX)));
      const y = Math.max(0, Math.min(world.config.height - 1, Math.floor((event.clientY - rect.top) * scaleY)));
      const index = y * world.config.width + x;
      onCellClick(index, x, y);
    };

    return (
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        style={{ width: '100%', height: 'auto', display: 'block', cursor: 'crosshair', background: '#0c1221' }}
        aria-label="World map canvas"
      />
    );
  },
);

WorldCanvas.displayName = 'WorldCanvas';
