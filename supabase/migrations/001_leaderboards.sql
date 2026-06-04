create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key,
  username text unique,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.levels (
  id text primary key,
  owner_id uuid references public.users(id) on delete set null,
  name text not null,
  difficulty text not null,
  width integer not null check (width > 0),
  height integer not null check (height > 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.play_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  level_id text not null references public.levels(id) on delete cascade,
  score integer not null check (score >= 0),
  moves integer not null check (moves >= 0),
  time_seconds integer not null check (time_seconds >= 0),
  completed_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.best_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  level_id text not null references public.levels(id) on delete cascade,
  best_score integer not null check (best_score >= 0),
  moves integer not null check (moves >= 0),
  time_seconds integer not null check (time_seconds >= 0),
  play_session_id uuid references public.play_sessions(id) on delete set null,
  achieved_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint best_scores_user_level_unique unique (user_id, level_id)
);

create index if not exists play_sessions_level_completed_idx
  on public.play_sessions (level_id, completed_at desc);

create index if not exists play_sessions_user_completed_idx
  on public.play_sessions (user_id, completed_at desc);

create index if not exists best_scores_level_rank_idx
  on public.best_scores (level_id, best_score desc, time_seconds asc);

create index if not exists best_scores_user_idx
  on public.best_scores (user_id);

create or replace view public.global_rankings as
select
  best_scores.user_id,
  coalesce(users.username, null) as username,
  coalesce(users.display_name, null) as display_name,
  sum(best_scores.best_score)::integer as global_score,
  count(best_scores.level_id)::integer as completed_maps
from public.best_scores
left join public.users on users.id = best_scores.user_id
group by best_scores.user_id, users.username, users.display_name;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists users_touch_updated_at on public.users;
create trigger users_touch_updated_at
before update on public.users
for each row execute function public.touch_updated_at();

drop trigger if exists levels_touch_updated_at on public.levels;
create trigger levels_touch_updated_at
before update on public.levels
for each row execute function public.touch_updated_at();

create or replace function public.record_completed_run(
  p_user_id uuid,
  p_level_id text,
  p_score integer,
  p_moves integer,
  p_time_seconds integer,
  p_completed_at timestamptz default now(),
  p_metadata jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_session public.play_sessions%rowtype;
  current_best public.best_scores%rowtype;
begin
  insert into public.play_sessions (
    user_id,
    level_id,
    score,
    moves,
    time_seconds,
    completed_at,
    metadata
  )
  values (
    p_user_id,
    p_level_id,
    p_score,
    p_moves,
    p_time_seconds,
    coalesce(p_completed_at, now()),
    coalesce(p_metadata, '{}'::jsonb)
  )
  returning * into inserted_session;

  insert into public.best_scores (
    user_id,
    level_id,
    best_score,
    moves,
    time_seconds,
    play_session_id,
    achieved_at,
    updated_at
  )
  values (
    inserted_session.user_id,
    inserted_session.level_id,
    inserted_session.score,
    inserted_session.moves,
    inserted_session.time_seconds,
    inserted_session.id,
    inserted_session.completed_at,
    now()
  )
  on conflict (user_id, level_id) do update
    set best_score = excluded.best_score,
        moves = excluded.moves,
        time_seconds = excluded.time_seconds,
        play_session_id = excluded.play_session_id,
        achieved_at = excluded.achieved_at,
        updated_at = now()
    where excluded.best_score > public.best_scores.best_score
  returning * into current_best;

  if current_best.id is null then
    select *
    into current_best
    from public.best_scores
    where user_id = inserted_session.user_id
      and level_id = inserted_session.level_id;
  end if;

  return jsonb_build_object(
    'session', jsonb_build_object(
      'id', inserted_session.id,
      'userId', inserted_session.user_id,
      'levelId', inserted_session.level_id,
      'score', inserted_session.score,
      'moves', inserted_session.moves,
      'timeSeconds', inserted_session.time_seconds,
      'completedAt', inserted_session.completed_at,
      'metadata', inserted_session.metadata
    ),
    'bestScore', jsonb_build_object(
      'id', current_best.id,
      'userId', current_best.user_id,
      'levelId', current_best.level_id,
      'bestScore', current_best.best_score,
      'moves', current_best.moves,
      'timeSeconds', current_best.time_seconds,
      'playSessionId', current_best.play_session_id,
      'achievedAt', current_best.achieved_at,
      'updatedAt', current_best.updated_at
    )
  );
end;
$$;
