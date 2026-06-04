import React from 'react';

interface BiomechanicsData {
  avg_cadence_spm: number;
  max_cadence_spm: number;
  avg_step_len_mm: number;
}

interface BiotechInsightsProps {
  biomech: BiomechanicsData;
  sport?: string;
}

export const BiomechInsightsWidget: React.FC<BiotechInsightsProps> = ({ biomech, sport = 'running' }) => {
  const cadence = Math.round(biomech.avg_cadence_spm);
  const strideCm = Math.round(biomech.avg_step_len_mm / 10);
  const isRunning = sport.toLowerCase() === 'running';

  // Analysis variables
  let status: 'excellent' | 'normal' | 'warning' = 'normal';
  let title = '';
  let description = '';
  let suggestion = '';

  if (isRunning) {
    if (cadence < 150 && strideCm > 95) {
      status = 'warning';
      title = 'Alerta de Overstriding (Passada Excessiva)';
      description = `Sua cadência média foi baixa (${cadence} SPM) com passada longa (${strideCm} cm). Isso indica que você pode estar projetando o calcanhar muito à frente do centro de gravidade do corpo.`;
      suggestion = 'Tente dar passos mais curtos e rápidos, focando em aterrissar o pé diretamente sob os quadris para reduzir a carga de impacto nos joelhos e canelas.';
    } else if (cadence >= 170) {
      status = 'excellent';
      title = 'Excelente Ritmo e Cadência!';
      description = `Sua cadência de ${cadence} SPM está na faixa de alta eficiência para corrida. Passadas rápidas diminuem o tempo de contato com o solo e o impacto articular.`;
      suggestion = 'Mantenha esse padrão! É um ritmo excelente para prevenção de lesões e economia de energia de corrida.';
    } else {
      status = 'normal';
      title = 'Faixa de Cadência Moderada';
      description = `Sua cadência média foi de ${cadence} SPM com passada de ${strideCm} cm. É uma cadência comum para treinos leves e de trote.`;
      suggestion = 'Para melhorar a velocidade e eficiência, experimente aumentar gradualmente a frequência de passos (buscando a faixa de 165-180 SPM) mantendo a mesma velocidade.';
    }
  } else {
    // Walking analysis
    if (cadence < 85) {
      status = 'normal';
      title = 'Caminhada Regenerativa / Lenta';
      description = `Cadência média de ${cadence} SPM. Indicativo de ritmo de passeio ou regeneração pós-treino.`;
      suggestion = 'Se o objetivo for treino cardiorrespiratório ativo, procure elevar a cadência acima de 95 SPM.';
    } else if (cadence >= 90 && cadence <= 115) {
      status = 'excellent';
      title = 'Caminhada Ativa Saudável';
      description = `Cadência média de ${cadence} SPM com passos médios de ${strideCm} cm. Excelente ritmo de caminhada rápida.`;
      suggestion = 'Excelente para a saúde cardiovascular básica e queima de gordura aeróbica.';
    } else {
      status = 'normal';
      title = 'Caminhada Rápida / Ritmo Intenso';
      description = `Cadência média de ${cadence} SPM. Passadas de alta frequência para caminhada aeróbica vigorosa.`;
      suggestion = 'Bom condicionamento. Monitore para garantir que o movimento dos braços acompanhe as pernas.';
    }
  }

  // Set colors based on state
  const statusColors = {
    excellent: {
      border: '4px solid var(--accent-emerald)',
      bg: 'rgba(16, 185, 129, 0.05)',
      badgeBg: 'rgba(16, 185, 129, 0.1)',
      badgeColor: 'var(--accent-emerald)',
      icon: '🟢'
    },
    normal: {
      border: '4px solid var(--accent-indigo)',
      bg: 'rgba(99, 102, 241, 0.05)',
      badgeBg: 'rgba(99, 102, 241, 0.1)',
      badgeColor: 'var(--accent-indigo)',
      icon: '🔵'
    },
    warning: {
      border: '4px solid var(--accent-rose)',
      bg: 'rgba(244, 63, 94, 0.05)',
      badgeBg: 'rgba(244, 63, 94, 0.1)',
      badgeColor: 'var(--accent-rose)',
      icon: '⚠️'
    }
  }[status];

  return (
    <div className="card" style={{ borderLeft: statusColors.border, background: statusColors.bg }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 className="card-title" style={{ margin: 0, fontSize: '1.05rem' }}>
          💡 Insights Biomecânicos
        </h3>
        <span 
          style={{ 
            fontSize: '0.75rem', 
            padding: '0.25rem 0.5rem', 
            borderRadius: '6px', 
            background: statusColors.badgeBg, 
            color: statusColors.badgeColor,
            fontWeight: 700 
          }}
        >
          {status.toUpperCase()}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
        <p style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {statusColors.icon} {title}
        </p>
        <p style={{ color: 'var(--text-secondary)' }}>
          {description}
        </p>
        <div 
          style={{ 
            backgroundColor: 'var(--bg-primary)', 
            padding: '0.75rem', 
            borderRadius: '8px', 
            marginTop: '0.25rem',
            border: '1px solid var(--border-color)',
            fontSize: '0.8rem',
            lineHeight: 1.4
          }}
        >
          <strong style={{ color: 'var(--accent-cyan)' }}>Recomendação:</strong> {suggestion}
        </div>

        {/* Ideal ranges bar */}
        <div style={{ marginTop: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
            Zona de Cadência Recomendada ({isRunning ? 'Corrida' : 'Caminhada'}):
          </span>
          <div style={{ display: 'flex', gap: '0.2rem', height: '14px', borderRadius: '7px', overflow: 'hidden', fontSize: '0.65rem', textAlign: 'center', fontWeight: 'bold', color: '#000' }}>
            {isRunning ? (
              <>
                <div style={{ flex: '150', backgroundColor: '#f43f5e', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&lt; 150 SPM</div>
                <div style={{ flex: '20', backgroundColor: '#f59e0b', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>150-170</div>
                <div style={{ flex: '30', backgroundColor: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>170-200+</div>
              </>
            ) : (
              <>
                <div style={{ flex: '85', backgroundColor: '#6366f1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&lt; 85 SPM</div>
                <div style={{ flex: '30', backgroundColor: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>90-115</div>
                <div style={{ flex: '30', backgroundColor: '#f59e0b', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>115+</div>
              </>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            <span>Sua cadência: <strong>{cadence} SPM</strong></span>
            <span>Meta ideal: <strong>{isRunning ? '170-180+' : '90-115'} SPM</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
