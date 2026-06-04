import { useState, useRef } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import { MetricsDashboard } from './components/MetricsDashboard';
import { RouteMap } from './components/RouteMap';
import { PerformanceCharts } from './components/PerformanceCharts';
import { HeartRateZones } from './components/HeartRateZones';
import { BiomechanicsWidget } from './components/BiomechanicsWidget';
import { PeakHrWidget } from './components/PeakHrWidget';
import { MetadataWidget } from './components/MetadataWidget';
import { LapsTable } from './components/LapsTable';
import { ExportDownload } from './components/ExportDownload';
import { EventTimeline } from './components/EventTimeline';
import { HistoryDashboard } from './components/HistoryDashboard';
import { BiomechInsightsWidget } from './components/BiomechInsightsWidget';
import { mockActivityData } from './mockData';

const translateSport = (sport?: string, subSport?: string) => {
  if (!sport) return 'Atividade';
  const sportMap: Record<string, string> = {
    'running': 'Corrida',
    'cycling': 'Ciclismo',
    'walking': 'Caminhada',
    'hiking': 'Corrida de Trilha / Trekking',
    'swimming': 'Natação',
    'fitness_equipment': 'Academia / Treino Funcional',
  };
  
  const subSportMap: Record<string, string> = {
    'street': 'Rua',
    'treadmill': 'Esteira',
    'trail': 'Trilha',
    'track': 'Pista',
    'indoor': 'Indoor',
    'open_water': 'Águas Abertas',
  };

  const mainSport = sportMap[sport.toLowerCase()] || sport;
  const sub = subSport ? (subSportMap[subSport.toLowerCase()] || subSport) : '';
  
  return sub ? `${mainSport} de ${sub}` : mainSport;
};

export default function App() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>('');
  
  // New Phase 2 state
  const [activePointIndex, setActivePointIndex] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'history' | 'dashboard'>('history');
  const [refreshListTrigger, setRefreshListTrigger] = useState<number>(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const clickUploadArea = () => {
    fileInputRef.current?.click();
  };

  const processFiles = async (files: FileList) => {
    setLoading(true);
    setError(null);

    const formData = new FormData();
    const isBatch = files.length > 1 || files[0].name.toLowerCase().endsWith('.zip');

    if (isBatch) {
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }
    } else {
      if (!files[0].name.toLowerCase().endsWith('.fit')) {
        setError('Apenas arquivos .fit ou .zip são aceitos.');
        setLoading(false);
        return;
      }
      formData.append('file', files[0]);
    }

    setFileName(files[0].name);

    const host = window.location.origin;
    // Route matching for K8s ingress vs local dev
    const uploadUrl = host.includes('localhost:5173')
      ? (isBatch ? 'http://localhost:8000/api/upload/batch' : 'http://localhost:8000/api/upload')
      : (isBatch ? '/api/upload/batch' : '/api/upload');

    try {
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errDetail = await response.json();
        throw new Error(errDetail.detail || 'Falha ao processar arquivo(s).');
      }

      const result = await response.json();
      
      if (isBatch) {
        alert(`Importação de lote concluída!\nSucessos: ${result.success_count}\nFalhas: ${result.failed_count}\nIgnorados: ${result.skipped_count}`);
        setRefreshListTrigger(prev => prev + 1);
        setViewMode('history');
      } else {
        setData(result);
        setRefreshListTrigger(prev => prev + 1);
        setViewMode('dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao enviar o arquivo.');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const selectActivityDetail = async (id: number) => {
    setLoading(true);
    setError(null);
    const host = window.location.origin;
    const detailUrl = host.includes('localhost:5173') 
      ? `http://localhost:8000/api/activities/${id}` 
      : `/api/activities/${id}`;

    try {
      const response = await fetch(detailUrl);
      if (!response.ok) throw new Error('Não foi possível obter os detalhes do treino.');
      const payload = await response.json();
      setData(payload);
      setViewMode('dashboard');
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar atividade.');
    } finally {
      setLoading(false);
    }
  };

  const loadDemo = () => {
    setFileName('Zepp_Amazfit_GTR3_Corrida.fit');
    setLoading(true);
    setError(null);
    setTimeout(() => {
      setData(mockActivityData);
      setLoading(false);
      setViewMode('dashboard');
    }, 800);
  };

  return (
    <div className="container">
      {/* Top Header Bar */}
      <header className="header-actions">
        <div className="logo-container" style={{ cursor: 'pointer' }} onClick={() => setViewMode('history')}>
          <span className="app-icon">🚴‍♂️</span>
          <div className="app-brand">
            <span className="app-title-main">FITParse Analyzer</span>
            <span className="app-tagline">Visualizador de Atividades Amazfit & Garmin</span>
          </div>
        </div>
        
        {/* Navigation & Modality Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {viewMode === 'dashboard' && data && (
            <div className="activity-badge-container">
              <span className="activity-type-badge">
                🏃 {translateSport(data.metadata.sport, data.metadata.sub_sport)}
              </span>
            </div>
          )}
          {viewMode === 'dashboard' && (
            <button className="btn-reset" onClick={() => setViewMode('history')}>
              📋 Ver Histórico Completo
            </button>
          )}
        </div>
      </header>

      {/* Loading state */}
      {loading && (
        <div className="loader-container card">
          <div className="spinner"></div>
          <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
            Processando telemetria e calculando métricas biomecânicas...
          </p>
        </div>
      )}

      {/* Upload and Hero Panel (History Mode) */}
      {!loading && viewMode === 'history' && (
        <section className="hero" style={{ padding: '2rem 1.5rem', gap: '0.75rem' }}>
          <span className="hero-logo" style={{ fontSize: '2.5rem' }}>📈</span>
          <h1 className="hero-title" style={{ fontSize: '2.2rem' }}>Analise suas Corridas e Caminhadas</h1>
          <p className="hero-subtitle" style={{ fontSize: '1rem', maxWidth: '700px', marginBottom: '0.5rem' }}>
            Faça upload de arquivos FIT ou envie um arquivo ZIP exportado do Zepp App para processar todo o seu histórico e gerar gráficos de tendências de longo prazo.
          </p>

          <div 
            className={`upload-card ${dragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={clickUploadArea}
            style={{ padding: '1.75rem', maxWidth: '600px' }}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept=".fit,.zip"
              multiple={true}
              onChange={handleFileChange}
            />
            <span className="upload-icon" style={{ fontSize: '2.25rem' }}>📤</span>
            <span className="upload-text" style={{ fontSize: '1.05rem' }}>Escolha arquivos .FIT ou um .ZIP</span>
            <span className="upload-subtext">Arraste seus treinos ou clique para escolher</span>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.25rem' }}>
            <button className="btn-demo" onClick={loadDemo}>
              🚀 Ver Atividade de Demonstração (Amazfit GTR 3)
            </button>
          </div>

          {error && (
            <div style={{
              marginTop: '1rem',
              backgroundColor: 'rgba(244, 63, 94, 0.1)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: 'var(--accent-rose)',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: 500
            }}>
              ⚠️ {error}
            </div>
          )}
        </section>
      )}

      {/* History List Dashboard (History Mode) */}
      {!loading && viewMode === 'history' && (
        <HistoryDashboard 
          onSelectActivity={selectActivityDetail}
          onRefreshListTrigger={refreshListTrigger}
        />
      )}

      {/* Dashboard Visualizer (Dashboard Mode) */}
      {!loading && viewMode === 'dashboard' && data && (
        <>
          {/* Top Metrics Row */}
          <MetricsDashboard summary={data.summary} estimatedSteps={data.biomechanics.estimated_steps} />

          {/* Core Content Grid */}
          <div className="dashboard-grid">
            
            {/* Map and Charts Left Panel */}
            <div className="map-chart-section">
              <RouteMap gpsPath={data.gps_path} peakHr={data.peak_hr} activePointIndex={activePointIndex} />
              <PerformanceCharts 
                chartSeries={data.chart_series} 
                summary={data.summary} 
                onHoverPoint={setActivePointIndex}
              />
              <EventTimeline events={data.timeline_events} />
            </div>

            {/* Sidebar Details Right Panel */}
            <div className="sidebar-section">
              <BiomechInsightsWidget 
                biomech={data.biomechanics} 
                sport={data.metadata.sport} 
              />
              <HeartRateZones zones={data.hr_zones} />
              <BiomechanicsWidget biomech={data.biomechanics} />
              <PeakHrWidget peakHr={data.peak_hr} />
              <MetadataWidget metadata={data.metadata} />
            </div>

            {/* Bottom section (laps and export) */}
            <div className="bottom-section">
              <LapsTable laps={data.laps} />
              <ExportDownload gpxData={data.gpx_data} csvData={data.csv_data} fileName={fileName} />
            </div>

          </div>
        </>
      )}
    </div>
  );
}
