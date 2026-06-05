import { getSupabaseClient } from "../lib/supabase";
import type { Level } from "../types/level";
import type {
  BestScore,
  CompletedGameplayRunInput,
  GameplaySession,
} from "../types/leaderboard";
import type { Json } from "../types/supabase";
import { calculateCompletionScore, updateBestScore } from "./scoreService";
import { ensurePublicUserProfile, getAuthenticatedUser, resolveAuthenticatedUsername } from "./profileService";

interface CompletedLevelInput {
  level: Level;
  coinsCollected: number;
  moves: number;
  timeSeconds: number;
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

async function ensureAuthenticatedUserProfile() {
  const user = await getAuthenticatedUser();

  await ensurePublicUserProfile(user);

  return {
    id: user.id,
    username: resolveAuthenticatedUsername(user),
  };
}

export async function storeGameplaySession(run: CompletedGameplayRunInput) {
  try {
    const supabase = getSupabaseClient();

    console.log("CREATING PLAY SESSION");
    const result = await supabase
      .from("play_sessions")
      .insert({
        user_id: run.userId,
        level_id: run.levelId,
        score: run.score,
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
    const bestScore = await updateBestScore(run, session.id);
    console.log("BEST SCORE RESULT", { bestScore });

    return { session, bestScore };
  } catch (error) {
    console.error("FULL ERROR", error);
    throw error;
  }
}

export async function recordCompletedRun(run: CompletedGameplayRunInput): Promise<{
  session: GameplaySession;
  bestScore: BestScore;
}> {
  try {
    const supabase = getSupabaseClient();

    console.log("CREATING PLAY SESSION (RPC)");
    const result = await supabase.rpc("record_completed_run", {
      p_user_id: run.userId,
      p_level_id: run.levelId,
      p_score: run.score,
      p_moves: run.moves,
      p_time_seconds: run.timeSeconds,
      p_completed_at: run.completedAt,
      p_metadata: run.metadata ?? {},
    });

    console.log("PLAY SESSION RESULT", result);

    if (result.error) {
      throw result.error;
    }

    if (!result.data || typeof result.data !== "object" || Array.isArray(result.data)) {
      throw new Error("Unexpected response from record_completed_run.");
    }

    const session = (result.data as { session?: unknown }).session;
    const bestScore = (result.data as { bestScore?: unknown }).bestScore;

    if (!session || !bestScore) {
      throw new Error("record_completed_run did not return session and bestScore.");
    }

    return {
      session: session as GameplaySession,
      bestScore: bestScore as BestScore,
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
  const { id: userId } = await ensureAuthenticatedUserProfile();
  const score = calculateCompletionScore({
    coinsCollected,
    moves,
    timeSeconds,
  });

  return recordCompletedRun({
    userId,
    levelId: level.id,
    score,
    moves,
    timeSeconds,
    completedAt: new Date().toISOString(),
    metadata: {
      coinsCollected,
      levelName: level.name,
      difficulty: level.difficulty,
    },
  });
}
