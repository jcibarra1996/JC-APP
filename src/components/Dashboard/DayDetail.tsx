import React from 'react';
import type { DailyEntry, AppConfig } from '../../types';
import { getScoreColor, getScoreLabel } from '../../utils/scoring';

interface Props {
  entry: DailyEntry;
  config: AppConfig;
  onBack: () => void;
}

export default function DayDetail({ entry, config, onBack }: Props) {
  const score = entry.score ?? 0;
  const color = getScoreColor(score);
  const label = getScoreLabel(score);
  const date = new Date(entry.date + 'T12:00:00');
  const dateLabel = date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="page">
      <div className="page-header">
        <button onClick={onBack} type="button" style={{ color: 'var(--color-gray-600)', fontSize: 14, padding: '8px 0' }}>
          ← Volver
        </button>
        <span style={{ fontSize: 14, fontWeight: 600, textTransform: 'capitalize' }}>{dateLabel}</span>
        <div style={{ width: 40 }} />
      </div>

      <div className="page-content">
        {/* Score */}
        <div className="card-section" style={{ textAlign: 'center', padding: '24px' }}>
          <div style={{ fontSize: 64, fontWeight: 700, color, lineHeight: 1 }}>{score}</div>
          <div style={{ fontSize: 16, color: 'var(--color-gray-600)', marginTop: 4 }}>{label}</div>
          {entry.moodWord && (
            <div style={{ marginTop: 12, fontSize: 14 }}>
              Te sentiste: <strong>{entry.moodWord}</strong>
            </div>
          )}
        </div>

        {/* Morning */}
        <DetailSection title="Mañana">
          <DetailRow label="Dormiste bien" value={entry.sleptWell === null ? '—' : entry.sleptWell ? 'Sí' : 'No'} />
          <DetailRow label="Horas de sueño" value={entry.sleepHours != null ? `${entry.sleepHours}h` : '—'} />
          <DetailRow label="Vasos de agua" value={entry.waterGlasses > 0 ? `${entry.waterGlasses}` : '0'} sub={`meta: ${config.waterGoalGlasses}`} />
          <DetailRow label="Meditaste" value={entry.meditated === null ? '—' : entry.meditated ? 'Sí' : 'No'} />
        </DetailSection>

        {/* Afternoon */}
        <DetailSection title="Tarde">
          <DetailRow
            label="Alimentación"
            value={entry.mealsCumplied === null ? '—' : entry.mealsCumplied === 'yes' ? 'Bien' : entry.mealsCumplied === 'partial' ? 'Más o menos' : 'Mal'}
          />
          <DetailRow label="Enfoque" value={entry.focus != null ? `${entry.focus}/10` : '—'} />
        </DetailSection>

        {/* Night */}
        <DetailSection title="Noche">
          <DetailRow label="Ejercicio" value={entry.exercised === null ? '—' : entry.exercised ? 'Sí' : 'No'} />
          <DetailRow
            label="Comidas saludables"
            value={entry.mealsCount != null ? `${entry.mealsCount}/5` : '—'}
            sub={entry.mealFailReason ? `Razón: ${entry.mealFailReason}` : undefined}
          />
          <DetailRow label="Ánimo nocturno" value={entry.moodNight != null ? `${entry.moodNight}/10` : '—'} />
          <DetailRow
            label="Brújula"
            value={entry.compassAnswer === null ? '—' : entry.compassAnswer ? 'Me acerqué' : 'No tanto hoy'}
            highlight={entry.compassAnswer === true}
          />
        </DetailSection>

        {/* Weekly reflection */}
        {(entry.weeklyGood || entry.weeklyBad || entry.weeklyChange) && (
          <DetailSection title="Reflexión semanal">
            {entry.weeklyGood && <DetailRow label="Qué salió bien" value={entry.weeklyGood} multiline />}
            {entry.weeklyBad && <DetailRow label="Dónde fallé" value={entry.weeklyBad} multiline />}
            {entry.weeklyChange && <DetailRow label="Qué cambio" value={entry.weeklyChange} multiline />}
          </DetailSection>
        )}
      </div>
    </div>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card-section">
      <div className="section-title" style={{ marginBottom: 12 }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {children}
      </div>
    </div>
  );
}

function DetailRow({
  label, value, sub, highlight = false, multiline = false,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
  multiline?: boolean;
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: multiline ? 'flex-start' : 'center', gap: 8 }}>
      <span style={{ fontSize: 14, color: 'var(--color-gray-600)', flexShrink: 0 }}>{label}</span>
      <div style={{ textAlign: 'right' }}>
        <span style={{
          fontSize: 14, fontWeight: 600,
          color: highlight ? 'var(--color-green)' : 'var(--color-dark)',
          wordBreak: multiline ? 'break-word' : undefined,
        }}>
          {value}
        </span>
        {sub && <div style={{ fontSize: 12, color: 'var(--color-gray-400)', marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}
