import { getSupabaseClient } from "../lib/supabase";
import type {
  BestScore,
  CompletedGameplayRunInput,
  ScoreCalculationInput,
} from "../types/leaderboard";

function mapBestScore(row: {
  id: string;
  user_id: string;
  level_id: string;
  best_score: number;
  moves: number;
  time_seconds: number;
  play_session_id: string | null;
  achieved_at: string;
  updated_at: string;
}): BestScore {
  return {
    id: row.id,
    userId: row.user_id,
    levelId: row.level_id,
    bestScore: row.best_score,
    moves: row.moves,
    timeSeconds: row.time_seconds,
    playSessionId: row.play_session_id,
    achievedAt: row.achieved_at,
    updatedAt: row.updated_at,
  };
}

export function calculateCompletionScore({
  coinsCollected,
  moves,
  timeSeconds,
  baseScore = 1000,
}: ScoreCalculationInput) {
  const coinBonus = coinsCollected * 100;
  const movePenalty = moves * 5;
  const timePenalty = timeSeconds * 2;

  return Math.max(0, baseScore + coinBonus - movePenalty - timePenalty);
}

export async function updateBestScore(
  run: CompletedGameplayRunInput,
  playSessionId: string | null = null,
) {
  const supabase = getSupabaseClient();
  const achievedAt = run.completedAt ?? new Date().toISOString();

  const { data: existing, error: readError } = await supabase
    .from("best_scores")
    .select("*")
    .eq("user_id", run.userId)
    .eq("level_id", run.levelId)
    .maybeSingle();

  if (readError) {
    throw readError;
  }

  if (existing && existing.best_score >= run.score) {
    return mapBestScore(existing);
  }

  if (existing) {
    const { data, error } = await supabase
      .from("best_scores")
      .update({
        best_score: run.score,
        moves: run.moves,
        time_seconds: run.timeSeconds,
        play_session_id: playSessionId,
        achieved_at: achievedAt,
        updated_at: achievedAt,
      })
      .eq("id", existing.id)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return mapBestScore(data);
  }

  const { data, error } = await supabase
    .from("best_scores")
    .insert({
      user_id: run.userId,
      level_id: run.levelId,
      best_score: run.score,
      moves: run.moves,
      time_seconds: run.timeSeconds,
      play_session_id: playSessionId,
      achieved_at: achievedAt,
      updated_at: achievedAt,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapBestScore(data);
}

export async function getUserBestScores(userId: string) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("best_scores")
    .select("*")
    .eq("user_id", userId)
    .order("best_score", { ascending: false });

  if (error) {
    throw error;
  }

  return data.map(mapBestScore);
}
