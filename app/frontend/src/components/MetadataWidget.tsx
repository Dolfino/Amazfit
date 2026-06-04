import React from 'react';

interface DeveloperField {
  developer_data_index: number;
  field_definition_number: number;
  field_name: string;
  fit_base_type_id: string;
  native_mesg_num: string | number;
  units?: string;
}

interface DeveloperData {
  application_id?: number[];
  application_id_str?: string;
  application_id_hex?: string;
  application_version?: number;
  developer_data_index?: number;
}

interface MetadataData {
  device_name: string;
  manufacturer: string;
  software_creator: string;
  start_time_local: string;
  start_time_utc: string;
  timezone_offset_seconds: number;
  timezone_offset_hours: number;
  message_counts: Record<string, number>;
  developer_fields: DeveloperField[];
  developer_data?: DeveloperData[];
  sport?: string;
  sub_sport?: string;
  file_created_time?: string;
  activity_type?: string;
  huami_secret_xxx168: number;
  gps_quality_pct?: number;
  gps_points_count?: number;
  min_elevation?: number;
  max_elevation?: number;
  avg_elevation?: number;
}

interface MetadataWidgetProps {
  metadata: MetadataData;
}

const translateSport = (sport?: string, subSport?: string) => {
  if (!sport) return 'Desconhecido';
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

export const MetadataWidget: React.FC<MetadataWidgetProps> = ({ metadata }) => {
  return (
    <div className="card">
      <h3 className="card-title">🔍 Metadados e Campos Proprietários</h3>
      <div className="metadata-list">
        
        {/* Device Name */}
        <div className="metadata-item">
          <span className="metadata-label">Dispositivo</span>
          <span className="metadata-value highlight">{metadata.device_name}</span>
        </div>

        {/* Modalidade / Esporte */}
        <div className="metadata-item">
          <span className="metadata-label">Modalidade</span>
          <span className="metadata-value highlight" style={{ color: 'var(--accent-cyan)' }}>
            {translateSport(metadata.sport, metadata.sub_sport)}
          </span>
        </div>

        {/* Start type */}
        <div className="metadata-item">
          <span className="metadata-label">Tipo de Início</span>
          <span className="metadata-value">
            {metadata.activity_type === 'manual' ? 'Iniciado Manualmente' : 'Automático / Sensor'}
          </span>
        </div>

        {/* Software Module Creator */}
        <div className="metadata-item">
          <span className="metadata-label">Criador do Arquivo (Software)</span>
          <span className="metadata-value" style={{ fontFamily: 'monospace' }}>
            "{metadata.software_creator}"
          </span>
        </div>

        {/* UTC Start Time */}
        <div className="metadata-item">
          <span className="metadata-label">Hora de Início (UTC)</span>
          <span className="metadata-value">{metadata.start_time_utc}</span>
        </div>

        {/* Local Start Time */}
        <div className="metadata-item">
          <span className="metadata-label">Hora de Início (Local)</span>
          <span className="metadata-value highlight">{metadata.start_time_local}</span>
        </div>

        {/* File creation date */}
        {metadata.file_created_time && (
          <div className="metadata-item">
            <span className="metadata-label">Gravação do FIT</span>
            <span className="metadata-value">{metadata.file_created_time}</span>
          </div>
        )}

        {/* Timezone offset */}
        <div className="metadata-item">
          <span className="metadata-label">Fuso Horário Local</span>
          <span className="metadata-value">
            UTC {metadata.timezone_offset_hours >= 0 ? '+' : ''}
            {metadata.timezone_offset_hours.toFixed(1)} (Horário de Brasília)
          </span>
        </div>

        {/* GPS Signal Quality */}
        {metadata.gps_quality_pct !== undefined && (
          <div className="metadata-item">
            <span className="metadata-label">Taxa de Registro GPS</span>
            <span className="metadata-value highlight">
              {metadata.gps_quality_pct.toFixed(1)}% ({metadata.gps_points_count} pts)
            </span>
          </div>
        )}

        {/* Elevation profile ranges */}
        {metadata.min_elevation !== undefined && (
          <div className="metadata-item" style={{ flexDirection: 'column', gap: '0.2rem', alignItems: 'stretch' }}>
            <span className="metadata-label">Perfil de Altitude (FIT)</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '0.1rem' }}>
              <span>Altitude Min: <b>{Math.round(metadata.min_elevation)} m</b></span>
              <span>Média: <b>{Math.round(metadata.avg_elevation || 0)} m</b></span>
              <span>Max: <b>{Math.round(metadata.max_elevation || 0)} m</b></span>
            </div>
          </div>
        )}

        {/* Developer Data (Application info) */}
        {metadata.developer_data && metadata.developer_data.length > 0 && (
          <div className="metadata-item" style={{ flexDirection: 'column', gap: '0.25rem', alignItems: 'stretch' }}>
            <span className="metadata-label">Aplicativos Declarados (FIT Developer Data ID)</span>
            {metadata.developer_data.map((dd, i) => (
              <div 
                key={i} 
                style={{ 
                  backgroundColor: 'var(--bg-primary)', 
                  padding: '0.5rem', 
                  borderRadius: '6px', 
                  fontSize: '0.75rem', 
                  marginTop: '0.25rem',
                  border: '1px solid var(--border-color)' 
                }}
              >
                <strong>App ID:</strong> <code>{dd.application_id_str || dd.application_id_hex || 'Desconhecido'}</code> <br />
                <strong>Versão do App:</strong> <code>{dd.application_version || 'N/A'}</code> <br />
                <strong>Developer Index:</strong> {dd.developer_data_index}
              </div>
            ))}
          </div>
        )}

        {/* Huami Secret Value */}
        <div className="metadata-item" style={{ flexDirection: 'column', gap: '0.25rem', alignItems: 'stretch' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="metadata-label">Métrica Secret (Huami/Zepp)</span>
            <span className="metadata-value highlight" style={{ fontFamily: 'monospace' }}>
              xxx168: {metadata.huami_secret_xxx168}
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            Campo proprietário não documentado pela Garmin. Utilizado pela Huami para armazenar dados como PAI, carga ou tempo de recuperação.
          </p>
        </div>

        {/* Developer Fields */}
        <div className="metadata-item" style={{ flexDirection: 'column', gap: '0.25rem', alignItems: 'stretch' }}>
          <span className="metadata-label">Campos Extras do Desenvolvedor</span>
          {metadata.developer_fields && metadata.developer_fields.length > 0 ? (
            metadata.developer_fields.map((f, i) => (
              <div 
                key={i} 
                style={{ 
                  backgroundColor: 'var(--bg-primary)', 
                  padding: '0.5rem', 
                  borderRadius: '6px', 
                  fontSize: '0.75rem', 
                  marginTop: '0.25rem',
                  border: '1px solid var(--border-color)' 
                }}
              >
                <strong>Campo:</strong> "{f.field_name}" 
                {f.units ? ` (${f.units})` : ''} <br />
                <strong>Alvo:</strong> mensagem de tipo <code>{f.native_mesg_num}</code> (declarado, dados ausentes nos records).
              </div>
            ))
          ) : (
            <span className="metadata-value" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Nenhum campo declarado</span>
          )}
        </div>

        {/* Message Types Counter */}
        <div className="metadata-item" style={{ flexDirection: 'column', gap: '0.5rem', alignItems: 'stretch', borderBottom: 'none', marginTop: '0.5rem' }}>
          <span className="metadata-label" style={{ fontWeight: 600 }}>Mensagens FIT Encontradas no Arquivo</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', fontSize: '0.75rem' }}>
            {Object.entries(metadata.message_counts).map(([name, count]) => (
              <div 
                key={name} 
                style={{ 
                  background: 'var(--bg-tertiary)', 
                  padding: '0.3rem 0.5rem', 
                  borderRadius: '6px', 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  border: '1px solid var(--border-color)'
                }}
              >
                <code style={{ color: 'var(--accent-cyan)' }}>{name}</code>
                <span style={{ fontWeight: 'bold' }}>{count}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
