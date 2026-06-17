# Jc App — Auditor de Presencia

An **anti-productivity** web app. It is not here to help you do more — it is here to
force you to protect your presence, energy and personal life (time with Elisa,
Nugget, and decompressing at Lomas Verdes). An honest mirror against attention
dispersion and decision fatigue.

## Stack

- **Next.js 14** (App Router, TypeScript)
- **Supabase** (PostgreSQL + Row Level Security)
- **Tailwind CSS** — strict "Quiet Luxury" palette (slate, cream, charcoal, muted earth)
- **Lucide React** — minimalist line icons, used sparingly

## Modules

1. **Termómetro de Presencia** (`PresenceTracker`) — an evening check-in. Asks
   whether you were *present*, not what you achieved. Three consecutive drifting
   days trigger an *Alerta de Dispersión Alta*.
2. **Espejo de Consumo** (`ConsumoMirror`) — a zero-friction meal logger that
   surfaces a single plain-text insight correlating fast food with stress peaks.
   No charts.
3. **El Hábito Inverso / Modo Escudo** (`ShieldMode`) — blanks the entire
   dashboard, leaving one reminder: *"Inactividad absoluta obligatoria. Suelta el control."*

## Getting started

```bash
npm install
cp .env.local.example .env.local   # optional — fill in Supabase creds
npm run dev
```

The app runs **without** Supabase configured: all logs persist to `localStorage`
in an ephemeral local mode. Add `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local` to persist to Postgres.

## Database

Apply the migration in `supabase/migrations/0001_init.sql` (via the Supabase
SQL editor or `supabase db push`). It creates the three tables, the required
enums, and owner-only RLS policies scoped to `auth.uid()`.

## Design system — Quiet Luxury

- Backgrounds: cream `#faf8f5` (light) / matte charcoal `#121212` (dark).
- Serif titles (high contrast) over a clean sans body.
- Generous whitespace, ultra-thin 1px muted rules instead of cards/borders.
- No bright primary colors; muted earth tones are the only accent.
