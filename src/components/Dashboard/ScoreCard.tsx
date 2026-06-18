import React, { useEffect, useRef } from 'react';
import { getScoreColor, getScoreLabel, getScoreChange } from '../../utils/scoring';
import type { DailyEntry } from '../../types';
import { getTodayStr } from '../../utils/dateUtils';

interface Props {
  entries: DailyEntry[];
}

export default function ScoreCard({ entries }: Props) {
  const today = getTodayStr();
  const todayEntry = entries.find((e) => e.date === today);
  const score = todayEntry?.score ?? null;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  const yesterdayEntry = entries.find((e) => e.date === yesterdayStr);
  const yesterdayScore = yesterdayEntry?.score ?? null;

  const allScores = entries.filter((e) => e.score != null).map((e) => e.score!);
  const avgScore = allScores.length > 0
    ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
    : null;

  const scoreRef = useRef<HTMLDivElement>(null);
  const prevScore = useRef<number | null>(null);

  useEffect(() => {
    if (score != null && prevScore.current !== score && scoreRef.current) {
      scoreRef.current.classList.remove('score-pulse');
      void scoreRef.current.offsetWidth;
      scoreRef.current.classList.add('score-pulse');
      prevScore.current = score;
    }
  }, [score]);

  if (score == null) {
    return (
      <div className="card-section" style={{ textAlign: 'center', padding: '24px 16px' }}>
        <div style={{ fontSize: 14, color: 'var(--color-gray-600)', marginBottom: 8 }}>Hoy no registrado aún</div>
        <div style={{ fontSize: 36, fontWeight: 700, color: 'var(--color-gray-200)' }}>—</div>
        {avgScore != null && (
          <div style={{ fontSize: 13, color: 'var(--color-gray-400)', marginTop: 8 }}>
            Tu promedio: <strong>{avgScore}/100</strong>
          </div>
        )}
      </div>
    );
  }

  const color = getScoreColor(score);
  const label = getScoreLabel(score);
  const change = yesterdayScore != null ? getScoreChange(score, yesterdayScore) : null;

  return (
    <div className="card-section">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span className="section-title">Score de hoy</span>
        <span style={{ fontSize: 13, fontWeight: 600, color }}>{label}</span>
      </div>

      <div ref={scoreRef} style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 64, fontWeight: 700, lineHeight: 1, color }}>{score}</span>
        <span style={{ fontSize: 20, color: 'var(--color-gray-400)', marginBottom: 8 }}>/100</span>
      </div>

      <div style={{ height: 8, background: 'var(--color-gray-100)', borderRadius: 4, overflow: 'hidden', marginBottom: 12 }}>
        <div
          style={{
            height: '100%',
            width: `${score}%`,
            background: color,
            borderRadius: 4,
            transition: 'width 600ms ease'
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {change && (
          <div style={{ fontSize: 13, color: 'var(--color-gray-600)' }}>
            {change}
          </div>
        )}
        {avgScore != null && (
          <div style={{ fontSize: 13, color: 'var(--color-gray-600)' }}>
            Promedio: <strong style={{ color: getScoreColor(avgScore) }}>{avgScore}</strong>
          </div>
        )}
      </div>
    </div>
  );
}
