import React from 'react';
import type { DailyEntry } from '../../types';
import { getWeekDays, getDayOfWeek, getDayNumber, isToday } from '../../utils/dateUtils';
import { getScoreColor } from '../../utils/scoring';

interface Props {
  entries: DailyEntry[];
  onDayClick?: (date: string) => void;
}

export default function WeekGrid({ entries, onDayClick }: Props) {
  const weekDays = getWeekDays();
  const entryMap = new Map(entries.map((e) => [e.date, e]));

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span className="section-title">Esta semana</span>
      </div>
      <div className="week-grid">
        {weekDays.map((date) => {
          const entry = entryMap.get(date);
          const score = entry?.score;
          const today = isToday(date);
          const hasEntry = entry != null && score != null;

          return (
            <div
              key={date}
              className="week-day"
              onClick={() => hasEntry && onDayClick?.(date)}
              style={{ cursor: hasEntry ? 'pointer' : 'default' }}
            >
              <span className="week-day-label">{getDayOfWeek(date)}</span>
              <div
                className={`week-day-box ${!hasEntry ? 'empty' : ''} ${today ? 'today' : ''}`}
                style={hasEntry ? { background: getScoreColor(score!) } : undefined}
              >
                {hasEntry ? (
                  <span style={{ fontSize: 11, fontWeight: 700 }}>{score}</span>
                ) : (
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{getDayNumber(date)}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 10, justifyContent: 'center' }}>
        {[
          { color: '#4CAF50', label: '>75' },
          { color: '#FF8C00', label: '50-75' },
          { color: '#E63946', label: '<50' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--color-gray-400)' }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: color }} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
