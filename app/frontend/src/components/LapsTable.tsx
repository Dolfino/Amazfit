import React from 'react';

interface Lap {
  idx: number;
  dist_km: number;
  duration_sec: number;
  duration_str: string;
  avg_speed_kmh: number;
  max_speed_kmh: number;
  avg_hr: number | null;
  max_hr: number | null;
}

interface LapsTableProps {
  laps: Lap[];
}

export const LapsTable: React.FC<LapsTableProps> = ({ laps }) => {
  if (!laps || laps.length === 0) {
    return (
      <div className="card" style={{ gridColumn: 'span 4' }}>
        <h3 className="card-title">⏱️ Resumo de Voltas (Laps)</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Este arquivo FIT não contém marcações de voltas (laps) consolidadas.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="card-title">⏱️ Resumo de Voltas (Laps)</h3>
      <div className="table-wrapper">
        <table className="laps-table">
          <thead>
            <tr>
              <th>Volta</th>
              <th>Distância</th>
              <th>Tempo</th>
              <th>Vel. Média</th>
              <th>Vel. Máxima</th>
              <th>FC Média</th>
              <th>FC Máxima</th>
            </tr>
          </thead>
          <tbody>
            {laps.map((lap) => (
              <tr key={lap.idx}>
                <td style={{ fontWeight: 700 }}>{lap.idx}</td>
                <td>{lap.dist_km.toFixed(2)} km</td>
                <td>{lap.duration_str}</td>
                <td>{lap.avg_speed_kmh.toFixed(1)} km/h</td>
                <td>{lap.max_speed_kmh.toFixed(1)} km/h</td>
                <td>{lap.avg_hr ? `${lap.avg_hr} bpm` : '-'}</td>
                <td>{lap.max_hr ? `${lap.max_hr} bpm` : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
