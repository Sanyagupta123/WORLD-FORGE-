import type { WorldStats } from '../types/world';

export type StatsPanelProps = {
  stats: WorldStats;
  routeCount?: number;
  routeCost?: number;
};

export function StatsPanel({ stats, routeCount, routeCost }: StatsPanelProps) {
  return (
    <div className="stats-panel">
      <h3>World Statistics</h3>
      <ul className="stats-list">
        <li>Seed: {stats.seed}</li>
        <li>Dimensions: {stats.width} × {stats.height}</li>
        <li>Total cells: {stats.totalCells}</li>
        <li>Land: {stats.landPercent.toFixed(1)}%</li>
        <li>Ocean: {stats.oceanPercent.toFixed(1)}%</li>
        <li>Rivers: {stats.riverCount}</li>
        {routeCount !== undefined && <li>Route cells: {routeCount}</li>}
        {routeCost !== undefined && <li>Route cost: {routeCost.toFixed(1)}</li>}
      </ul>
      <div className="biome-stats">
        {Object.entries(stats.biomeCounts).map(([name, count]) => (
          <div key={name} className="biome-stat">
            <span>{name}</span>
            <strong>{count}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
