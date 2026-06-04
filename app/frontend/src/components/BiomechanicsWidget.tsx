import React from 'react';

interface DistributionDetail {
  seconds: number;
  pct: number;
}

interface BiomechanicsData {
  time_distribution: {
    stopped: DistributionDetail;
    walking: DistributionDetail;
    running: DistributionDetail;
  };
  speed_zones?: {
    stopped: DistributionDetail;
    slow_walk: DistributionDetail;
    fast_walk: DistributionDetail;
    running: DistributionDetail;
  };
  avg_cadence_rpm: number;
  max_cadence_rpm: number;
  avg_cadence_spm: number;
  max_cadence_spm: number;
  avg_step_len_mm: number;
}

interface BiomechanicsWidgetProps {
  biomech: BiomechanicsData;
}

export const BiomechanicsWidget: React.FC<BiomechanicsWidgetProps> = ({ biomech }) => {
  const formatDuration = (sec: number): string => {
    const mins = Math.floor(sec / 60);
    const secs = Math.round(sec % 60);
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  const stoppedPct = biomech.time_distribution.stopped.pct;
  const walkingPct = biomech.time_distribution.walking.pct;
  const runningPct = biomech.time_distribution.running.pct;

  return (
    <div className="card">
      <h3 className="card-title">🏃 Biomecânica e Cadência</h3>
      <div className="biomech-grid">
        
        {/* Horizontal Stacked Bar */}
        <div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
            Distribuição de Atividade
          </span>
          <div className="donut-bar">
            {stoppedPct > 0 && (
              <div 
                className="donut-segment segment-stopped" 
                style={{ width: `${stoppedPct}%` }} 
                title={`Parado: ${stoppedPct.toFixed(1)}%`}
              />
            )}
            {walkingPct > 0 && (
              <div 
                className="donut-segment segment-walking" 
                style={{ width: `${walkingPct}%` }} 
                title={`Caminhada: ${walkingPct.toFixed(1)}%`}
              />
            )}
            {runningPct > 0 && (
              <div 
                className="donut-segment segment-running" 
                style={{ width: `${runningPct}%` }} 
                title={`Corrida: ${runningPct.toFixed(1)}%`}
              />
            )}
          </div>
          
          <div className="biomech-legend">
            <div className="legend-item">
              <span className="legend-color-dot" style={{ backgroundColor: 'var(--text-muted)' }} />
              <span style={{ fontWeight: 'bold' }}>{stoppedPct.toFixed(1)}%</span>
              <span style={{ color: 'var(--text-secondary)' }}>Parado ({formatDuration(biomech.time_distribution.stopped.seconds)})</span>
            </div>
            <div className="legend-item">
              <span className="legend-color-dot" style={{ backgroundColor: 'var(--accent-cyan)' }} />
              <span style={{ fontWeight: 'bold' }}>{walkingPct.toFixed(1)}%</span>
              <span style={{ color: 'var(--text-secondary)' }}>Caminhada ({formatDuration(biomech.time_distribution.walking.seconds)})</span>
            </div>
            <div className="legend-item">
              <span className="legend-color-dot" style={{ backgroundColor: 'var(--accent-indigo)' }} />
              <span style={{ fontWeight: 'bold' }}>{runningPct.toFixed(1)}%</span>
              <span style={{ color: 'var(--text-secondary)' }}>Corrida ({formatDuration(biomech.time_distribution.running.seconds)})</span>
            </div>
          </div>
        </div>

        {/* Speed Zones Breakdown */}
        {biomech.speed_zones && (
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '0.25rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.75rem' }}>
              Zonas de Ritmo (Velocidade)
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { name: 'Parado', range: '< 1.0 km/h', detail: biomech.speed_zones.stopped, colorClass: 'bg-z5' },
                { name: 'Caminhada Lenta', range: '1.0 - 3.5 km/h', detail: biomech.speed_zones.slow_walk, colorClass: 'bg-z1-z2' },
                { name: 'Caminhada Rápida', range: '3.5 - 5.0 km/h', detail: biomech.speed_zones.fast_walk, colorClass: 'bg-z3' },
                { name: 'Corrida / Trote', range: '≥ 5.0 km/h', detail: biomech.speed_zones.running, colorClass: 'bg-z4' }
              ].map((zone, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    <span style={{ fontWeight: 600 }}>{zone.name} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({zone.range})</span></span>
                    <span>{formatDuration(zone.detail.seconds)} ({zone.detail.pct.toFixed(1)}%)</span>
                  </div>
                  <div className="zone-bar-bg" style={{ height: '6px' }}>
                    <div className={`zone-bar-fill ${zone.colorClass}`} style={{ width: `${zone.detail.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cadence and Step Length Box */}
        <div className="biomech-metrics-row">
          <div className="submetric-box">
            <span className="submetric-label">Cadência Média</span>
            <span className="submetric-value">
              {Math.round(biomech.avg_cadence_spm)} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)' }}>SPM</span>
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({Math.round(biomech.avg_cadence_rpm)} RPM)</span>
          </div>

          <div className="submetric-box">
            <span className="submetric-label">Cadência Máxima</span>
            <span className="submetric-value">
              {biomech.max_cadence_spm} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)' }}>SPM</span>
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({biomech.max_cadence_rpm} RPM)</span>
          </div>

          <div className="submetric-box" style={{ gridColumn: 'span 2' }}>
            <span className="submetric-label">Comprimento do Passo</span>
            <span className="submetric-value">
              {Math.round(biomech.avg_step_len_mm / 10)} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)' }}>cm</span>
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Média de {Math.round(biomech.avg_step_len_mm)} mm por passada (caminhada rápida).
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
