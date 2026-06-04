import React from 'react';

interface TimelineEvent {
  name: string;
  time: string;
  elapsed: string;
  icon: string;
  desc: string;
}

interface EventTimelineProps {
  events: TimelineEvent[];
}

export const EventTimeline: React.FC<EventTimelineProps> = ({ events }) => {
  if (!events || events.length === 0) {
    return null;
  }

  return (
    <div className="card">
      <h3 className="card-title">⏱️ Linha do Tempo da Atividade</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
        Marcos importantes detectados automaticamente ao longo do trajeto com base nos dados cardíacos, geográficos e do cronômetro.
      </p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px solid var(--border-color)', margin: '0.5rem 0.5rem 0.5rem 0.75rem' }}>
        {events.map((event, index) => (
          <div key={index} style={{ position: 'relative' }}>
            {/* Bullet node */}
            <div style={{ 
              position: 'absolute', 
              left: '-2.15rem', 
              top: '0.15rem', 
              backgroundColor: 'var(--bg-secondary)', 
              border: '2px solid var(--border-color)', 
              borderRadius: '50%', 
              width: '24px', 
              height: '24px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '12px',
              zIndex: 2
            }}>
              {event.icon}
            </div>
            
            {/* Event Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{event.name}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: 600, background: 'rgba(6, 182, 212, 0.1)', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>
                  {event.time} ({event.elapsed})
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{event.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
