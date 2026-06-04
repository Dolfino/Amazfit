import React from 'react';

interface MetricsSummary {
  distance_km: number;
  duration_sec: number;
  duration_str: string;
  avg_speed_kmh: number;
  max_speed_kmh: number;
  avg_pace: string;
  best_pace: string;
  ascent_m: number;
  descent_m: number;
  avg_hr: number | null;
  max_hr: number | null;
  min_hr: number | null;
  aerobic_te: number;
  anaerobic_te: number;
  training_load: number;
  calories: number;
  avg_cadence_spm?: number;
  max_cadence_spm?: number;
  avg_step_len_mm?: number;
  estimated_steps?: number;
}

interface MetricsDashboardProps {
  summary: MetricsSummary;
  estimatedSteps?: number;
}

export const MetricsDashboard: React.FC<MetricsDashboardProps> = ({ summary, estimatedSteps }) => {
  return (
    <div className="metrics-summary-grid">
      {/* Distance */}
      <div className="metric-tile">
        <div className="metric-header">
          <span>Distância</span>
          <span className="metric-icon">📏</span>
        </div>
        <div className="metric-body">
          <span className="metric-value">{summary.distance_km.toFixed(2)}</span>
          <span className="metric-unit">km</span>
        </div>
      </div>

      {/* Duration */}
      <div className="metric-tile teal">
        <div className="metric-header">
          <span>Tempo Total</span>
          <span className="metric-icon">⏱️</span>
        </div>
        <div className="metric-body">
          <span className="metric-value" style={{ fontSize: '1.6rem' }}>{summary.duration_str}</span>
        </div>
      </div>

      {/* Average & Best Pace */}
      <div className="metric-tile emerald">
        <div className="metric-header">
          <span>Ritmo (Médio / Melhor)</span>
          <span className="metric-icon">🏃</span>
        </div>
        <div className="metric-body" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.15rem' }}>
          <div>
            <span className="metric-value" style={{ fontSize: '1.5rem' }}>{summary.avg_pace}</span>
            <span className="metric-unit">/km</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Melhor ritmo: {summary.best_pace} /km
          </span>
        </div>
      </div>

      {/* Heart Rate (Avg / Max / Min) */}
      {summary.avg_hr ? (
        <div className="metric-tile rose">
          <div className="metric-header">
            <span>Frequência Cardíaca</span>
            <span className="metric-icon">❤️</span>
          </div>
          <div className="metric-body" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.15rem' }}>
            <div>
              <span className="metric-value" style={{ fontSize: '1.5rem' }}>
                {summary.avg_hr} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>/ {summary.max_hr} / {summary.min_hr}</span>
              </span>
              <span className="metric-unit"> bpm</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Média / Máxima / Mínima
            </span>
          </div>
        </div>
      ) : (
        <div className="metric-tile rose">
          <div className="metric-header">
            <span>Velocidade Média</span>
            <span className="metric-icon">⚡</span>
          </div>
          <div className="metric-body">
            <span className="metric-value">{summary.avg_speed_kmh.toFixed(1)}</span>
            <span className="metric-unit">km/h</span>
          </div>
        </div>
      )}

      {/* Ascent / Descent */}
      <div className="metric-tile amber">
        <div className="metric-header">
          <span>Elevação (Subida/Descida)</span>
          <span className="metric-icon">⛰️</span>
        </div>
        <div className="metric-body">
          <span className="metric-value" style={{ fontSize: '1.45rem' }}>
            +{Math.round(summary.ascent_m)}m / -{Math.round(summary.descent_m)}m
          </span>
        </div>
      </div>

      {/* Calories */}
      <div className="metric-tile">
        <div className="metric-header">
          <span>Calorias</span>
          <span className="metric-icon">🔥</span>
        </div>
        <div className="metric-body">
          <span className="metric-value">{summary.calories}</span>
          <span className="metric-unit">kcal</span>
        </div>
      </div>

      {/* Estimated Steps */}
      {(estimatedSteps !== undefined || summary.estimated_steps !== undefined) && (
        <div className="metric-tile teal">
          <div className="metric-header">
            <span>Passos</span>
            <span className="metric-icon">👟</span>
          </div>
          <div className="metric-body">
            <span className="metric-value">
              {((estimatedSteps !== undefined ? estimatedSteps : summary.estimated_steps) as number).toLocaleString('pt-BR')}
            </span>
            <span className="metric-unit">passos</span>
          </div>
        </div>
      )}

      {/* Cadência Média */}
      {summary.avg_cadence_spm !== undefined && summary.avg_cadence_spm > 0 && (
        <div className="metric-tile teal">
          <div className="metric-header">
            <span>Cadência Média</span>
            <span className="metric-icon">👟</span>
          </div>
          <div className="metric-body">
            <span className="metric-value">{Math.round(summary.avg_cadence_spm)}</span>
            <span className="metric-unit">SPM</span>
          </div>
        </div>
      )}

      {/* Frequência Máxima de Passada */}
      {summary.max_cadence_spm !== undefined && summary.max_cadence_spm > 0 && (
        <div className="metric-tile rose">
          <div className="metric-header">
            <span>Frequência Máxima de Passada</span>
            <span className="metric-icon">⚡</span>
          </div>
          <div className="metric-body">
            <span className="metric-value">{Math.round(summary.max_cadence_spm)}</span>
            <span className="metric-unit">SPM</span>
          </div>
        </div>
      )}

      {/* Passada Média */}
      {summary.avg_step_len_mm !== undefined && summary.avg_step_len_mm > 0 && (
        <div className="metric-tile emerald">
          <div className="metric-header">
            <span>Passada Média</span>
            <span className="metric-icon">📏</span>
          </div>
          <div className="metric-body">
            <span className="metric-value">{Math.round(summary.avg_step_len_mm / 10)}</span>
            <span className="metric-unit">cm</span>
          </div>
        </div>
      )}

      {/* Training Load (Carga de Treino) */}
      <div className="metric-tile">
        <div className="metric-header">
          <span>Carga de Treino</span>
          <span className="metric-icon">📊</span>
        </div>
        <div className="metric-body">
          <span className="metric-value">{summary.training_load}</span>
          <span className="metric-unit" style={{ marginLeft: '0.25rem', fontSize: '0.8rem', fontWeight: 600 }}>
            {summary.training_load >= 150 ? 'Pesada' : 'Ideal'}
          </span>
        </div>
      </div>

      {/* Training Effect (Aerobic) */}
      <div className="metric-tile emerald">
        <div className="metric-header">
          <span>Efeito Aeróbico (TE)</span>
          <span className="metric-icon">💪</span>
        </div>
        <div className="metric-body">
          <span className="metric-value">{summary.aerobic_te.toFixed(1)}</span>
          <span className="metric-unit" style={{ marginLeft: '0.25rem', fontSize: '0.8rem', fontWeight: 600 }}>
            {summary.aerobic_te >= 5.0 ? 'Overreaching' : (summary.aerobic_te >= 3.0 ? 'Melhoria' : 'Manutenção')}
          </span>
        </div>
      </div>

      {/* Training Effect (Anaerobic) */}
      <div className="metric-tile rose">
        <div className="metric-header">
          <span>Efeito Anaeróbico (TE)</span>
          <span className="metric-icon">⚡</span>
        </div>
        <div className="metric-body">
          <span className="metric-value">{summary.anaerobic_te.toFixed(1)}</span>
          <span className="metric-unit" style={{ marginLeft: '0.25rem', fontSize: '0.8rem', fontWeight: 600 }}>
            {summary.anaerobic_te >= 3.0 ? 'Substancial' : 'Manutenção'}
          </span>
        </div>
      </div>
    </div>
  );
};
