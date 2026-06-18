import React from 'react';
import type { AppConfig, DailyEntry } from '../../types';
import { getTodayStr } from '../../utils/dateUtils';
import { getStreak, hasBeenAbsent, detectInsights } from '../../utils/insights';
import VisionCard from './VisionCard';
import WeekGrid from './WeekGrid';
import ScoreCard from './ScoreCard';

interface Props {
  config: AppConfig;
  entries: DailyEntry[];
  onStartCheckIn: () => void;
  onDayClick: (date: string) => void;
}

export default function Dashboard({ config, entries, onStartCheckIn, onDayClick }: Props) {
  const today = getTodayStr();
  const todayEntry = entries.find((e) => e.date === today);
  const hasCheckedInToday = todayEntry?.score != null;
  const streak = getStreak(entries);
  const wasAbsent = hasBeenAbsent(entries, 2);
  const insights = detectInsights(entries, config).slice(0, 2);

  const missingFields: string[] = [];
  if (!hasCheckedInToday) {
    missingFields.push('check-in de hoy');
  }

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ fontSize: 12, color: 'var(--color-gray-400)', fontWeight: 500 }}>
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>Mi dashboard</h1>
        </div>
        {streak > 1 && (
          <div className="streak-badge">
            <span style={{ color: 'var(--color-red)', fontWeight: 700 }}>{streak}</span>
            <span>días</span>
          </div>
        )}
      </div>

      <div className="page-content">
        {/* Return message after absence */}
        {wasAbsent && !hasCheckedInToday && (
          <div
            style={{
              padding: '14px 16px',
              background: 'var(--color-gray-100)',
              borderRadius: 'var(--radius-md)',
              borderLeft: '3px solid var(--color-orange)',
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Hola, te extrañamos</div>
            <div style={{ fontSize: 13, color: 'var(--color-gray-600)', lineHeight: 1.5 }}>
              Tu historia está aquí. Retoma desde hoy, sin culpa.
            </div>
          </div>
        )}

        {/* Vision card */}
        <VisionCard config={config} />

        {/* Today CTA */}
        {!hasCheckedInToday ? (
          <div className="card-section" style={{ textAlign: 'center', padding: '24px 16px' }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>¿Cómo va tu día?</div>
            <div style={{ fontSize: 14, color: 'var(--color-gray-600)', marginBottom: 20, lineHeight: 1.5 }}>
              2-3 minutos para registrar y ver tu score al instante
            </div>
            <button className="btn-primary" onClick={onStartCheckIn} type="button">
              Comenzar check-in
            </button>
          </div>
        ) : (
          <>
            <ScoreCard entries={entries} />
            <button
              className="btn-secondary"
              onClick={onStartCheckIn}
              type="button"
              style={{ fontSize: 14, padding: '10px 20px' }}
            >
              Actualizar check-in
            </button>
          </>
        )}

        {/* Week grid */}
        <div className="card">
          <WeekGrid entries={entries} onDayClick={onDayClick} />
        </div>

        {/* Quick insights */}
        {insights.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span className="section-title">Insights rápidos</span>
            {insights.map((ins) => (
              <div key={ins.id} className="insight-card">
                <div className="insight-title">{ins.title}</div>
                <div className="insight-desc">{ins.description}</div>
              </div>
            ))}
          </div>
        )}

        {/* Day history */}
        {entries.filter((e) => e.score != null).length > 0 && (
          <div>
            <span className="section-title" style={{ display: 'block', marginBottom: 10 }}>
              Historial reciente
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {entries
                .filter((e) => e.score != null)
                .sort((a, b) => b.date.localeCompare(a.date))
                .slice(0, 5)
                .map((entry) => (
                  <DayRow key={entry.date} entry={entry} onClick={() => onDayClick(entry.date)} />
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DayRow({ entry, onClick }: { entry: DailyEntry; onClick: () => void }) {
  const score = entry.score!;
  const color = score > 75 ? 'var(--color-green)' : score > 50 ? 'var(--color-orange)' : 'var(--color-red)';
  const date = new Date(entry.date + 'T12:00:00');
  const label = date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <button
      onClick={onClick}
      type="button"
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '10px 14px', background: 'var(--color-gray-100)',
        borderRadius: 'var(--radius-sm)', border: 'none', textAlign: 'left',
        cursor: 'pointer', width: '100%',
      }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 8, background: color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{score}</span>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, textTransform: 'capitalize' }}>{label}</div>
        {entry.moodWord && (
          <div style={{ fontSize: 12, color: 'var(--color-gray-400)' }}>{entry.moodWord}</div>
        )}
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-gray-400)" strokeWidth={2}>
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>
  );
}
