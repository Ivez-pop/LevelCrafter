import { getSupabaseClient } from "../lib/supabase";
import type { Level } from "../types/level";
import type {
  BestScore,
  CompletedGameplayRunInput,
  GameplaySession,
} from "../types/leaderboard";
import type { Json } from "../types/supabase";
import { calculateCompletionScore, updateBestScore } from "./scoreService";

const DEVELOPMENT_USER_ID = "00000000-0000-4000-8000-000000000001";

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

function getCurrentGameplayUserId() {
  return (import.meta.env.VITE_LEVELCRAFTER_USER_ID as string | undefined)
    ?? DEVELOPMENT_USER_ID;
}

async function ensureLeaderboardReferences(level: Level, userId: string) {
  const supabase = getSupabaseClient();

  const { error: userError } = await supabase
    .from("users")
    .upsert({
      id: userId,
      username: "dev-player",
      display_name: "Dev Player",
    }, { onConflict: "id" });

  if (userError) {
    throw userError;
  }

  const { error: levelError } = await supabase
    .from("levels")
    .upsert({
      id: level.id,
      owner_id: null,
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
  const userId = getCurrentGameplayUserId();
  const score = calculateCompletionScore({
    coinsCollected,
    moves,
    timeSeconds,
  });

  await ensureLeaderboardReferences(level, userId);

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
