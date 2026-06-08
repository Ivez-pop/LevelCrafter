import { getSupabaseClient } from "../lib/supabase";
import type { GlobalRankingEntry } from "../types/leaderboard";

export const DEFAULT_GLOBAL_RANKING_MIN_COMPLETED_MAPS = 3;

/**
 * Reads the materialized/global ranking view.
 * A minimum completed-map count keeps one-off high scores from dominating the
 * global board before a player has meaningful history.
 */
export async function getGlobalRankings(
  minCompletedMaps = DEFAULT_GLOBAL_RANKING_MIN_COMPLETED_MAPS,
  limit = 100,
) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("global_rankings")
    .select("*")
    .gte("completed_maps", minCompletedMaps)
    .order("global_score", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data
    .map<GlobalRankingEntry>((row, index) => ({
      rank: index + 1,
      userId: row.user_id,
      username: row.username,
      displayName: row.display_name,
      globalScore: row.global_score,
      completedMaps: row.completed_maps,
    }));
}
