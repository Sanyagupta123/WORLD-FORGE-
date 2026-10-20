import { BIOME_COLORS, BIOME_ORDER } from '../algorithms/biomes';
import type { Biome } from '../types/world';

export function Legend() {
  return (
    <div className="legend-panel">
      <h3>Biome Legend</h3>
      <div className="legend-grid">
        {BIOME_ORDER.map((biome) => (
          <div key={biome} className="legend-item">
            <span className="swatch" style={{ background: `rgb(${BIOME_COLORS[biome as Biome].join(',')})` }} />
            <span>{biome}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
