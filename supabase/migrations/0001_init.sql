-- Jc App — initial schema
-- Three modules: presence_logs, delivery_stress_logs, anti_habits.
-- Row Level Security is enabled on every table; rows are scoped to auth.uid().

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.food_type as enum ('Sushi', 'Pizza', 'Carnitas', 'Tacos', 'Otro');
create type public.anti_habit_category as enum ('Tech', 'Work', 'F1');

-- ---------------------------------------------------------------------------
-- Module 1 — Termómetro de Presencia
-- ---------------------------------------------------------------------------
create table public.presence_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  presence_score int not null check (presence_score between 1 and 5),
  mental_drift boolean not null default false,
  notes text not null default ''
);

create index presence_logs_user_created_idx
  on public.presence_logs (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Module 2 — Espejo de Consumo
-- ---------------------------------------------------------------------------
create table public.delivery_stress_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  food_type public.food_type not null,
  cost numeric(10, 2) not null default 0 check (cost >= 0),
  stress_level int not null check (stress_level between 1 and 5),
  is_emotional_patch boolean not null default false
);

create index delivery_stress_logs_user_created_idx
  on public.delivery_stress_logs (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Module 3 — El Hábito Inverso
-- ---------------------------------------------------------------------------
create table public.anti_habits (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  category public.anti_habit_category not null,
  is_locked boolean not null default false,
  lock_until timestamptz
);

create index anti_habits_user_idx on public.anti_habits (user_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.presence_logs enable row level security;
alter table public.delivery_stress_logs enable row level security;
alter table public.anti_habits enable row level security;

-- A reusable pattern: owner can do everything to their own rows.
create policy "presence_logs are owner-only"
  on public.presence_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "delivery_stress_logs are owner-only"
  on public.delivery_stress_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "anti_habits are owner-only"
  on public.anti_habits for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
