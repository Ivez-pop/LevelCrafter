create or replace function public.record_completed_run(
  p_user_id uuid,
  p_level_id text,
  p_moves integer,
  p_time_seconds integer,
  p_completed_at timestamptz default now(),
  p_metadata jsonb default '{}'::jsonb,
  p_completion_status text default 'completed'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  level_row public.levels%rowtype;
  inserted_session public.play_sessions%rowtype;
  current_best public.best_scores%rowtype;
  coins_collected integer := greatest(coalesce((p_metadata ->> 'coinsCollected')::integer, 0), 0);
  normalized_bomb_preview_seconds integer := greatest(1, least(10, coalesce((p_metadata ->> 'bombPreviewSeconds')::integer, 3)));
  difficulty_multiplier numeric;
  bomb_preview_multiplier numeric;
  base_score integer := 1000;
  coin_bonus integer := coins_collected * 100;
  move_penalty integer := greatest(coalesce(p_moves, 0), 0) * 5;
  time_penalty integer := greatest(coalesce(p_time_seconds, 0), 0) * 2;
  raw_score integer := greatest(0, base_score + coin_bonus - move_penalty - time_penalty);
  final_score integer;
begin
  if p_completion_status is distinct from 'completed' then
    raise exception 'Only completed runs can be recorded.';
  end if;

  select *
    into level_row
    from public.levels
   where id = p_level_id;

  if level_row.id is null then
    raise exception 'Level not found.';
  end if;

  difficulty_multiplier := case coalesce(level_row.difficulty, 'easy')
    when 'easy' then 1.00
    when 'medium' then 1.25
    when 'hard' then 1.50
    else 1.00
  end;

  bomb_preview_multiplier := case normalized_bomb_preview_seconds
    when 10 then 1.00
    when 9 then 1.05
    when 8 then 1.10
    when 7 then 1.15
    when 6 then 1.20
    when 5 then 1.25
    when 4 then 1.30
    when 3 then 1.40
    when 2 then 1.60
    when 1 then 2.00
    else 1.00
  end;

  final_score := floor(raw_score * difficulty_multiplier * bomb_preview_multiplier);

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
    final_score,
    greatest(coalesce(p_moves, 0), 0),
    greatest(coalesce(p_time_seconds, 0), 0),
    coalesce(p_completed_at, now()),
    coalesce(p_metadata, '{}'::jsonb) || jsonb_build_object(
      'coinsCollected', coins_collected,
      'difficulty', level_row.difficulty,
      'bombPreviewSeconds', coalesce((level_row.metadata ->> 'bombPreviewSeconds')::integer, 3),
      'finalScore', final_score
    )
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
    ),
    'scoreBreakdown', jsonb_build_object(
      'baseScore', base_score,
      'coinBonus', coin_bonus,
      'movePenalty', move_penalty,
      'timePenalty', time_penalty,
      'rawScore', raw_score,
      'difficultyMultiplier', difficulty_multiplier,
      'bombPreviewMultiplier', bomb_preview_multiplier,
      'finalScore', final_score
    )
  );
end;
$$;
