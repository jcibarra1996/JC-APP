import type { DailyEntry, AppConfig } from '../types';

/**
 * Calculates a daily score out of 100 points using a weighted system.
 *
 * Breakdown:
 *  - sleptWell = true:                8 pts
 *  - sleepHours >= sleepGoalHours:   10 pts (proportional if less)
 *  - waterGlasses / waterGoalGlasses: 8 pts max
 *  - meditated:                       5 pts
 *  - mealsCumplied ('yes'=15, 'partial'=8, 'no'=0): 15 pts
 *  - mealsCount out of 5:            10 pts max
 *  - focus 1-10 → (focus/10)*12:    12 pts max
 *  - exercised:                      15 pts
 *  - moodNight 1-10 → (moodNight/10)*10: 10 pts max
 *  - compassAnswer = true:            7 pts
 *
 * Total ceiling: 100 pts. Returns integer.
 */
export function calculateScore(entry: Partial<DailyEntry>, config: AppConfig): number {
  let total = 0;

  // Sleep quality: 8 pts
  if (entry.sleptWell === true) {
    total += 8;
  }

  // Sleep hours: 10 pts (proportional, capped at 10)
  if (entry.sleepHours != null && config.sleepGoalHours > 0) {
    const sleepScore = Math.min((entry.sleepHours / config.sleepGoalHours) * 10, 10);
    total += sleepScore;
  }

  // Water: 8 pts max (proportional)
  if (entry.waterGlasses != null && config.waterGoalGlasses > 0) {
    const waterScore = Math.min((entry.waterGlasses / config.waterGoalGlasses) * 8, 8);
    total += waterScore;
  }

  // Meditation: 5 pts
  if (entry.meditated === true) {
    total += 5;
  }

  // Meals cumplied: up to 15 pts
  if (entry.mealsCumplied === 'yes') {
    total += 15;
  } else if (entry.mealsCumplied === 'partial') {
    total += 8;
  }

  // Meals count (0-5): up to 10 pts
  if (entry.mealsCount != null && entry.mealsCount >= 0) {
    const mealsScore = Math.min((entry.mealsCount / 5) * 10, 10);
    total += mealsScore;
  }

  // Focus (1-10): up to 12 pts
  if (entry.focus != null && entry.focus >= 1) {
    const focusScore = Math.min((entry.focus / 10) * 12, 12);
    total += focusScore;
  }

  // Exercise: 15 pts
  if (entry.exercised === true) {
    total += 15;
  }

  // Mood night (1-10): up to 10 pts
  if (entry.moodNight != null && entry.moodNight >= 1) {
    const moodScore = Math.min((entry.moodNight / 10) * 10, 10);
    total += moodScore;
  }

  // Compass answer: 7 pts
  if (entry.compassAnswer === true) {
    total += 7;
  }

  // Cap at 100 and round
  return Math.round(Math.min(total, 100));
}

/**
 * Returns a color hex string based on the score.
 *  - < 50:  red    (#E63946)
 *  - 50-75: orange (#FF8C00)
 *  - > 75:  green  (#4CAF50)
 */
export function getScoreColor(score: number): string {
  if (score > 75) return '#4CAF50';
  if (score >= 50) return '#FF8C00';
  return '#E63946';
}

/**
 * Returns a Spanish label based on the score.
 *  - < 50:  'Día difícil'
 *  - 50-75: 'Buen progreso'
 *  - > 75:  'Excelente día'
 */
export function getScoreLabel(score: number): string {
  if (score > 75) return 'Excelente día';
  if (score >= 50) return 'Buen progreso';
  return 'Día difícil';
}

/**
 * Returns a human-readable comparison string between today's and yesterday's score.
 * e.g. '↑ 12 puntos vs ayer', '↓ 5 puntos vs ayer', or 'Igual que ayer'.
 */
export function getScoreChange(today: number, yesterday: number): string {
  const diff = today - yesterday;
  if (diff > 0) return `↑ ${diff} puntos vs ayer`;
  if (diff < 0) return `↓ ${Math.abs(diff)} puntos vs ayer`;
  return 'Igual que ayer';
}
