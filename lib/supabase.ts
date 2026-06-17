import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase client setup.
 *
 * Jc App is designed to *also* run with no backend configured (a quiet,
 * ephemeral mode) so the auditor never becomes its own source of friction.
 * Components must check `isSupabaseConfigured` and fall back to local state
 * when it is false.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured =
  supabaseUrl.length > 0 && supabaseAnonKey.length > 0;

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
