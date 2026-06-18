import type { DailyEntry, Insight, AppConfig } from '../types';
import { getTodayStr, daysBetween } from './dateUtils';

const SPANISH_FULL_DAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

/**
 * Returns the current streak: consecutive days with entries up to today.
 */
export function getStreak(entries: DailyEntry[]): number {
  if (entries.length === 0) return 0;
  const dateSet = new Set(entries.map((e) => e.date));
  const today = getTodayStr();
  let streak = 0;
  let current = today;
  while (dateSet.has(current)) {
    streak++;
    const d = parseLocalDate(current);
    const prev = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1);
    const year = prev.getFullYear();
    const month = String(prev.getMonth() + 1).padStart(2, '0');
    const day = String(prev.getDate()).padStart(2, '0');
    current = `${year}-${month}-${day}`;
  }
  return streak;
}

/**
 * Returns the average score of the last 7 days.
 */
export function getWeekAvgScore(entries: DailyEntry[]): number {
  const today = getTodayStr();
  const recent = entries.filter(
    (e) => e.score != null && daysBetween(e.date, today) <= 6
  );
  if (recent.length === 0) return 0;
  return Math.round(avg(recent.map((e) => e.score as number)));
}

/**
 * Returns the average score of the 7 days before the last 7-day window.
 */
export function getPrevWeekAvgScore(entries: DailyEntry[]): number {
  const today = getTodayStr();
  const prevWeek = entries.filter(
    (e) => e.score != null && daysBetween(e.date, today) >= 7 && daysBetween(e.date, today) <= 13
  );
  if (prevWeek.length === 0) return 0;
  return Math.round(avg(prevWeek.map((e) => e.score as number)));
}

/**
 * Returns true if no entry exists within the last N days.
 */
export function hasBeenAbsent(entries: DailyEntry[], days: number): boolean {
  const today = getTodayStr();
  const recent = entries.filter((e) => daysBetween(e.date, today) <= days);
  return recent.length === 0;
}

/**
 * Detects patterns and correlations in the user's entries and returns up to 4 Insight objects.
 * Returns [] if fewer than 3 entries exist.
 */
export function detectInsights(entries: DailyEntry[], _config: AppConfig): Insight[] {
  if (entries.length < 3) return [];

  const insights: Insight[] = [];

  // 1. Best day of the week (requires >= 7 entries)
  if (entries.length >= 7) {
    const byDow: Record<number, number[]> = {};
    for (const entry of entries) {
      if (entry.score == null) continue;
      const dow = parseLocalDate(entry.date).getDay();
      if (!byDow[dow]) byDow[dow] = [];
      byDow[dow].push(entry.score);
    }
    let bestDow = -1;
    let bestAvg = -1;
    for (const [dowStr, scores] of Object.entries(byDow)) {
      if (scores.length < 2) continue;
      const a = avg(scores);
      if (a > bestAvg) {
        bestAvg = a;
        bestDow = Number(dowStr);
      }
    }
    if (bestDow >= 0) {
      insights.push({
        id: 'best-day',
        type: 'pattern',
        title: `Tu mejor día es el ${SPANISH_FULL_DAYS[bestDow]}`,
        description: `Promedias ${Math.round(bestAvg)} puntos ese día. ¡Aprovéchalo!`,
        dataPoints: entries.length,
      });
    }
  }

  // 2. Meditation → mood correlation
  const meditatedEntries = entries.filter((e) => e.meditated === true && e.moodNight != null);
  const nonMeditatedEntries = entries.filter((e) => e.meditated === false && e.moodNight != null);
  if (meditatedEntries.length >= 2 && nonMeditatedEntries.length >= 2) {
    const meditatedAvgMood = avg(meditatedEntries.map((e) => e.moodNight as number));
    const nonMeditatedAvgMood = avg(nonMeditatedEntries.map((e) => e.moodNight as number));
    const diff = Math.round((meditatedAvgMood - nonMeditatedAvgMood) * 10) / 10;
    if (diff > 0.5) {
      insights.push({
        id: 'meditation-mood',
        type: 'correlation',
        title: `Meditar mejora tu ánimo`,
        description: `Cuando meditas, tu ánimo nocturno sube ${diff.toFixed(1)} puntos en promedio.`,
        dataPoints: meditatedEntries.length + nonMeditatedEntries.length,
      });
    }
  }

  // 3. Sleep hours → focus correlation
  const sleepFocusEntries = entries.filter((e) => e.sleepHours != null && e.focus != null);
  if (sleepFocusEntries.length >= 3) {
    const goodSleep = sleepFocusEntries.filter((e) => (e.sleepHours as number) >= 7);
    const poorSleep = sleepFocusEntries.filter((e) => (e.sleepHours as number) < 7);
    if (goodSleep.length >= 2 && poorSleep.length >= 2) {
      const goodFocusAvg = avg(goodSleep.map((e) => e.focus as number));
      const poorFocusAvg = avg(poorSleep.map((e) => e.focus as number));
      const pct = Math.round(((goodFocusAvg - poorFocusAvg) / poorFocusAvg) * 100);
      if (pct > 5) {
        insights.push({
          id: 'sleep-focus',
          type: 'correlation',
          title: `Dormir más mejora tu enfoque`,
          description: `Cuando duermes 7h o más, tu enfoque es ${pct}% mejor.`,
          dataPoints: sleepFocusEntries.length,
        });
      }
    }
  }

  // 4. Current streak
  const streak = getStreak(entries);
  if (streak >= 2) {
    insights.push({
      id: 'streak',
      type: 'achievement',
      title: `Tu racha actual: ${streak} días`,
      description: streak >= 7
        ? '¡Una semana completa! Estás construyendo un hábito sólido.'
        : 'Cada día registrado te acerca más a tu mejor versión.',
      dataPoints: streak,
    });
  }

  // 5. Week over week comparison
  const weekAvg = getWeekAvgScore(entries);
  const prevWeekAvg = getPrevWeekAvgScore(entries);
  if (weekAvg > 0 && prevWeekAvg > 0) {
    const changePct = Math.round(((weekAvg - prevWeekAvg) / prevWeekAvg) * 100);
    if (changePct !== 0) {
      insights.push({
        id: 'week-comparison',
        type: changePct > 0 ? 'positive' : 'pattern',
        title: changePct > 0
          ? `Mejoraste ${changePct}% esta semana`
          : `Bajaste ${Math.abs(changePct)}% esta semana`,
        description: changePct > 0
          ? `Tu promedio esta semana es ${weekAvg} vs ${prevWeekAvg} la semana pasada.`
          : `La semana pasada promediastes ${prevWeekAvg}. ¡Esta semana puedes superarlo!`,
        dataPoints: 14,
      });
    }
  }

  // 6. This week's rolling average
  if (weekAvg > 0 && insights.length < 4) {
    insights.push({
      id: 'week-avg',
      type: 'positive',
      title: `Tu promedio esta semana: ${weekAvg}`,
      description: weekAvg >= 75
        ? '¡Excelente semana! Sigue así.'
        : weekAvg >= 50
        ? 'Buen progreso. Pequeñas mejoras hacen grandes diferencias.'
        : 'Esta semana tienes oportunidad de crecer.',
      dataPoints: 7,
    });
  }

  // 7. Exercise frequency
  const exerciseEntries = entries.filter((e) => e.exercised != null);
  if (exerciseEntries.length >= 5 && insights.length < 4) {
    const exercisedCount = exerciseEntries.filter((e) => e.exercised === true).length;
    const pct = Math.round((exercisedCount / exerciseEntries.length) * 100);
    insights.push({
      id: 'exercise-freq',
      type: pct >= 60 ? 'positive' : 'pattern',
      title: `Ejercicio en ${pct}% de los días`,
      description: pct >= 60
        ? `Has ejercitado ${exercisedCount} de ${exerciseEntries.length} días registrados.`
        : `Solo ${exercisedCount} de ${exerciseEntries.length} días con ejercicio. ¡Puedes mejorar!`,
      dataPoints: exerciseEntries.length,
    });
  }

  // Return max 4 insights
  return insights.slice(0, 4);
}
