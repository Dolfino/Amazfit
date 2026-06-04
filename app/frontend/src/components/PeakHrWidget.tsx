import React from 'react';

interface PeakHrData {
  heart_rate: number;
  local_time: string;
  elapsed_sec: number;
  elapsed_str: string;
  speed_kmh: number;
  cadence_spm: number;
  altitude_m: number;
  latitude: number | null;
  longitude: number | null;
}

interface PeakHrWidgetProps {
  peakHr: PeakHrData;
}

export const PeakHrWidget: React.FC<PeakHrWidgetProps> = ({ peakHr }) => {
  if (!peakHr || !peakHr.heart_rate) {
    return (
      <div className="card">
        <h3 className="card-title">🔥 Momento de Maior Esforço</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Dados de esforço ausentes.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="card-title">🔥 Momento de Maior Esforço</h3>
      <div className="peak-widget">
        
        <div className="peak-hr-pill">
          <span>❤️ Frequência Cardíaca Máxima</span>
          <span style={{ fontSize: '1.4rem' }}>{peakHr.heart_rate} bpm</span>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', lineHeight: '1.4' }}>
          O pico máximo de frequência cardíaca ocorreu exatamente às <strong>{peakHr.local_time}</strong> no fuso local, cerca de <strong>{peakHr.elapsed_str}</strong> após o início do treino.
        </p>

        <div className="peak-details-grid">
          {/* Speed */}
          <div className="peak-detail-item">
            <span className="peak-detail-label">Velocidade</span>
            <span className="peak-detail-value">{peakHr.speed_kmh.toFixed(2)} km/h</span>
          </div>

          {/* Cadence */}
          <div className="peak-detail-item">
            <span className="peak-detail-label">Cadência</span>
            <span className="peak-detail-value">{peakHr.cadence_spm} SPM</span>
          </div>

          {/* Altitude */}
          <div className="peak-detail-item">
            <span className="peak-detail-label">Altitude</span>
            <span className="peak-detail-value">{peakHr.altitude_m.toFixed(1)} m</span>
          </div>

          {/* Position */}
          <div className="peak-detail-item">
            <span className="peak-detail-label">Região / Ponto</span>
            <span className="peak-detail-value" style={{ fontSize: '0.75rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {peakHr.latitude ? `${peakHr.latitude.toFixed(4)}, ${peakHr.longitude?.toFixed(4)}` : 'Sem GPS'}
            </span>
          </div>
        </div>

        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '0.25rem' }}>
          Insight: A combinação de alta cadência ({peakHr.cadence_spm} SPM) com velocidade moderada ({peakHr.speed_kmh.toFixed(1)} km/h) próximo ao nível do mar ({Math.round(peakHr.altitude_m)}m) sugere um trote rápido ou um esforço concentrado na parte final da atividade.
        </p>
      </div>
    </div>
  );
};
