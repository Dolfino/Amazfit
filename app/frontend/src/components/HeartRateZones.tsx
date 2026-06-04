import React from 'react';

interface ZoneDetail {
  seconds: number;
  pct: number;
}

interface HrZones {
  z1_z2: ZoneDetail;
  z3: ZoneDetail;
  z4: ZoneDetail;
  z5: ZoneDetail;
  total_seconds: number;
}

interface HeartRateZonesProps {
  zones: HrZones;
}

export const HeartRateZones: React.FC<HeartRateZonesProps> = ({ zones }) => {
  const formatDuration = (sec: number): string => {
    const mins = Math.floor(sec / 60);
    const secs = Math.round(sec % 60);
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  if (!zones || !zones.z1_z2) {
    return (
      <div className="card">
        <h3 className="card-title">🫀 Zonas de Esforço Cardíaco</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Nenhum dado de frequência cardíaca disponível.</p>
      </div>
    );
  }

  const zoneList = [
    {
      key: 'z1_z2' as const,
      name: 'Z1/Z2: Aquecimento & Recuperação',
      range: '< 128 bpm',
      desc: 'Melhora a recuperação e prepara o sistema cardiovascular.',
      colorClass: 'bg-z1-z2',
      detail: zones.z1_z2
    },
    {
      key: 'z3' as const,
      name: 'Z3: Cardio Moderado / Ritmo',
      range: '128 - 146 bpm',
      desc: 'Zona predominante aeróbica; melhora a resistência de longa duração.',
      colorClass: 'bg-z3',
      detail: zones.z3
    },
    {
      key: 'z4' as const,
      name: 'Z4: Limiar / Difícil',
      range: '146 - 165 bpm',
      desc: 'Melhora a velocidade, limiar de lactato e capacidade anaeróbica.',
      colorClass: 'bg-z4',
      detail: zones.z4
    },
    {
      key: 'z5' as const,
      name: 'Z5: Anaeróbica / Limite',
      range: '> 165 bpm',
      desc: 'Esforço máximo e potência; melhora a tolerância ao lactato.',
      colorClass: 'bg-z5',
      detail: zones.z5
    }
  ];

  return (
    <div className="card">
      <h3 className="card-title">🫀 Zonas de Esforço Cardíaco</h3>
      <div className="zones-container">
        {zoneList.map((z) => (
          <div className="zone-row" key={z.key}>
            <div className="zone-info">
              <span className="zone-name">
                <span className={`zone-dot ${z.colorClass}`} />
                {z.name}
              </span>
              <span className="zone-time">{formatDuration(z.detail.seconds)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <span>{z.range}</span>
              <span>{z.detail.pct.toFixed(1)}%</span>
            </div>
            <div className="zone-bar-bg">
              <div 
                className={`zone-bar-fill ${z.colorClass}`} 
                style={{ width: `${z.detail.pct}%` }} 
              />
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '0.15rem' }}>{z.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
