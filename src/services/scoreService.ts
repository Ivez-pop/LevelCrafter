import { getSupabaseClient } from "../lib/supabase";
import type {
  BestScore,
  CompletedGameplayRunInput,
  ScoreBreakdown,
  ScoreCalculationInput,
} from "../types/leaderboard";

const DIFFICULTY_MULTIPLIERS: Record<ScoreCalculationInput["difficulty"], number> = {
  easy: 1.0,
  medium: 1.25,
  hard: 1.5,
};

const BOMB_PREVIEW_MULTIPLIERS: Record<number, number> = {
  10: 1.0,
  9: 1.05,
  8: 1.1,
  7: 1.15,
  6: 1.2,
  5: 1.25,
  4: 1.3,
  3: 1.4,
  2: 1.6,
  1: 2.0,
};

function normalizeBombPreviewSeconds(value: number | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 3;
  }

  return Math.min(10, Math.max(1, Math.floor(value)));
}

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

/**
 * Calculates the score breakdown shown to players and persisted for rankings.
 * Shorter bomb previews deliberately reward higher risk through the multiplier.
 */
export function calculateCompletionScore({
  coinsCollected,
  moves,
  timeSeconds,
  difficulty,
  bombPreviewSeconds,
}: ScoreCalculationInput) {
  const baseScore = 1000;
  const coinBonus = coinsCollected * 100;
  const movePenalty = moves * 5;
  const timePenalty = timeSeconds * 2;
  const rawScore = Math.max(0, baseScore + coinBonus - movePenalty - timePenalty);
  const difficultyMultiplier = DIFFICULTY_MULTIPLIERS[difficulty];
  const normalizedBombPreviewSeconds = normalizeBombPreviewSeconds(bombPreviewSeconds);
  const bombPreviewMultiplier =
    BOMB_PREVIEW_MULTIPLIERS[normalizedBombPreviewSeconds] ?? 1.0;
  const finalScore = Math.floor(rawScore * difficultyMultiplier * bombPreviewMultiplier);

  return {
    baseScore,
    coinBonus,
    movePenalty,
    timePenalty,
    rawScore,
    difficultyMultiplier,
    bombPreviewMultiplier,
    finalScore,
  } satisfies ScoreBreakdown;
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

    // Best scores are monotonic: a completed run is stored separately, but this
    // summary row only changes when the new score improves the player's record.
    if (existing && existing.best_score >= run.score) {
      return mapBestScore(existing);
    }

    if (existing) {
      console.log("UPDATING BEST SCORE");
      const result = await supabase
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
        best_score: run.score,
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
