"use client";

/**
 * Module 1 — Termómetro de Presencia (Presence Tracker).
 *
 * An evening check-in. It deliberately does not ask what you achieved; it asks
 * whether you were actually *present*. Three consecutive days of mental drift
 * trips an "Alerta de Dispersión Alta".
 */

import { useEffect, useState } from "react";
import { Moon } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { PresenceLog } from "@/lib/types";

const PRESENCE_LABELS: Record<number, string> = {
  1: "Ausente",
  2: "Disperso",
  3: "A medias",
  4: "Presente",
  5: "Plenamente aquí",
};

// Local-only history used when Supabase is not configured.
const LOCAL_KEY = "jc-app.presence_logs";

function loadLocal(): PresenceLog[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? "[]") as PresenceLog[];
  } catch {
    return [];
  }
}

function isHighDispersion(logs: PresenceLog[]): boolean {
  // logs are most-recent-first; need at least 3 and all three drifting,
  // each on a distinct calendar day.
  if (logs.length < 3) return false;
  const lastThree = logs.slice(0, 3);
  if (!lastThree.every((l) => l.mental_drift)) return false;
  const days = new Set(
    lastThree.map((l) => new Date(l.created_at ?? Date.now()).toDateString()),
  );
  return days.size === 3;
}

export default function PresenceTracker() {
  const [score, setScore] = useState(3);
  const [drift, setDrift] = useState(false);
  const [notes, setNotes] = useState("");
  const [history, setHistory] = useState<PresenceLog[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  async function refresh() {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase
        .from("presence_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3);
      setHistory((data as PresenceLog[]) ?? []);
    } else {
      setHistory(loadLocal());
    }
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submit() {
    setSaving(true);
    const entry: PresenceLog = {
      presence_score: score,
      mental_drift: drift,
      notes: notes.trim(),
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      await supabase.from("presence_logs").insert({
        presence_score: entry.presence_score,
        mental_drift: entry.mental_drift,
        notes: entry.notes,
      });
    } else {
      const next = [entry, ...loadLocal()].slice(0, 30);
      try {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
    }

    setSavedAt(new Date().toLocaleDateString("es-MX", { weekday: "long" }));
    setNotes("");
    setDrift(false);
    setScore(3);
    await refresh();
    setSaving(false);
  }

  const dispersionAlert = isHighDispersion(history);

  return (
    <section className="space-y-8">
      <header className="space-y-3">
        <p className="eyebrow inline-flex items-center gap-2">
          <Moon className="h-3.5 w-3.5" strokeWidth={1.25} />
          Termómetro de presencia
        </p>
        <h2 className="max-w-prose font-serif text-3xl leading-snug text-slate-800 dark:text-slate-100">
          ¿Estuviste realmente presente con Elisa y Nugget, o tu mente seguía
          en el código y las leyes?
        </h2>
      </header>

      {dispersionAlert && (
        <div className="border-l border-earth-400 pl-5">
          <p className="text-sm uppercase tracking-widest text-earth-500">
            Alerta de dispersión alta
          </p>
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-slate-500">
            Tres días seguidos con la mente en otro lado. No es agenda, es
            ausencia. Esta noche, deja el teléfono en otra habitación.
          </p>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-slate-500">Presencia</span>
          <span className="font-serif text-xl text-slate-700 dark:text-slate-200">
            {PRESENCE_LABELS[score]}
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={5}
          step={1}
          value={score}
          onChange={(e) => setScore(Number(e.target.value))}
          className="quiet"
          aria-label="Nivel de presencia"
        />
      </div>

      <label className="flex cursor-pointer items-center justify-between gap-4">
        <span className="max-w-prose text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          Mi mente seguía a la deriva (trabajo, pendientes, ruido).
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={drift}
          onClick={() => setDrift((d) => !d)}
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
            drift ? "bg-earth-400" : "bg-slate-300 dark:bg-slate-700"
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-cream transition-transform ${
              drift ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
      </label>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
        placeholder="Una línea, si hace falta. Sin obligación."
        className="w-full resize-none border-b border-slate-200 bg-transparent pb-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-earth-400 focus:outline-none dark:border-slate-700 dark:text-slate-200"
      />

      <div className="flex items-center gap-6">
        <button
          type="button"
          onClick={submit}
          disabled={saving}
          className="text-sm uppercase tracking-widest text-slate-700 underline-offset-8 transition-colors hover:text-earth-500 hover:underline disabled:opacity-40 dark:text-slate-200"
        >
          {saving ? "Guardando…" : "Cerrar el día"}
        </button>
        {savedAt && (
          <span className="text-xs text-slate-400">Registrado · {savedAt}</span>
        )}
      </div>
    </section>
  );
}
