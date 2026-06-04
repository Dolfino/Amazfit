import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';

interface ChartPoint {
  dist: number;
  time: number;
  alt: number | null;
  hr: number | null;
  spd: number;
  cad: number;
  pwr: number | null;
  temp: number | null;
}

interface PerformanceChartsProps {
  chartSeries: ChartPoint[];
  summary: any;
  onHoverPoint?: (index: number | null) => void;
}

// Convert speed in km/h to pace in minutes per km (decimal)
const getPaceDecimal = (spd: number) => {
  if (spd < 0.5) return null;
  return 60 / spd;
};

// Format pace decimal (e.g. 10.5) to "10'30\""
const formatPace = (decimalMin: number | null) => {
  if (decimalMin === null || isNaN(decimalMin) || !isFinite(decimalMin)) return '-';
  const mins = Math.floor(decimalMin);
  const secs = Math.round((decimalMin - mins) * 60);
  return `${mins}'${secs < 10 ? '0' : ''}${secs}"`;
};

// Calculate step length in cm: stride_len = (speed_m_s / steps_per_sec) * 100
const getStepLength = (spdKmH: number, cadSPM: number) => {
  if (cadSPM < 30 || spdKmH < 1.0) return null;
  const len = (spdKmH / cadSPM) * 1666.67;
  if (len > 250 || len < 20) return null; // Filter out physically impossible lengths
  return len;
};

export const PerformanceCharts: React.FC<PerformanceChartsProps> = ({ chartSeries, summary, onHoverPoint }) => {
  const [xAxisKey, setXAxisKey] = useState<'dist' | 'time'>('dist');

  const xLabel = xAxisKey === 'dist' ? 'Distância' : 'Tempo';
  const formatterX = (value: any) => {
    const num = typeof value === 'number' ? value : parseFloat(value || '0');
    return xAxisKey === 'dist' ? `${num.toFixed(2)} km` : `${num.toFixed(1)} min`;
  };

  // Prepare chart data with pace and step length
  const processedData = chartSeries.map((point) => {
    const paceDecimal = getPaceDecimal(point.spd);
    const stepLengthCm = getStepLength(point.spd, point.cad);
    return {
      ...point,
      pace: paceDecimal,
      stepLen: stepLengthCm,
    };
  });

  // Calculate step length stats for rendering
  const stepLengths = processedData
    .map(p => p.stepLen)
    .filter((v): v is number => v !== null);
  
  const avgStepLen = summary.avg_step_len_mm ? summary.avg_step_len_mm / 10 : (stepLengths.length > 0 ? stepLengths.reduce((a, b) => a + b, 0) / stepLengths.length : 72);
  const minStepLen = stepLengths.length > 0 ? Math.min(...stepLengths) : 13;

  const handleMouseMove = (state: any) => {
    if (onHoverPoint && state && state.activeTooltipIndex !== undefined) {
      onHoverPoint(state.activeTooltipIndex);
    }
  };

  const handleMouseLeave = () => {
    if (onHoverPoint) {
      onHoverPoint(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Chart Settings Controls Card */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderRadius: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          📊 Gráficos de Desempenho
        </h3>
        
        {/* Toggle X Axis */}
        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-primary)', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <button
            onClick={() => setXAxisKey('dist')}
            style={{
              background: xAxisKey === 'dist' ? 'var(--bg-tertiary)' : 'transparent',
              border: 'none',
              color: xAxisKey === 'dist' ? 'var(--text-primary)' : 'var(--text-secondary)',
              padding: '0.3rem 0.75rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 600,
              transition: 'all 0.15s ease'
            }}
          >
            Distância (km)
          </button>
          <button
            onClick={() => setXAxisKey('time')}
            style={{
              background: xAxisKey === 'time' ? 'var(--bg-tertiary)' : 'transparent',
              border: 'none',
              color: xAxisKey === 'time' ? 'var(--text-primary)' : 'var(--text-secondary)',
              padding: '0.3rem 0.75rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 600,
              transition: 'all 0.15s ease'
            }}
          >
            Tempo (min)
          </button>
        </div>
      </div>

      {/* 1. RITMO (Pace) Chart Card */}
      <div className="card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.25rem' }}>
          <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.05em' }}>RITMO (/km)</h4>
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem' }}>
            <span>
              <strong style={{ fontSize: '1.2rem', color: 'var(--accent-cyan)' }}>{summary.avg_pace}</strong> <span style={{ color: 'var(--text-secondary)' }}>Média</span>
            </span>
            <span>
              <strong style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>{summary.best_pace}</strong> <span style={{ color: 'var(--text-secondary)' }}>Mínimo</span>
            </span>
          </div>
        </div>
        <div style={{ height: 200, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={processedData} 
              margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <defs>
                <linearGradient id="colorPace" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-cyan)" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="var(--accent-cyan)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey={xAxisKey} type="number" domain={['auto', 'auto']} tickFormatter={formatterX} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <YAxis reversed type="number" domain={['auto', 'auto']} tickFormatter={(v) => `${Math.floor(v)}'`} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div style={{ backgroundColor: 'rgba(24, 24, 27, 0.95)', border: '1px solid var(--border-color)', padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{xLabel}: <strong>{formatterX(label)}</strong></p>
                        <p style={{ margin: '0.25rem 0 0 0', color: 'var(--accent-cyan)', fontWeight: 'bold' }}>Ritmo: {formatPace(payload[0].value as number)} /km</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area type="monotone" dataKey="pace" stroke="var(--accent-cyan)" strokeWidth={2} fillOpacity={1} fill="url(#colorPace)" connectNulls />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. FREQUÊNCIA CARDÍACA Chart Card */}
      <div className="card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.25rem' }}>
          <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.05em' }}>FREQUÊNCIA CARDÍACA</h4>
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem' }}>
            <span>
              <strong style={{ fontSize: '1.2rem', color: 'var(--accent-rose)' }}>{summary.avg_hr} bpm</strong> <span style={{ color: 'var(--text-secondary)' }}>Média</span>
            </span>
            <span>
              <strong style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>{summary.max_hr} bpm</strong> <span style={{ color: 'var(--text-secondary)' }}>Máxima</span>
            </span>
          </div>
        </div>
        <div style={{ height: 200, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={processedData} 
              margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <defs>
                <linearGradient id="colorHR" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-rose)" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="var(--accent-rose)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey={xAxisKey} type="number" domain={['auto', 'auto']} tickFormatter={formatterX} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <YAxis type="number" domain={['auto', 'auto']} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div style={{ backgroundColor: 'rgba(24, 24, 27, 0.95)', border: '1px solid var(--border-color)', padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{xLabel}: <strong>{formatterX(label)}</strong></p>
                        <p style={{ margin: '0.25rem 0 0 0', color: 'var(--accent-rose)', fontWeight: 'bold' }}>FC: {payload[0].value} bpm</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area type="monotone" dataKey="hr" stroke="var(--accent-rose)" strokeWidth={2} fillOpacity={1} fill="url(#colorHR)" connectNulls />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. ALTITUDE Chart Card */}
      <div className="card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.05em' }}>ALTITUDE (m)</h4>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', flexWrap: 'wrap' }}>
            <span>
              <strong style={{ fontSize: '1.1rem', color: 'var(--accent-emerald)' }}>{Math.round(summary.avg_elevation || 0)}</strong> <span style={{ color: 'var(--text-secondary)' }}>Média</span>
            </span>
            <span>
              <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{Math.round(summary.max_elevation || 0)}</strong> <span style={{ color: 'var(--text-secondary)' }}>Mais alta</span>
            </span>
            <span>
              <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{Math.round(summary.min_elevation || 0)}</strong> <span style={{ color: 'var(--text-secondary)' }}>Mais baixa</span>
            </span>
            <span>
              <strong style={{ fontSize: '1.1rem', color: 'var(--accent-amber)' }}>+{Math.round(summary.ascent_m)}</strong> <span style={{ color: 'var(--text-secondary)' }}>Ganhos</span>
            </span>
            <span>
              <strong style={{ fontSize: '1.1rem', color: 'var(--accent-rose)' }}>-{Math.round(summary.descent_m)}</strong> <span style={{ color: 'var(--text-secondary)' }}>Perdas</span>
            </span>
          </div>
        </div>
        <div style={{ height: 200, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={processedData} 
              margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <defs>
                <linearGradient id="colorAlt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-emerald)" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="var(--accent-emerald)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey={xAxisKey} type="number" domain={['auto', 'auto']} tickFormatter={formatterX} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <YAxis type="number" domain={['auto', 'auto']} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div style={{ backgroundColor: 'rgba(24, 24, 27, 0.95)', border: '1px solid var(--border-color)', padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{xLabel}: <strong>{formatterX(label)}</strong></p>
                        <p style={{ margin: '0.25rem 0 0 0', color: 'var(--accent-emerald)', fontWeight: 'bold' }}>Altitude: {payload[0].value} m</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area type="monotone" dataKey="alt" stroke="var(--accent-emerald)" strokeWidth={2} fillOpacity={1} fill="url(#colorAlt)" connectNulls />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. CADÊNCIA Chart Card */}
      <div className="card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.25rem' }}>
          <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.05em' }}>CADÊNCIA (SPM)</h4>
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem' }}>
            <span>
              <strong style={{ fontSize: '1.2rem', color: 'var(--accent-amber)' }}>{Math.round(summary.avg_cadence_spm || 0)}</strong> <span style={{ color: 'var(--text-secondary)' }}>Média</span>
            </span>
            <span>
              <strong style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>{Math.round(summary.max_cadence_spm || 0)}</strong> <span style={{ color: 'var(--text-secondary)' }}>Máxima</span>
            </span>
          </div>
        </div>
        <div style={{ height: 200, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={processedData} 
              margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <defs>
                <linearGradient id="colorCad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-amber)" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="var(--accent-amber)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey={xAxisKey} type="number" domain={['auto', 'auto']} tickFormatter={formatterX} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <YAxis type="number" domain={['auto', 'auto']} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div style={{ backgroundColor: 'rgba(24, 24, 27, 0.95)', border: '1px solid var(--border-color)', padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{xLabel}: <strong>{formatterX(label)}</strong></p>
                        <p style={{ margin: '0.25rem 0 0 0', color: 'var(--accent-amber)', fontWeight: 'bold' }}>Cadência: {payload[0].value} SPM</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area type="monotone" dataKey="cad" stroke="var(--accent-amber)" strokeWidth={2} fillOpacity={1} fill="url(#colorCad)" connectNulls />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 5. PASSADA (Step Length) Chart Card */}
      <div className="card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.25rem' }}>
          <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.05em' }}>PASSADA (cm)</h4>
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem' }}>
            <span>
              <strong style={{ fontSize: '1.2rem', color: 'var(--accent-indigo)' }}>{Math.round(avgStepLen)}</strong> <span style={{ color: 'var(--text-secondary)' }}>Média</span>
            </span>
            <span>
              <strong style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>{Math.round(minStepLen)}</strong> <span style={{ color: 'var(--text-secondary)' }}>Mínimo</span>
            </span>
          </div>
        </div>
        <div style={{ height: 200, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={processedData} 
              margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <defs>
                <linearGradient id="colorStep" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-indigo)" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="var(--accent-indigo)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey={xAxisKey} type="number" domain={['auto', 'auto']} tickFormatter={formatterX} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <YAxis type="number" domain={['auto', 'auto']} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div style={{ backgroundColor: 'rgba(24, 24, 27, 0.95)', border: '1px solid var(--border-color)', padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{xLabel}: <strong>{formatterX(label)}</strong></p>
                        <p style={{ margin: '0.25rem 0 0 0', color: 'var(--accent-indigo)', fontWeight: 'bold' }}>Passada: {Math.round(payload[0].value as number)} cm</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area type="monotone" dataKey="stepLen" stroke="var(--accent-indigo)" strokeWidth={2} fillOpacity={1} fill="url(#colorStep)" connectNulls />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
