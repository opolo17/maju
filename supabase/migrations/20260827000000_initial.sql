-- MAJU initial schema (Phase 0)
-- Apply via Supabase Dashboard SQL editor or `supabase db push`

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles (extends auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  locale text not null default 'ko' check (locale in ('ko', 'en', 'ja')),
  onboarding_done boolean not null default false,
  plan text not null default 'free' check (plan in ('free', 'premium', 'waitlist_lifetime')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- interview_sessions
-- ---------------------------------------------------------------------------
create table if not exists public.interview_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'draft' check (status in ('draft', 'live', 'completed', 'aborted')),
  config jsonb not null default '{}'::jsonb,
  started_at timestamptz,
  ended_at timestamptz,
  report jsonb,
  created_at timestamptz not null default now()
);

create index if not exists interview_sessions_user_id_idx on public.interview_sessions (user_id);

alter table public.interview_sessions enable row level security;

create policy "Users manage own sessions"
  on public.interview_sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- session_turns
-- ---------------------------------------------------------------------------
create table if not exists public.session_turns (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.interview_sessions (id) on delete cascade,
  role text not null check (role in ('user', 'interviewer', 'peer1', 'peer2', 'hud')),
  content text not null default '',
  audio_url text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists session_turns_session_id_idx on public.session_turns (session_id);

alter table public.session_turns enable row level security;

create policy "Users manage turns for own sessions"
  on public.session_turns for all
  using (
    exists (
      select 1 from public.interview_sessions s
      where s.id = session_turns.session_id and s.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.interview_sessions s
      where s.id = session_turns.session_id and s.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- subscriptions (Stripe — wired in Phase 3)
-- ---------------------------------------------------------------------------
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text,
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create policy "Users read own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- waitlist_grants (SheetDB email → premium redeem)
-- ---------------------------------------------------------------------------
create table if not exists public.waitlist_grants (
  email text primary key,
  granted_at timestamptz not null default now(),
  redeemed_by uuid references public.profiles (id) on delete set null
);

alter table public.waitlist_grants enable row level security;

-- No public policies — API service role only
