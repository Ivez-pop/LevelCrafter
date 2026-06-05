import { getSupabaseClient } from "../lib/supabase";
import { difficultySizes, type Difficulty } from "../constants/difficulty";
import { editorTiles } from "../constants/tiles";
import type { Level, Tile } from "../types/level";
import type { Json } from "../types/supabase";

type LevelRow = {
  id: string;
  owner_id: string | null;
  name: string;
  difficulty: string;
  width: number;
  height: number;
  metadata: Json;
  created_at: string;
  updated_at: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mapLevelRow(row: LevelRow): Level {
  if (!isRecord(row.metadata)) {
    throw new Error("Level metadata is missing or invalid.");
  }

  const grid = row.metadata.grid;

  if (!Array.isArray(grid)) {
    throw new Error("Level metadata grid is missing or invalid.");
  }

  return {
    id: row.id,
    name: row.name,
    difficulty: row.difficulty as Difficulty,
    createdAt: Date.parse(row.created_at),
    width: row.width,
    height: row.height,
    grid: grid as Tile[][],
  };
}

function genId() {
  return `${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(
    36,
  )}`;
}

export async function saveLevel(level: Omit<Level, "id" | "createdAt">, levelId?: string): Promise<string> {
  const supabase = getSupabaseClient();
  const id = levelId ?? genId();
  const { data: userData } = await supabase.auth.getUser();
  const ownerId = userData.user?.id ?? null;

  console.log("LEVEL BEFORE SAVE", level);

  const { error } = await supabase.from("levels").upsert(
    {
      id,
      owner_id: ownerId,
      name: level.name,
      difficulty: level.difficulty,
      width: level.width,
      height: level.height,
      metadata: {
        grid: level.grid,
      },
    },
    { onConflict: "id" },
  );

  if (error) {
    throw error;
  }

  return id;
}

export async function getLevelsByDifficulty(difficulty: "easy" | "medium" | "hard") {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("levels")
    .select("id, owner_id, name, difficulty, width, height, metadata, created_at, updated_at")
    .eq("difficulty", difficulty)
    .order("created_at", { ascending: true });

  console.log("Requested Difficulty:", difficulty);
  console.log("Supabase Data:", data);
  console.log("Supabase Error:", error);

  if (error) {
    throw error;
  }

  const levels: Level[] = [];

  for (const row of data ?? []) {
    try {
      levels.push(mapLevelRow(row as LevelRow));
    } catch (error) {
      console.warn("Skipping invalid level row:", row.id, row.name, error);
    }
  }

  return levels;
}

export async function getLevelById(id: string): Promise<Level | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("levels")
    .select("id, owner_id, name, difficulty, width, height, metadata, created_at, updated_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? mapLevelRow(data as LevelRow) : null;
}

export async function importLevel(level: Omit<Level, "id" | "createdAt">): Promise<string> {
  return saveLevel(level);
}

const allowedTiles = new Set<Tile>(editorTiles);

function normalizeDifficulty(value: unknown, gridSize: number): Difficulty {
  if (
    value === "easy" ||
    value === "medium" ||
    value === "hard"
  ) {
    return value;
  }

  const inferred = Object.entries(difficultySizes).find(
    ([, size]) => size === gridSize,
  )?.[0];

  if (
    inferred === "easy" ||
    inferred === "medium" ||
    inferred === "hard"
  ) {
    return inferred;
  }

  throw new Error("Level difficulty is missing or invalid.");
}

function normalizeGrid(value: unknown): Tile[][] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error("Level grid is missing or empty.");
  }

  let playerCount = 0;
  let exitCount = 0;
  const width = Array.isArray(value[0]) ? value[0].length : 0;

  if (width === 0) {
    throw new Error("Level grid rows must contain tiles.");
  }

  const grid = value.map((row) => {
    if (!Array.isArray(row) || row.length !== width) {
      throw new Error("Level grid must be rectangular.");
    }

    return row.map((tile) => {
      if (!allowedTiles.has(tile as Tile)) {
        throw new Error("Level grid contains an unknown tile.");
      }

      if (tile === "player") {
        playerCount++;
      }

      if (tile === "exit") {
        exitCount++;
      }

      return tile as Tile;
    });
  });

  if (grid.length !== width) {
    throw new Error("Level grid must be square.");
  }

  if (playerCount !== 1) {
    throw new Error("Level must contain exactly one player.");
  }

  if (exitCount !== 1) {
    throw new Error("Level must contain exactly one exit.");
  }

  return grid;
}

function normalizeImportedLevel(value: unknown): Omit<Level, "id" | "createdAt"> {
  if (!isRecord(value)) {
    throw new Error("Level file must contain a JSON object.");
  }

  const grid = normalizeGrid(value.grid);
  const difficulty = normalizeDifficulty(value.difficulty, grid.length);
  const expectedSize = difficultySizes[difficulty];

  if (grid.length !== expectedSize) {
    throw new Error(`Level grid must be ${expectedSize}x${expectedSize}.`);
  }

  const name = typeof value.name === "string" ? value.name.trim() : "";

  return {
    name: name || "Imported Level",
    difficulty,
    width: grid[0].length,
    height: grid.length,
    grid,
  };
}

export async function importLevelFromJson(file: File): Promise<string> {
  const text = await file.text();

  return saveLevel(normalizeImportedLevel(JSON.parse(text)));
}

export function encodeLevelCode(level: Omit<Level, "id" | "createdAt">): string {
  const json = JSON.stringify(normalizeImportedLevel(level));
  const bytes = new TextEncoder().encode(json);
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");

  return btoa(binary);
}

export async function importLevelFromCode(code: string): Promise<string> {
  const binary = atob(code.trim());
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  const json = new TextDecoder().decode(bytes);

  return saveLevel(normalizeImportedLevel(JSON.parse(json)));
}
