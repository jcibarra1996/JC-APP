"use client";

/**
 * Module 2 — Espejo de Consumo (Stress & Fatigue Correlator).
 *
 * A zero-friction meal logger. No charts. The insight is a single, plain
 * sentence that holds up a mirror: fast-food orders clustering with high
 * stress are read as emotional patches, not hunger.
 */

import { useEffect, useState } from "react";
import { Utensils } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { FOOD_TYPES, type DeliveryStressLog, type FoodType } from "@/lib/types";

const LOCAL_KEY = "jc-app.delivery_stress_logs";
// Foods read as "fast comfort" for the correlation.
const FAST_COMFORT: FoodType[] = ["Pizza", "Tacos", "Carnitas"];

function loadLocal(): DeliveryStressLog[] {
  try {
    return JSON.parse(
      localStorage.getItem(LOCAL_KEY) ?? "[]",
    ) as DeliveryStressLog[];
  } catch {
    return [];
  }
}

/** Returns an insight string when the last 3 orders reveal a stress pattern. */
function buildInsight(logs: DeliveryStressLog[]): string | null {
  if (logs.length < 3) return null;
  const lastThree = logs.slice(0, 3);
  const fastAndStressed = lastThree.filter(
    (l) => FAST_COMFORT.includes(l.food_type) && l.stress_level >= 4,
  );
  if (fastAndStressed.length >= 3) {
    return "Tus últimos 3 pedidos de comida rápida coinciden con picos de estrés nivel 4+. No es hambre, es fatiga mental.";
  }
  const patches = lastThree.filter((l) => l.is_emotional_patch).length;
  if (patches >= 2) {
    return "Dos de tus últimas tres cenas fueron un parche emocional. La comida está tapando algo que el día no resolvió.";
  }
  return null;
}

export default function ConsumoMirror() {
  const [food, setFood] = useState<FoodType>("Tacos");
  const [cost, setCost] = useState("");
  const [stress, setStress] = useState(3);
  const [patch, setPatch] = useState(false);
  const [history, setHistory] = useState<DeliveryStressLog[]>([]);
  const [saving, setSaving] = useState(false);

  async function refresh() {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase
        .from("delivery_stress_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3);
      setHistory((data as DeliveryStressLog[]) ?? []);
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
    const entry: DeliveryStressLog = {
      food_type: food,
      cost: Number(cost) || 0,
      stress_level: stress,
      is_emotional_patch: patch,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      await supabase.from("delivery_stress_logs").insert({
        food_type: entry.food_type,
        cost: entry.cost,
        stress_level: entry.stress_level,
        is_emotional_patch: entry.is_emotional_patch,
      });
    } else {
      const next = [entry, ...loadLocal()].slice(0, 30);
      try {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
    }

    setCost("");
    setStress(3);
    setPatch(false);
    await refresh();
    setSaving(false);
  }

  const insight = buildInsight(history);

  return (
    <section className="space-y-8">
      <header className="space-y-3">
        <p className="eyebrow inline-flex items-center gap-2">
          <Utensils className="h-3.5 w-3.5" strokeWidth={1.25} />
          Espejo de consumo
        </p>
        <h2 className="max-w-prose font-serif text-3xl leading-snug text-slate-800 dark:text-slate-100">
          ¿Qué cenaste y cómo venías?
        </h2>
      </header>

      <div className="flex flex-wrap gap-2">
        {FOOD_TYPES.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFood(f)}
            className={`rounded-full px-4 py-1.5 text-xs uppercase tracking-widest transition-colors ${
              food === f
                ? "bg-earth-400 text-cream"
                : "text-slate-500 hover:text-earth-500"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid gap-8 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm text-slate-500">Costo</span>
          <div className="mt-2 flex items-baseline gap-1 border-b border-slate-200 pb-2 dark:border-slate-700">
            <span className="text-slate-400">$</span>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              placeholder="0"
              className="w-full bg-transparent text-slate-700 placeholder:text-slate-300 focus:outline-none dark:text-slate-200"
            />
          </div>
        </label>

        <div>
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-slate-500">Estrés del día</span>
            <span className="font-serif text-xl text-slate-700 dark:text-slate-200">
              {stress}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={stress}
            onChange={(e) => setStress(Number(e.target.value))}
            className="quiet mt-3"
            aria-label="Nivel de estrés"
          />
        </div>
      </div>

      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={patch}
          onChange={(e) => setPatch(e.target.checked)}
          className="h-4 w-4 accent-earth-400"
        />
        <span className="text-sm text-slate-600 dark:text-slate-400">
          Fue un parche emocional, no hambre real.
        </span>
      </label>

      {insight && (
        <p className="max-w-prose border-l border-earth-400 pl-5 font-serif text-xl leading-relaxed text-slate-700 dark:text-slate-300">
          {insight}
        </p>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={saving}
        className="text-sm uppercase tracking-widest text-slate-700 underline-offset-8 transition-colors hover:text-earth-500 hover:underline disabled:opacity-40 dark:text-slate-200"
      >
        {saving ? "Guardando…" : "Registrar cena"}
      </button>
    </section>
  );
}
