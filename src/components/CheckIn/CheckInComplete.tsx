import React from 'react';
import type { DailyEntry, AppConfig } from '../../types';
import { getScoreColor, getScoreLabel, getScoreChange } from '../../utils/scoring';

interface Props {
  entry: DailyEntry;
  config: AppConfig;
  onClose: () => void;
}

export default function CheckInComplete({ entry, config, onClose }: Props) {
  const score = entry.score ?? 0;
  const color = getScoreColor(score);
  const label = getScoreLabel(score);

  const highlights: string[] = [];
  if (entry.exercised) highlights.push('Ejercicio completado');
  if (entry.meditated) highlights.push('Meditaste hoy');
  if (entry.sleptWell) highlights.push('Buen descanso');
  if (entry.waterGlasses >= config.waterGoalGlasses) highlights.push(`${entry.waterGlasses} vasos de agua`);
  if (entry.mealsCount != null && entry.mealsCount >= 4) highlights.push(`${entry.mealsCount}/5 comidas saludables`);

  const compassGood = entry.compassAnswer === true;
  const compassMessage = compassGood
    ? 'Hoy te acercaste a tu mejor versión.'
    : 'Un día más de info. Eso es todo.';

  return (
    <div
      style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '32px 24px', background: 'var(--color-white)',
      }}
    >
      <div style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center' }}>

        {/* Score circle */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 120, height: 120, borderRadius: '50%',
              border: `6px solid ${color}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <span style={{ fontSize: 42, fontWeight: 700, color, lineHeight: 1 }}>{score}</span>
            <span style={{ fontSize: 13, color: 'var(--color-gray-400)' }}>/100</span>
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{label}</div>
          <div style={{ fontSize: 14, color: 'var(--color-gray-600)' }}>{compassMessage}</div>
        </div>

        {/* Score bar */}
        <div style={{ width: '100%', height: 8, background: 'var(--color-gray-100)', borderRadius: 4, overflow: 'hidden' }}>
          <div
            style={{
              height: '100%', width: `${score}%`, background: color,
              borderRadius: 4, transition: 'width 800ms ease',
            }}
          />
        </div>

        {/* Highlights */}
        {highlights.length > 0 && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-gray-600)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Lo que hiciste hoy
            </span>
            {highlights.map((h) => (
              <div key={h} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--color-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                {h}
              </div>
            ))}
          </div>
        )}

        {/* Not-compass message */}
        {!compassGood && (
          <div
            style={{
              width: '100%', padding: '14px 16px', background: 'var(--color-gray-100)',
              borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--color-orange)',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Esto es información, no fracaso</div>
            <div style={{ fontSize: 13, color: 'var(--color-gray-600)', lineHeight: 1.5 }}>
              Mañana es otro día. Lo que importa es que lo registraste.
            </div>
          </div>
        )}

        {/* Mood word */}
        {entry.moodWord && (
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--color-gray-400)' }}>Hoy te sentiste: </span>
            <span style={{ fontSize: 16, fontWeight: 700 }}>{entry.moodWord}</span>
          </div>
        )}

        <button className="btn-primary" onClick={onClose} type="button" style={{ marginTop: 8 }}>
          Ver mi dashboard
        </button>
      </div>
    </div>
  );
}
