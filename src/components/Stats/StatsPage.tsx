import React, { useState } from 'react';
import type { DailyEntry, AppConfig, Insight } from '../../types';
import { detectInsights, getStreak, getWeekAvgScore, getPrevWeekAvgScore } from '../../utils/insights';
import { getDayOfWeek, getTodayStr, getWeekDays } from '../../utils/dateUtils';
import { getScoreColor } from '../../utils/scoring';
import LineChart from './charts/LineChart';
import BarChart from './charts/BarChart';

type Tab = 'resumen' | 'cuerpo' | 'mente' | 'dieta' | 'productividad';

interface Props {
  entries: DailyEntry[];
  config: AppConfig;
  onDayClick: (date: string) => void;
}

export default function StatsPage({ entries, config, onDayClick }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('resumen');

  const insights = detectInsights(entries, config);
  const streak = getStreak(entries);
  const weekAvg = getWeekAvgScore(entries);
  const prevWeekAvg = getPrevWeekAvgScore(entries);
  const weekChange = prevWeekAvg > 0
    ? Math.round(((weekAvg - prevWeekAvg) / prevWeekAvg) * 100)
    : null;

  const TABS: { id: Tab; label: string }[] = [
    { id: 'resumen', label: 'Resumen' },
    { id: 'cuerpo', label: 'Cuerpo' },
    { id: 'mente', label: 'Mente' },
    { id: 'dieta', label: 'Dieta' },
    { id: 'productividad', label: 'Productividad' },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>Estadísticas</h1>
        {streak > 0 && (
          <div className="streak-badge">
            <span style={{ fontSize: 15 }}>—</span>
            <span>{streak} días seguidos</span>
          </div>
        )}
      </div>

      {/* Tab nav */}
      <div className="tab-nav" style={{ padding: '0 20px' }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="page-content" style={{ paddingTop: 20 }}>
        {activeTab === 'resumen' && (
          <ResumenTab
            entries={entries}
            config={config}
            insights={insights}
            weekAvg={weekAvg}
            prevWeekAvg={prevWeekAvg}
            weekChange={weekChange}
            onDayClick={onDayClick}
          />
        )}
        {activeTab === 'cuerpo' && <CuerpoTab entries={entries} config={config} />}
        {activeTab === 'mente' && <MenteTab entries={entries} />}
        {activeTab === 'dieta' && <DietaTab entries={entries} />}
        {activeTab === 'productividad' && <ProductividadTab entries={entries} />}
      </div>
    </div>
  );
}

/* ─── Resumen tab ─────────────────────────────── */

function ResumenTab({
  entries, config, insights, weekAvg, prevWeekAvg, weekChange, onDayClick
}: {
  entries: DailyEntry[];
  config: AppConfig;
  insights: Insight[];
  weekAvg: number;
  prevWeekAvg: number;
  weekChange: number | null;
  onDayClick: (date: string) => void;
}) {
  const last30 = entries
    .filter((e) => e.score != null)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-14);

  const scoreData = last30.map((e) => ({
    label: getDayOfWeek(e.date),
    value: e.score!,
  }));

  const allScores = entries.filter((e) => e.score != null).map((e) => e.score!);
  const avgScore = allScores.length
    ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
    : null;

  return (
    <>
      {/* Week comparison */}
      {weekAvg > 0 && (
        <div className="card-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div>
              <div className="section-title" style={{ marginBottom: 4 }}>Esta semana</div>
              <div style={{ fontSize: 36, fontWeight: 700, color: getScoreColor(weekAvg) }}>{weekAvg}</div>
              <div style={{ fontSize: 13, color: 'var(--color-gray-400)' }}>promedio</div>
            </div>
            {weekChange !== null && (
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontSize: 18, fontWeight: 700,
                  color: weekChange >= 0 ? 'var(--color-green)' : 'var(--color-red)',
                }}>
                  {weekChange >= 0 ? '+' : ''}{weekChange}%
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-gray-400)' }}>vs semana anterior</div>
                <div style={{ fontSize: 12, color: 'var(--color-gray-400)' }}>({prevWeekAvg} antes)</div>
              </div>
            )}
          </div>
          {avgScore != null && (
            <div style={{ fontSize: 13, color: 'var(--color-gray-600)' }}>
              Promedio total: <strong>{avgScore}/100</strong> en {entries.filter((e) => e.score != null).length} días
            </div>
          )}
        </div>
      )}

      {/* Score evolution line chart */}
      {scoreData.length >= 2 && (
        <div className="card">
          <div className="section-title" style={{ marginBottom: 12 }}>Evolución de score</div>
          <LineChart data={scoreData} color="var(--color-red)" min={0} max={100} />
        </div>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span className="section-title">Patrones detectados</span>
          {insights.map((ins) => (
            <div key={ins.id} className="insight-card">
              <div className="insight-title">{ins.title}</div>
              <div className="insight-desc">{ins.description}</div>
            </div>
          ))}
        </div>
      )}

      {entries.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-title">Sin datos aún</div>
          <div className="empty-state-desc">Completa tu primer check-in para ver estadísticas.</div>
        </div>
      )}
    </>
  );
}

/* ─── Cuerpo tab ─────────────────────────────── */

function CuerpoTab({ entries, config }: { entries: DailyEntry[]; config: AppConfig }) {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date)).slice(-14);

  const sleepData = sorted.map((e) => ({
    label: getDayOfWeek(e.date),
    value: e.sleepHours,
  }));

  const waterData = sorted.map((e) => ({
    label: getDayOfWeek(e.date),
    value: e.waterGlasses > 0 ? e.waterGlasses : null,
  }));

  const exerciseDays = entries.filter((e) => e.exercised).length;
  const totalDays = entries.filter((e) => e.exercised !== null).length;
  const exercisePct = totalDays > 0 ? Math.round((exerciseDays / totalDays) * 100) : 0;

  const avgSleep = entries.filter((e) => e.sleepHours != null).length > 0
    ? Math.round((entries.reduce((acc, e) => acc + (e.sleepHours ?? 0), 0) / entries.filter((e) => e.sleepHours != null).length) * 10) / 10
    : null;

  const avgWater = entries.filter((e) => e.waterGlasses > 0).length > 0
    ? Math.round(entries.filter((e) => e.waterGlasses > 0).reduce((acc, e) => acc + e.waterGlasses, 0) / entries.filter((e) => e.waterGlasses > 0).length * 10) / 10
    : null;

  return (
    <>
      {/* Quick metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <StatBox label="Sueño prom." value={avgSleep ? `${avgSleep}h` : '—'} sub={`meta ${config.sleepGoalHours}h`} />
        <StatBox label="Ejercicio" value={exercisePct > 0 ? `${exercisePct}%` : '—'} sub={`${exerciseDays} días`} />
        <StatBox label="Agua prom." value={avgWater ? `${avgWater}` : '—'} sub={`meta ${config.waterGoalGlasses}`} />
      </div>

      {/* Sleep chart */}
      {sleepData.filter((d) => d.value !== null).length >= 2 && (
        <div className="card">
          <div className="section-title" style={{ marginBottom: 12 }}>Horas de sueño</div>
          <LineChart data={sleepData} color="var(--color-red)" min={0} max={12} />
          <div style={{ marginTop: 4, fontSize: 12, color: 'var(--color-gray-400)', textAlign: 'right' }}>
            línea punteada = meta ({config.sleepGoalHours}h)
          </div>
        </div>
      )}

      {/* Water chart */}
      {waterData.filter((d) => d.value !== null).length >= 2 && (
        <div className="card">
          <div className="section-title" style={{ marginBottom: 12 }}>Hidratación (vasos)</div>
          <LineChart
            data={waterData}
            color="#2196F3"
            min={0}
            max={Math.max(config.waterGoalGlasses + 2, 12)}
          />
        </div>
      )}

      {/* Exercise bar */}
      {totalDays > 0 && (
        <div className="card">
          <div className="section-title" style={{ marginBottom: 12 }}>Ejercicio</div>
          <BarChart
            data={[
              { label: 'Con ejercicio', value: exerciseDays, color: 'var(--color-green)' },
              { label: 'Sin ejercicio', value: totalDays - exerciseDays, color: 'var(--color-gray-200)' },
            ]}
            max={totalDays}
            valueFormat={(v) => `${v} días`}
          />
        </div>
      )}

      {entries.length === 0 && <EmptyState />}
    </>
  );
}

/* ─── Mente tab ─────────────────────────────── */

function MenteTab({ entries }: { entries: DailyEntry[] }) {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date)).slice(-14);

  const moodData = sorted.map((e) => ({
    label: getDayOfWeek(e.date),
    value: e.moodNight,
  }));

  const focusData = sorted.map((e) => ({
    label: getDayOfWeek(e.date),
    value: e.focus,
  }));

  const avgMood = entries.filter((e) => e.moodNight != null).length
    ? Math.round(entries.filter((e) => e.moodNight != null).reduce((a, e) => a + e.moodNight!, 0) / entries.filter((e) => e.moodNight != null).length * 10) / 10
    : null;

  const avgFocus = entries.filter((e) => e.focus != null).length
    ? Math.round(entries.filter((e) => e.focus != null).reduce((a, e) => a + e.focus!, 0) / entries.filter((e) => e.focus != null).length * 10) / 10
    : null;

  const moodWords = entries.filter((e) => e.moodWord).map((e) => e.moodWord!);
  const wordFreq = moodWords.reduce((acc, w) => {
    acc[w] = (acc[w] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topWords = Object.entries(wordFreq).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <StatBox label="Ánimo prom." value={avgMood ? `${avgMood}/10` : '—'} sub="últimos días" />
        <StatBox label="Enfoque prom." value={avgFocus ? `${avgFocus}/10` : '—'} sub="últimos días" />
      </div>

      {moodData.filter((d) => d.value !== null).length >= 2 && (
        <div className="card">
          <div className="section-title" style={{ marginBottom: 4 }}>Ánimo nocturno</div>
          <LineChart
            data={moodData}
            secondaryData={focusData}
            color="var(--color-red)"
            secondaryColor="var(--color-orange)"
            min={1}
            max={10}
          />
          <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--color-gray-400)' }}>
              <div style={{ width: 16, height: 2, background: 'var(--color-red)' }} />
              Ánimo
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--color-gray-400)' }}>
              <div style={{ width: 16, height: 2, background: 'var(--color-orange)', borderStyle: 'dashed' }} />
              Enfoque
            </div>
          </div>
        </div>
      )}

      {topWords.length > 0 && (
        <div className="card">
          <div className="section-title" style={{ marginBottom: 12 }}>Cómo te has sentido</div>
          <BarChart
            data={topWords.map(([word, count]) => ({
              label: word,
              value: count,
              color: 'var(--color-red)',
            }))}
            valueFormat={(v) => `${v}x`}
          />
        </div>
      )}

      {entries.length === 0 && <EmptyState />}
    </>
  );
}

/* ─── Dieta tab ─────────────────────────────── */

function DietaTab({ entries }: { entries: DailyEntry[] }) {
  const withMeals = entries.filter((e) => e.mealsCount != null);
  const avgMeals = withMeals.length
    ? Math.round((withMeals.reduce((a, e) => a + e.mealsCount!, 0) / withMeals.length) * 10) / 10
    : null;

  const adherencePct = withMeals.length
    ? Math.round((withMeals.filter((e) => e.mealsCount! >= 4).length / withMeals.length) * 100)
    : null;

  const failReasons = entries.filter((e) => e.mealFailReason).map((e) => e.mealFailReason!);
  const reasonFreq = failReasons.reduce((acc, r) => {
    acc[r] = (acc[r] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topReasons = Object.entries(reasonFreq).sort((a, b) => b[1] - a[1]);

  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date)).slice(-14);
  const mealsData = sorted.map((e) => ({
    label: getDayOfWeek(e.date),
    value: e.mealsCount,
  }));

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <StatBox label="Adherencia" value={adherencePct != null ? `${adherencePct}%` : '—'} sub="≥4/5 comidas" />
        <StatBox label="Prom. comidas" value={avgMeals != null ? `${avgMeals}/5` : '—'} sub="por día" />
      </div>

      {mealsData.filter((d) => d.value !== null).length >= 2 && (
        <div className="card">
          <div className="section-title" style={{ marginBottom: 12 }}>Comidas saludables por día</div>
          <LineChart data={mealsData} color="var(--color-green)" min={0} max={5} />
        </div>
      )}

      {topReasons.length > 0 && (
        <div className="card">
          <div className="section-title" style={{ marginBottom: 12 }}>Por qué no cumpliste</div>
          <BarChart
            data={topReasons.map(([reason, count]) => ({
              label: reason,
              value: count,
              color: 'var(--color-orange)',
            }))}
            valueFormat={(v) => `${v}x`}
          />
        </div>
      )}

      {entries.length === 0 && <EmptyState />}
    </>
  );
}

/* ─── Productividad tab ─────────────────────────────── */

function ProductividadTab({ entries }: { entries: DailyEntry[] }) {
  const meditationDays = entries.filter((e) => e.meditated).length;
  const totalWithMeditation = entries.filter((e) => e.meditated !== null).length;
  const meditationPct = totalWithMeditation > 0
    ? Math.round((meditationDays / totalWithMeditation) * 100)
    : 0;

  const medEntries = entries.filter((e) => e.meditated && e.focus != null);
  const noMedEntries = entries.filter((e) => e.meditated === false && e.focus != null);

  const avgFocusMed = medEntries.length
    ? Math.round(medEntries.reduce((a, e) => a + e.focus!, 0) / medEntries.length * 10) / 10
    : null;
  const avgFocusNoMed = noMedEntries.length
    ? Math.round(noMedEntries.reduce((a, e) => a + e.focus!, 0) / noMedEntries.length * 10) / 10
    : null;

  const compassGoodDays = entries.filter((e) => e.compassAnswer).length;
  const totalCompassDays = entries.filter((e) => e.compassAnswer !== null).length;
  const compassPct = totalCompassDays > 0
    ? Math.round((compassGoodDays / totalCompassDays) * 100)
    : 0;

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <StatBox label="Meditación" value={meditationPct > 0 ? `${meditationPct}%` : '—'} sub={`${meditationDays} días`} />
        <StatBox label="Mejor versión" value={compassPct > 0 ? `${compassPct}%` : '—'} sub={`${compassGoodDays} días`} />
      </div>

      {avgFocusMed !== null && avgFocusNoMed !== null && (
        <div className="card">
          <div className="section-title" style={{ marginBottom: 12 }}>Meditación vs Enfoque</div>
          <BarChart
            data={[
              { label: 'Con meditación', value: avgFocusMed, color: 'var(--color-green)' },
              { label: 'Sin meditación', value: avgFocusNoMed, color: 'var(--color-gray-400)' },
            ]}
            max={10}
            valueFormat={(v) => `${v}/10`}
          />
          {avgFocusMed > avgFocusNoMed && (
            <div style={{ marginTop: 10, fontSize: 13, color: 'var(--color-gray-600)', lineHeight: 1.5 }}>
              Cuando meditas, tu enfoque es{' '}
              <strong style={{ color: 'var(--color-green)' }}>
                {Math.round(((avgFocusMed - avgFocusNoMed) / avgFocusNoMed) * 100)}% mejor
              </strong>
            </div>
          )}
        </div>
      )}

      {compassPct > 0 && (
        <div className="card">
          <div className="section-title" style={{ marginBottom: 12 }}>Brújula respondida</div>
          <BarChart
            data={[
              { label: 'Me acerqué', value: compassGoodDays, color: 'var(--color-red)' },
              { label: 'No tanto', value: totalCompassDays - compassGoodDays, color: 'var(--color-gray-200)' },
            ]}
            max={totalCompassDays}
            valueFormat={(v) => `${v} días`}
          />
        </div>
      )}

      {entries.length === 0 && <EmptyState />}
    </>
  );
}

/* ─── Helpers ─────────────────────────────── */

function StatBox({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 11, color: 'var(--color-gray-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-dark)' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--color-gray-400)', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="empty-state">
      <div className="empty-state-title">Sin datos suficientes</div>
      <div className="empty-state-desc">Registra más días para ver estadísticas aquí.</div>
    </div>
  );
}
