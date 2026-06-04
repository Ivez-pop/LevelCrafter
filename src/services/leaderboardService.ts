import { getSupabaseClient } from "../lib/supabase";
import type { LevelLeaderboardEntry } from "../types/leaderboard";

interface LevelLeaderboardRow {
  user_id: string;
  level_id: string;
  best_score: number;
  moves: number;
  time_seconds: number;
  achieved_at: string;
  users: {
    username: string | null;
    display_name: string | null;
  } | null;
}

export async function getLevelLeaderboard(levelId: string, limit = 10) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("best_scores")
    .select("user_id, level_id, best_score, moves, time_seconds, achieved_at, users(username, display_name)")
    .eq("level_id", levelId)
    .order("best_score", { ascending: false })
    .order("time_seconds", { ascending: true })
    .limit(limit)
    .returns<LevelLeaderboardRow[]>();

  if (error) {
    throw error;
  }

  return data.map<LevelLeaderboardEntry>((row, index) => ({
    rank: index + 1,
    userId: row.user_id,
    username: row.users?.username ?? null,
    displayName: row.users?.display_name ?? null,
    levelId: row.level_id,
    bestScore: row.best_score,
    moves: row.moves,
    timeSeconds: row.time_seconds,
    achievedAt: row.achieved_at,
  }));
}
