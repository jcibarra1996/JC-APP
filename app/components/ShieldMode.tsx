"use client";

/**
 * Module 3 — El Hábito Inverso (The Anti-Habit / Noise Filter).
 *
 * "Shield Mode" is the most opinionated module. When activated it does not
 * surface a single metric, project tracker or learning alert. The entire
 * dashboard is replaced by a blank field and one reminder. The point is that
 * the app actively refuses to be useful for the duration.
 *
 * State is intentionally local + persisted to localStorage so a closed tab or
 * a reload cannot be used as a loophole to peek back at the metrics. (If
 * Supabase is configured, `anti_habits` rows are the source of truth, but the
 * UX never *requires* the network to honor a lock.)
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ShieldOff } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { AntiHabitCategory } from "@/lib/types";

const STORAGE_KEY = "jc-app.shield";

interface ShieldState {
  locked: boolean;
  lockUntil: number | null; // epoch ms
}

interface ShieldContextValue extends ShieldState {
  activate: (minutes?: number, category?: AntiHabitCategory) => void;
  release: () => void;
  remaining: number | null; // ms left, or null when no timer
}

const ShieldContext = createContext<ShieldContextValue | null>(null);

export function useShield(): ShieldContextValue {
  const ctx = useContext(ShieldContext);
  if (!ctx) throw new Error("useShield must be used within <ShieldProvider>");
  return ctx;
}

export function ShieldProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ShieldState>({
    locked: false,
    lockUntil: null,
  });
  const [now, setNow] = useState<number>(() => Date.now());

  // Restore persisted lock on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as ShieldState;
      // A lapsed timer auto-releases.
      if (parsed.lockUntil && parsed.lockUntil <= Date.now()) {
        setState({ locked: false, lockUntil: null });
      } else {
        setState(parsed);
      }
    } catch {
      /* ignore malformed state */
    }
  }, []);

  // Tick once per second while locked so the countdown stays honest.
  useEffect(() => {
    if (!state.locked) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [state.locked]);

  // Auto-release when a timed lock elapses.
  useEffect(() => {
    if (state.locked && state.lockUntil && now >= state.lockUntil) {
      setState({ locked: false, lockUntil: null });
    }
  }, [now, state.locked, state.lockUntil]);

  const persist = useCallback((next: ShieldState) => {
    setState(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* storage may be unavailable; the in-memory lock still holds */
    }
  }, []);

  const activate = useCallback(
    (minutes?: number, category: AntiHabitCategory = "Tech") => {
      const lockUntil = minutes ? Date.now() + minutes * 60_000 : null;
      persist({ locked: true, lockUntil });
      setNow(Date.now());
      if (isSupabaseConfigured && supabase) {
        void supabase.from("anti_habits").insert({
          category,
          is_locked: true,
          lock_until: lockUntil ? new Date(lockUntil).toISOString() : null,
        });
      }
    },
    [persist],
  );

  const release = useCallback(() => {
    persist({ locked: false, lockUntil: null });
  }, [persist]);

  const remaining = state.lockUntil ? Math.max(0, state.lockUntil - now) : null;

  const value = useMemo<ShieldContextValue>(
    () => ({ ...state, activate, release, remaining }),
    [state, activate, release, remaining],
  );

  return (
    <ShieldContext.Provider value={value}>
      {state.locked ? <ShieldScreen /> : children}
    </ShieldContext.Provider>
  );
}

function formatRemaining(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** The blank screen that replaces the whole dashboard while locked. */
function ShieldScreen() {
  const { release, remaining } = useShield();
  return (
    <main className="dark flex min-h-screen flex-col items-center justify-center bg-charcoal px-6 text-center">
      <p className="max-w-prose font-serif text-3xl leading-snug text-slate-200 sm:text-4xl">
        Inactividad absoluta obligatoria.
        <br />
        Suelta el control.
      </p>

      {remaining !== null && (
        <p className="mt-10 font-sans text-sm tracking-widest text-slate-500">
          {formatRemaining(remaining)}
        </p>
      )}

      <button
        type="button"
        onClick={release}
        className="mt-16 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-slate-600 transition-colors hover:text-slate-400"
      >
        <ShieldOff className="h-3.5 w-3.5" strokeWidth={1.25} />
        Terminar antes
      </button>
    </main>
  );
}

/** The toggle that lives on the dashboard. */
export function ShieldToggle() {
  const { activate } = useShield();
  const options: { label: string; minutes?: number }[] = [
    { label: "30 min", minutes: 30 },
    { label: "2 horas", minutes: 120 },
    { label: "Sin límite", minutes: undefined },
  ];

  return (
    <div className="space-y-6">
      <p className="max-w-prose font-serif text-2xl leading-snug text-slate-700 dark:text-slate-300">
        Modo Escudo
      </p>
      <p className="max-w-prose text-sm leading-relaxed text-slate-500">
        Oculta todas las métricas, proyectos y alertas. Deja la pantalla en
        blanco. El filtro del ruido, no la gestión del ruido.
      </p>
      <div className="flex flex-wrap items-center gap-3 pt-2">
        {options.map((o) => (
          <button
            key={o.label}
            type="button"
            onClick={() => activate(o.minutes, "Tech")}
            className="rounded-full border border-slate-300 px-5 py-2 text-xs uppercase tracking-widest text-slate-600 transition-colors hover:border-earth-400 hover:text-earth-500 dark:border-slate-700 dark:text-slate-400"
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
