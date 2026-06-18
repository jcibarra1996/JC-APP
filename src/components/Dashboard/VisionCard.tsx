import React from 'react';
import type { AppConfig } from '../../types';

interface Props {
  config: AppConfig;
}

export default function VisionCard({ config }: Props) {
  return (
    <div className="vision-card">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        {config.visionPhoto ? (
          <img
            src={config.visionPhoto}
            alt="Tu visión"
            className="vision-photo"
            style={{ flexShrink: 0 }}
          />
        ) : (
          <div
            style={{
              width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
              background: 'rgba(230, 57, 70, 0.3)', border: '2px solid var(--color-red)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}>
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-red)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
            Mi mejor versión
          </div>
          <p className="vision-text">{config.vision}</p>
          {config.visionWhy && (
            <p className="vision-why">{config.visionWhy}</p>
          )}
        </div>
      </div>

      {config.compassQuestion && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.15)' }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 500, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Brújula de hoy
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 1.4 }}>
            {config.compassQuestion}
          </div>
        </div>
      )}
    </div>
  );
}
