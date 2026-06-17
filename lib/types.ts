/** Shared domain types for Jc App modules. */

export type FoodType = "Sushi" | "Pizza" | "Carnitas" | "Tacos" | "Otro";
export const FOOD_TYPES: FoodType[] = ["Sushi", "Pizza", "Carnitas", "Tacos", "Otro"];

export type AntiHabitCategory = "Tech" | "Work" | "F1";

export interface PresenceLog {
  id?: string;
  created_at?: string;
  user_id?: string | null;
  presence_score: number; // 1-5
  mental_drift: boolean;
  notes: string;
}

export interface DeliveryStressLog {
  id?: string;
  created_at?: string;
  food_type: FoodType;
  cost: number;
  stress_level: number; // 1-5
  is_emotional_patch: boolean;
}

export interface AntiHabit {
  id?: string;
  user_id?: string | null;
  category: AntiHabitCategory;
  is_locked: boolean;
  lock_until: string | null;
}
