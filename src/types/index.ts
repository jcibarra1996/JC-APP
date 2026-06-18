export interface AppConfig {
  vision: string;
  visionWhy: string;
  visionPhoto: string | null;
  compassQuestion: string;
  sleepGoalHours: number;
  waterGoalGlasses: number;
  morningNotifTime: string;
  afternoonNotifTime: string;
  nightNotifTime: string;
  notificationsEnabled: boolean;
  setupComplete: boolean;
  createdAt: string;
}

export interface SleepDetail {
  quality: number; // 1-10
  type: string; // 'profundo' | 'superficial' | 'interrumpido' | 'normal'
  restedFeeling: number; // 1-10
  note: string;
}

export interface DietDetail {
  meal1: boolean;
  meal2: boolean;
  meal3: boolean;
  meal4: boolean;
  meal5: boolean;
  failReasons: string[];
  note: string;
}

export interface MoodDetail {
  moodMorning: number; // 1-10
  stress: number; // 1-10
  procrastination: boolean;
  anxietyLevel: number; // 1-10
  note: string;
}

export interface ProductivityDetail {
  workGoals: boolean;
  reading: boolean;
  readingMinutes: number;
  relationshipsQuality: number; // 1-10
  note: string;
}

export interface WellbeingDetail {
  supplements: boolean;
  note: string;
}

export interface DailyEntry {
  date: string; // YYYY-MM-DD
  // Morning
  sleptWell: boolean | null;
  sleepHours: number | null;
  waterGlasses: number;
  meditated: boolean | null;
  // Afternoon
  mealsCumplied: 'yes' | 'no' | 'partial' | null;
  focus: number | null; // 1-10
  // Night
  exercised: boolean | null;
  mealsCount: number | null; // 0-5
  mealFailReason: string | null;
  moodNight: number | null; // 1-10
  moodWord: string | null;
  compassAnswer: boolean | null;
  // Computed
  score: number | null;
  // Optional detail sections
  sleepDetail: SleepDetail | null;
  dietDetail: DietDetail | null;
  moodDetail: MoodDetail | null;
  productivityDetail: ProductivityDetail | null;
  wellbeingDetail: WellbeingDetail | null;
  // Weekly reflection (Sunday only)
  weeklyGood: string | null;
  weeklyBad: string | null;
  weeklyChange: string | null;
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface CheckInProgress {
  step: number;
  totalSteps: number;
  session: 'morning' | 'afternoon' | 'night' | 'full';
  data: Partial<DailyEntry>;
}

export type View = 'setup' | 'dashboard' | 'checkin' | 'stats' | 'day-detail' | 'weekly-reflection';

export interface AppState {
  config: AppConfig;
  entries: DailyEntry[];
  currentView: View;
  checkInProgress: CheckInProgress | null;
  selectedDate: string | null;
}

export interface Insight {
  id: string;
  type: 'positive' | 'pattern' | 'correlation' | 'achievement';
  title: string;
  description: string;
  dataPoints?: number;
}

export interface WeekStats {
  avgScore: number;
  bestDay: string;
  worstDay: string;
  totalEntries: number;
  streak: number;
}
