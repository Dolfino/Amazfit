import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

interface ActivitySummary {
  id: number;
  device_name: string;
  sport: string;
  sub_sport?: string;
  start_time_local: string;
  distance_km: number;
  duration_sec: number;
  avg_pace: string;
  avg_hr?: number;
  max_hr?: number;
  training_load?: number;
  calories?: number;
  estimated_steps?: number;
  ascent_m?: number;
}

interface StatsPayload {
  monthly_volume: Array<{ month: string; distance_km: number; duration_sec: number; count: number }>;
  pace_trend: Array<{ date: string; pace_decimal: number | null; pace_str: string; distance_km: number }>;
  hr_trend: Array<{ date: string; avg_hr: number | null; min_hr: number | null; max_hr: number | null }>;
}

interface HistoryDashboardProps {
  onSelectActivity: (id: number) => void;
  onRefreshListTrigger: number; // Trigger reload when activities are uploaded
}

export const HistoryDashboard: React.FC<HistoryDashboardProps> = ({ onSelectActivity, onRefreshListTrigger }) => {
  const [activities, setActivities] = useState<ActivitySummary[]>([]);
  const [stats, setStats] = useState<StatsPayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeStatsTab, setActiveStatsTab] = useState<'volume' | 'pace' | 'hr'>('volume');

  const fetchHistoryAndStats = async () => {
    setLoading(true);
    setError(null);
    const host = window.location.origin;
    const isLocal = host.includes('localhost:5173');
    const apiListUrl = isLocal ? 'http://localhost:8000/api/activities' : '/api/activities';
    const apiStatsUrl = isLocal ? 'http://localhost:8000/api/activities/stats/summary' : '/api/activities/stats/summary';

    try {
      const listResponse = await fetch(apiListUrl);
      if (!listResponse.ok) throw new Error('Falha ao obter lista de atividades.');
      const listData = await listResponse.json();
      setActivities(listData);

      const statsResponse = await fetch(apiStatsUrl);
      if (!statsResponse.ok) throw new Error('Falha ao obter estatísticas.');
      const statsData = await statsResponse.json();
      setStats(statsData);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar histórico.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoryAndStats();
  }, [onRefreshListTrigger]);

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!window.confirm('Tem certeza que deseja excluir esta atividade permanentemente?')) return;

    const host = window.location.origin;
    const deleteUrl = host.includes('localhost:5173') 
      ? `http://localhost:8000/api/activities/${id}` 
      : `/api/activities/${id}`;

    try {
      const response = await fetch(deleteUrl, { method: 'DELETE' });
      if (!response.ok) throw new Error('Falha ao excluir atividade.');
      // Refresh
      fetchHistoryAndStats();
    } catch (err: any) {
      alert(err.message || 'Erro ao deletar.');
    }
  };

  // Helper formatting values
  const formatDuration = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    if (hrs === 0) return `${mins}m`;
    return `${hrs}h ${mins}m`;
  };

  // Calculate totals
  const totalDistance = activities.reduce((acc, curr) => acc + curr.distance_km, 0);
  const totalDurationSecs = activities.reduce((acc, curr) => acc + curr.duration_sec, 0);
  const totalSteps = activities.reduce((acc, curr) => acc + (curr.estimated_steps || 0), 0);

  const translateSportType = (sport?: string, sub?: string) => {
    if (!sport) return 'Corrida';
    if (sport.toLowerCase() === 'running') return sub?.toLowerCase() === 'street' ? 'Corrida de Rua' : 'Corrida';
    if (sport.toLowerCase() === 'walking') return 'Caminhada';
    return sport;
  };

  if (loading && activities.length === 0) {
    return (
      <div className="loader-container card" style={{ gridColumn: 'span 4' }}>
        <div className="spinner"></div>
        <p>Carregando histórico de treinos e análises...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {error && (
        <div style={{ color: 'var(--accent-rose)', padding: '1rem', backgroundColor: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.2)', borderRadius: '8px' }}>
          ⚠️ {error}
        </div>
      )}
      
      {/* Aggregate Stats Cards */}
      <div className="metrics-summary-grid">
        <div className="metric-tile">
          <div className="metric-header">
            <span>Volume Total</span>
            <span className="metric-icon">📏</span>
          </div>
          <div className="metric-body">
            <span className="metric-value">{totalDistance.toFixed(1)}</span>
            <span className="metric-unit">km</span>
          </div>
        </div>

        <div className="metric-tile teal">
          <div className="metric-header">
            <span>Tempo Acumulado</span>
            <span className="metric-icon">⏱️</span>
          </div>
          <div className="metric-body">
            <span className="metric-value" style={{ fontSize: '1.7rem' }}>{formatDuration(totalDurationSecs)}</span>
          </div>
        </div>

        <div className="metric-tile emerald">
          <div className="metric-header">
            <span>Passos Acumulados</span>
            <span className="metric-icon">👟</span>
          </div>
          <div className="metric-body">
            <span className="metric-value">{totalSteps.toLocaleString('pt-BR')}</span>
            <span className="metric-unit">passos</span>
          </div>
        </div>

        <div className="metric-tile rose">
          <div className="metric-header">
            <span>Treinos Gravados</span>
            <span className="metric-icon">📋</span>
          </div>
          <div className="metric-body">
            <span className="metric-value">{activities.length}</span>
            <span className="metric-unit">atividades</span>
          </div>
        </div>
      </div>

      {/* Stats Trends Chart Card */}
      {stats && stats.monthly_volume.length > 0 && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
              📈 Gráficos de Tendência Acumulada
            </h3>
            
            {/* Chart Toggle Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-primary)', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <button 
                onClick={() => setActiveStatsTab('volume')} 
                style={{
                  background: activeStatsTab === 'volume' ? 'var(--bg-tertiary)' : 'transparent',
                  border: 'none',
                  color: activeStatsTab === 'volume' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  padding: '0.3rem 0.75rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}
              >
                Distância Mensal
              </button>
              <button 
                onClick={() => setActiveStatsTab('pace')} 
                style={{
                  background: activeStatsTab === 'pace' ? 'var(--bg-tertiary)' : 'transparent',
                  border: 'none',
                  color: activeStatsTab === 'pace' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  padding: '0.3rem 0.75rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}
              >
                Evolução do Ritmo
              </button>
              <button 
                onClick={() => setActiveStatsTab('hr')} 
                style={{
                  background: activeStatsTab === 'hr' ? 'var(--bg-tertiary)' : 'transparent',
                  border: 'none',
                  color: activeStatsTab === 'hr' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  padding: '0.3rem 0.75rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}
              >
                Frequência Cardíaca
              </button>
            </div>
          </div>

          <div style={{ height: 260, width: '100%', marginTop: '0.5rem' }}>
            {activeStatsTab === 'volume' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.monthly_volume} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} unit="km" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                    labelStyle={{ fontWeight: 'bold', color: '#fff' }}
                  />
                  <Bar dataKey="distance_km" name="Distância Total" fill="var(--accent-cyan)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}

            {activeStatsTab === 'pace' && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.pace_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                  <YAxis reversed tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={(v) => `${Math.floor(v)}'`} />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div style={{ backgroundColor: 'rgba(24, 24, 27, 0.95)', border: '1px solid var(--border-color)', padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Data: <strong>{data.date}</strong></p>
                            <p style={{ margin: '0.25rem 0 0 0', color: 'var(--accent-cyan)', fontWeight: 'bold' }}>Ritmo Médio: {data.pace_str} /km</p>
                            <p style={{ margin: '0.15rem 0 0 0', color: 'var(--text-muted)' }}>Distância: {data.distance_km.toFixed(2)} km</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line type="monotone" dataKey="pace_decimal" stroke="var(--accent-cyan)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            )}

            {activeStatsTab === 'hr' && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.hr_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                    labelStyle={{ fontWeight: 'bold', color: '#fff' }}
                  />
                  <Legend verticalAlign="top" height={32} iconType="circle" wrapperStyle={{ fontSize: '0.8rem' }} />
                  <Line type="monotone" dataKey="avg_hr" name="FC Média" stroke="var(--accent-rose)" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="min_hr" name="FC Mínima" stroke="var(--accent-indigo)" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="max_hr" name="FC Máxima" stroke="var(--accent-amber)" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      {/* History Activity List Table */}
      <div className="card">
        <h3 className="card-title">⏱️ Histórico de Atividades</h3>
        
        {activities.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
            Nenhuma atividade cadastrada. Faça upload de arquivos .FIT acima para iniciar seu histórico!
          </p>
        ) : (
          <div className="table-wrapper">
            <table className="laps-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Esporte</th>
                  <th>Distância</th>
                  <th>Tempo</th>
                  <th>Ritmo Médio</th>
                  <th>FC Média</th>
                  <th>Carga</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((act) => (
                  <tr 
                    key={act.id} 
                    onClick={() => onSelectActivity(act.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td style={{ fontWeight: 600 }}>{act.start_time_local}</td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        {act.sport === 'running' ? '🏃' : '🚶'} {translateSportType(act.sport, act.sub_sport)}
                      </span>
                    </td>
                    <td><strong>{act.distance_km.toFixed(2)} km</strong></td>
                    <td>{formatDuration(act.duration_sec)}</td>
                    <td>{act.avg_pace} /km</td>
                    <td>{act.avg_hr ? `${act.avg_hr} bpm` : '-'}</td>
                    <td>
                      {act.training_load ? (
                        <span 
                          style={{ 
                            fontSize: '0.75rem', 
                            padding: '0.15rem 0.4rem', 
                            borderRadius: '4px',
                            background: act.training_load >= 150 ? 'rgba(244, 63, 94, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                            color: act.training_load >= 150 ? 'var(--accent-rose)' : 'var(--accent-emerald)',
                            fontWeight: 700
                          }}
                        >
                          {act.training_load}
                        </span>
                      ) : '-'}
                    </td>
                    <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                      <button 
                        className="btn-reset" 
                        onClick={() => onSelectActivity(act.id)}
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', marginRight: '0.5rem' }}
                      >
                        🔍 Ver
                      </button>
                      <button 
                        className="btn-reset" 
                        onClick={(e) => handleDelete(e, act.id)}
                        style={{ 
                          padding: '0.3rem 0.6rem', 
                          fontSize: '0.8rem', 
                          backgroundColor: 'rgba(244, 63, 94, 0.1)', 
                          borderColor: 'rgba(244, 63, 94, 0.2)',
                          color: 'var(--accent-rose)' 
                        }}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
