import React from 'react';

interface ExportDownloadProps {
  gpxData: string;
  csvData: string;
  fileName: string;
}

export const ExportDownload: React.FC<ExportDownloadProps> = ({ gpxData, csvData, fileName }) => {
  
  const handleDownload = (data: string, ext: string, mimeType: string) => {
    if (!data) return;
    
    // Clean filename: strip original extension
    const baseName = fileName.replace(/\.[^/.]+$/, "");
    const finalFileName = `${baseName}_convertido.${ext}`;
    
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = finalFileName;
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card">
      <h3 className="card-title">💾 Exportar e Download</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem', lineHeight: '1.5' }}>
        Converta as informações de GPS e as séries temporais de desempenho da Amazfit em formatos compatíveis com outros aplicativos esportivos ou editores de planilhas.
      </p>
      
      <div className="export-grid">
        {gpxData ? (
          <button 
            className="btn-export gpx" 
            onClick={() => handleDownload(gpxData, 'gpx', 'application/gpx+xml')}
          >
            <span>📥 Baixar GPX (Garmin / Strava)</span>
          </button>
        ) : (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic', textAlign: 'center', padding: '0.5rem' }}>
            Dados GPS ausentes para GPX
          </div>
        )}

        {csvData ? (
          <button 
            className="btn-export csv" 
            onClick={() => handleDownload(csvData, 'csv', 'text/csv')}
          >
            <span>📥 Baixar CSV (Planilha)</span>
          </button>
        ) : (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic', textAlign: 'center', padding: '0.5rem' }}>
            Dados temporais ausentes para CSV
          </div>
        )}
      </div>
    </div>
  );
};
