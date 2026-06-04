import type { User } from "@supabase/supabase-js";
import { getSupabaseClient } from "../lib/supabase";
import type { Level } from "../types/level";
import type { Json } from "../types/supabase";
import { getGlobalRankings } from "./rankingService";

interface PublicUserRow {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface CreatedMapRow {
  id: string;
  name: string;
  difficulty: "easy" | "medium" | "hard";
  created_at: string;
}

interface PlayHistoryRow {
  id: string;
  level_id: string;
  score: number;
  moves: number;
  time_seconds: number;
  completed_at: string;
  metadata: Json;
  levels: {
    name: string | null;
  } | null;
}

export interface ProfileDashboardData {
  userId: string;
  email: string;
  username: string;
  displayName: string;
  joinDate: string;
  globalRank: number | null;
  createdMaps: CreatedMapRow[];
  playHistory: PlayHistoryRow[];
}

function readMetadataString(user: User, key: string) {
  const value = user.user_metadata?.[key];

  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

export function resolveAuthenticatedUsername(user: User) {
  return (
    readMetadataString(user, "username")
    ?? readMetadataString(user, "display_name")
    ?? user.email?.split("@")[0]?.trim()
    ?? user.email
    ?? "Anonymous"
  );
}

export async function getAuthenticatedUser() {
  const supabase = getSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!user) {
    throw new Error("You must be logged in to view this page.");
  }

  return user;
}

export async function ensurePublicUserProfile(user: User): Promise<PublicUserRow> {
  const supabase = getSupabaseClient();
  const { data: existing, error: readError } = await supabase
    .from("users")
    .select("id, username, display_name, avatar_url, created_at, updated_at")
    .eq("id", user.id)
    .maybeSingle();

  if (readError) {
    throw readError;
  }

  if (existing) {
    return existing;
  }

  const username = resolveAuthenticatedUsername(user);

  const { error: writeError } = await supabase.from("users").insert({
    id: user.id,
    username,
    display_name: username,
  });

  if (writeError) {
    throw writeError;
  }

  return {
    id: user.id,
    username,
    display_name: username,
    avatar_url: null,
    created_at: user.created_at ?? new Date().toISOString(),
    updated_at: user.updated_at ?? new Date().toISOString(),
  };
}

export async function updateUsername(newUsername: string) {
  const supabase = getSupabaseClient();
  const user = await getAuthenticatedUser();
  const username = newUsername.trim();

  if (!username) {
    throw new Error("Username cannot be empty.");
  }

  const { error: authError } = await supabase.auth.updateUser({
    data: {
      username,
      display_name: username,
    },
  });

  if (authError) {
    throw authError;
  }

  const { error: profileError } = await supabase
    .from("users")
    .update({
      username,
      display_name: username,
    })
    .eq("id", user.id);

  if (profileError) {
    throw profileError;
  }

  return ensurePublicUserProfile(user);
}

export async function publishCreatedLevel(level: Level) {
  const supabase = getSupabaseClient();
  const user = await getAuthenticatedUser().catch(() => null);

  if (!user) {
    return null;
  }

  await ensurePublicUserProfile(user);

  const { error } = await supabase
    .from("levels")
    .upsert(
      {
        id: level.id,
        owner_id: user.id,
        name: level.name,
        difficulty: level.difficulty,
        width: level.width,
        height: level.height,
        metadata: {
          source: "localStorage",
          createdAt: level.createdAt,
          grid: level.grid,
        },
      },
      { onConflict: "id" },
    );

  if (error) {
    throw error;
  }

  return level.id;
}

export async function getProfileDashboard(): Promise<ProfileDashboardData> {
  const supabase = getSupabaseClient();
  const user = await getAuthenticatedUser();
  const profile = await ensurePublicUserProfile(user);

  const [{ data: createdMaps, error: createdMapsError }, { data: playHistory, error: playHistoryError }, rankings] =
    await Promise.all([
      supabase
        .from("levels")
        .select("id, name, difficulty, created_at")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false })
        .returns<CreatedMapRow[]>(),
      supabase
        .from("play_sessions")
        .select("id, level_id, score, moves, time_seconds, completed_at, metadata, levels(name)")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false })
        .limit(10)
        .returns<PlayHistoryRow[]>(),
      getGlobalRankings(1, 1000),
    ]);

  if (createdMapsError) {
    throw createdMapsError;
  }

  if (playHistoryError) {
    throw playHistoryError;
  }

  const globalRank = rankings.find((entry) => entry.userId === user.id)?.rank ?? null;

  return {
    userId: user.id,
    email: user.email ?? "",
    username: profile.username ?? resolveAuthenticatedUsername(user),
    displayName: profile.display_name ?? profile.username ?? resolveAuthenticatedUsername(user),
    joinDate: user.created_at ?? profile.created_at,
    globalRank,
    createdMaps: createdMaps ?? [],
    playHistory: playHistory ?? [],
  };
}
