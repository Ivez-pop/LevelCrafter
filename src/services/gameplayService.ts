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

async function ensureAuthenticatedUserProfile(level: Level) {
  const supabase = getSupabaseClient();
  const user = await getAuthenticatedUser();
  await ensurePublicUserProfile(user);

  const { error: levelError } = await supabase
    .from("levels")
    .upsert({
      id: level.id,
      name: level.name,
      difficulty: level.difficulty,
      width: level.width,
      height: level.height,
      metadata: {
        source: "localStorage",
        createdAt: level.createdAt,
      },
    }, { onConflict: "id" });

  if (levelError) {
    throw levelError;
  }

  return {
    id: user.id,
    username: resolveAuthenticatedUsername(user),
  };
}

export async function storeGameplaySession(run: CompletedGameplayRunInput) {
  const supabase = getSupabaseClient();

  const { data: sessionRow, error } = await supabase
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

  if (error) {
    throw error;
  }

  const session = mapGameplaySession(sessionRow);
  const bestScore = await updateBestScore(run, session.id);

  return { session, bestScore };
}

export async function recordCompletedRun(run: CompletedGameplayRunInput): Promise<{
  session: GameplaySession;
  bestScore: BestScore;
}> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.rpc("record_completed_run", {
    p_user_id: run.userId,
    p_level_id: run.levelId,
    p_score: run.score,
    p_moves: run.moves,
    p_time_seconds: run.timeSeconds,
    p_completed_at: run.completedAt,
    p_metadata: run.metadata ?? {},
  });

  if (error) {
    throw error;
  }

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Unexpected response from record_completed_run.");
  }

  const session = (data as { session?: unknown }).session;
  const bestScore = (data as { bestScore?: unknown }).bestScore;

  if (!session || !bestScore) {
    throw new Error("record_completed_run did not return session and bestScore.");
  }

  return {
    session: session as GameplaySession,
    bestScore: bestScore as BestScore,
  };
}

export async function recordCompletedLevel({
  level,
  coinsCollected,
  moves,
  timeSeconds,
}: CompletedLevelInput) {
  const { id: userId } = await ensureAuthenticatedUserProfile(level);
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
