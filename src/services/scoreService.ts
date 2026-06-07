import { getSupabaseClient } from "../lib/supabase";
import type { BestScore, CompletedGameplayRunInput } from "../types/leaderboard";

/**
 * Maps database column names to the camelCase BestScore contract used by React.
 * Keeping this conversion centralized prevents view components from depending
 * on Supabase naming details.
 */
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

export async function updateBestScore(
  run: CompletedGameplayRunInput,
  playSessionId: string | null = null,
) {
  try {
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

    const finalScore = Number((run.metadata as { finalScore?: number } | undefined)?.finalScore ?? 0);

    // Best scores are monotonic: a completed run is stored separately, but this
    // summary row only changes when the new score improves the player's record.
    if (existing && existing.best_score >= finalScore) {
      return mapBestScore(existing);
    }

    if (existing) {
      console.log("UPDATING BEST SCORE");
      const result = await supabase
        .from("best_scores")
        .update({
          best_score: finalScore,
          moves: run.moves,
          time_seconds: run.timeSeconds,
          play_session_id: playSessionId,
          achieved_at: achievedAt,
          updated_at: achievedAt,
        })
        .eq("id", existing.id)
        .select("*")
        .single();
      
      console.log("BEST SCORE RESULT", result);

      if (result.error) {
        throw result.error;
      }

      return mapBestScore(result.data);
    }

    console.log("UPDATING BEST SCORE (INSERT)");
    const result = await supabase
      .from("best_scores")
      .insert({
        user_id: run.userId,
        level_id: run.levelId,
        best_score: finalScore,
        moves: run.moves,
        time_seconds: run.timeSeconds,
        play_session_id: playSessionId,
        achieved_at: achievedAt,
        updated_at: achievedAt,
      })
      .select("*")
      .single();
      
    console.log("BEST SCORE RESULT", result);

    if (result.error) {
      throw result.error;
    }

    return mapBestScore(result.data);
  } catch (error) {
    console.error("FULL ERROR", error);
    throw error;
  }
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
