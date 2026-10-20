import type { ChangeEvent } from 'react';
import { Dice5, Download, Map, Sparkles } from 'lucide-react';
import type { LayerMode } from '../types/world';

export type ControlsProps = {
  seed: number;
  width: number;
  height: number;
  layer: LayerMode;
  onSeedChange: (value: number) => void;
  onWidthChange: (value: number) => void;
  onHeightChange: (value: number) => void;
  onLayerChange: (value: LayerMode) => void;
  onGenerate: () => void;
  onRandomize: () => void;
  onClearRoute: () => void;
  onExportPng: () => void;
  onExportJson: () => void;
  canGenerate: boolean;
};

export function Controls({
  seed,
  width,
  height,
  layer,
  onSeedChange,
  onWidthChange,
  onHeightChange,
  onLayerChange,
  onGenerate,
  onRandomize,
  onClearRoute,
  onExportPng,
  onExportJson,
  canGenerate,
}: ControlsProps) {
  const handleSeedInput = (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    if (Number.isNaN(value)) {
      return;
    }
    onSeedChange(value);
  };

  return (
    <div className="controls-panel">
      <div className="control-grid">
        <label className="field">
          <span>Seed</span>
          <input type="number" value={seed} onChange={handleSeedInput} />
        </label>

        <label className="field">
          <span>Width</span>
          <input type="number" min={16} max={300} value={width} onChange={(event) => onWidthChange(Number(event.target.value))} />
        </label>

        <label className="field">
          <span>Height</span>
          <input type="number" min={16} max={200} value={height} onChange={(event) => onHeightChange(Number(event.target.value))} />
        </label>
      </div>

      <div className="button-row">
        <button type="button" className="primary" onClick={onGenerate} disabled={!canGenerate}>
          <Sparkles size={16} />
          Generate World
        </button>
        <button type="button" className="secondary" onClick={onRandomize}>
          <Dice5 size={16} />
          Random Seed
        </button>
        <button type="button" className="secondary" onClick={onClearRoute}>
          <Map size={16} />
          Clear Route
        </button>
      </div>

      <div className="layer-row">
        <label>
          <span>Layer</span>
          <select value={layer} onChange={(event) => onLayerChange(event.target.value as LayerMode)}>
            <option value="biomes">Biomes</option>
            <option value="elevation">Elevation</option>
            <option value="moisture">Moisture</option>
          </select>
        </label>
      </div>

      <div className="button-row export-row">
        <button type="button" className="secondary" onClick={onExportPng}>
          <Download size={16} />
          Export PNG
        </button>
        <button type="button" className="secondary" onClick={onExportJson}>
          <Download size={16} />
          Export JSON
        </button>
      </div>
    </div>
  );
}
