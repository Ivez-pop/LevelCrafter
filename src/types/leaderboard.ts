import type { Json } from "./supabase";

export interface CompletedGameplayRunInput {
  userId: string;
  levelId: string;
  score: number;
  moves: number;
  timeSeconds: number;
  completedAt?: string;
  metadata?: Json;
}

export interface GameplaySession {
  id: string;
  userId: string;
  levelId: string;
  score: number;
  moves: number;
  timeSeconds: number;
  completedAt: string;
  metadata: Json;
}

export interface BestScore {
  id: string;
  userId: string;
  levelId: string;
  bestScore: number;
  moves: number;
  timeSeconds: number;
  playSessionId: string | null;
  achievedAt: string;
  updatedAt: string;
}

export interface LevelLeaderboardEntry {
  rank: number;
  userId: string;
  username: string | null;
  displayName: string | null;
  levelId: string;
  bestScore: number;
  moves: number;
  timeSeconds: number;
  achievedAt: string;
}

export interface GlobalRankingEntry {
  rank: number;
  userId: string;
  username: string | null;
  displayName: string | null;
  globalScore: number;
  completedMaps: number;
}

export interface ScoreCalculationInput {
  coinsCollected: number;
  moves: number;
  timeSeconds: number;
  baseScore?: number;
}
