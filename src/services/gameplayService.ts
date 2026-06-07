import { getSupabaseClient } from "../lib/supabase";
import type { Level } from "../types/level";
import type {
  BestScore,
  CompletedGameplayRunInput,
  GameplaySession,
  ScoreBreakdown,
} from "../types/leaderboard";
import type { Json } from "../types/supabase";
import { ensurePublicUserProfile, getAuthenticatedUser, resolveAuthenticatedUsername } from "./profileService";

interface CompletedLevelInput {
  level: Level;
  coinsCollected: number;
  moves: number;
  timeSeconds: number;
}

interface RecordCompletedRunResponse {
  session: GameplaySession;
  bestScore: BestScore;
  scoreBreakdown: ScoreBreakdown;
}

function mapGameplaySession(row: {
  id: string;
  user_id: string;
  level_id: string;
  score: number;
  moves: number;
  time_seconds: number;
  completed_at: string;
  metadata: Json;
}): GameplaySession {
  return {
    id: row.id,
    userId: row.user_id,
    levelId: row.level_id,
    score: row.score,
    moves: row.moves,
    timeSeconds: row.time_seconds,
    completedAt: row.completed_at,
    metadata: row.metadata,
  };
}

/**
 * Ensures authenticated users have a public profile row before writing gameplay
 * data that is later joined for leaderboards and dashboards.
 */
async function ensureAuthenticatedUserProfile() {
  const user = await getAuthenticatedUser();

  await ensurePublicUserProfile(user);

  return {
    id: user.id,
    username: resolveAuthenticatedUsername(user),
  };
}

/**
 * Legacy two-step persistence path: insert the session, then update best score.
 * recordCompletedRun prefers the RPC so these writes can be transactionally
 * coupled when the database function is available.
 */
export async function storeGameplaySession(run: CompletedGameplayRunInput) {
  try {
    const supabase = getSupabaseClient();

    console.log("CREATING PLAY SESSION");
    const result = await supabase
      .from("play_sessions")
      .insert({
        user_id: run.userId,
        level_id: run.levelId,
        score: (run.metadata as { finalScore?: number } | undefined)?.finalScore ?? 0,
        moves: run.moves,
        time_seconds: run.timeSeconds,
        completed_at: run.completedAt,
        metadata: run.metadata ?? {},
      })
      .select("*")
      .single();

    console.log("PLAY SESSION RESULT", result);

    if (result.error) {
      throw result.error;
    }

    const session = mapGameplaySession(result.data);
    
    console.log("UPDATING BEST SCORE");
    return { session, bestScore: null };
  } catch (error) {
    console.error("FULL ERROR", error);
    throw error;
  }
}

export async function recordCompletedRun(run: CompletedGameplayRunInput): Promise<{
  session: GameplaySession;
  bestScore: BestScore;
  scoreBreakdown: ScoreBreakdown;
}> {
  try {
    const supabase = getSupabaseClient();

    console.log("CREATING PLAY SESSION (RPC)");
    const result = await supabase.rpc("record_completed_run", {
      p_user_id: run.userId,
      p_level_id: run.levelId,
      p_moves: run.moves,
      p_time_seconds: run.timeSeconds,
      p_completed_at: run.completedAt,
      p_metadata: run.metadata ?? {},
      p_completion_status: run.completionStatus ?? "completed",
    });

    console.log("PLAY SESSION RESULT", result);

    if (result.error) {
      throw result.error;
    }

    // The RPC returns both rows so callers can update UI without issuing a
    // second read after completion.
    if (!result.data || typeof result.data !== "object" || Array.isArray(result.data)) {
      throw new Error("Unexpected response from record_completed_run.");
    }

    const response = result.data as Partial<RecordCompletedRunResponse>;
    const session = response.session;
    const bestScore = response.bestScore;
    const scoreBreakdown = response.scoreBreakdown;

    if (!session || !bestScore || !scoreBreakdown) {
      throw new Error("record_completed_run did not return session, bestScore, and scoreBreakdown.");
    }

    return {
      session: session as GameplaySession,
      bestScore: bestScore as BestScore,
      scoreBreakdown: scoreBreakdown as ScoreBreakdown,
    };
  } catch (error) {
    console.error("FULL ERROR", error);
    throw error;
  }
}

export async function recordCompletedLevel({
  level,
  coinsCollected,
  moves,
  timeSeconds,
}: CompletedLevelInput) {
  // Convert local gameplay state into the persistence contract at the boundary
  // so UI hooks do not need to know about user ids or score metadata shape.
  const { id: userId } = await ensureAuthenticatedUserProfile();

  return recordCompletedRun({
    userId,
    levelId: level.id,
    moves,
    timeSeconds,
    completionStatus: "completed",
    completedAt: new Date().toISOString(),
    metadata: {
      coinsCollected,
      levelName: level.name,
      difficulty: level.difficulty,
      bombPreviewSeconds: level.bombPreviewSeconds ?? 3,
    },
  });
}
