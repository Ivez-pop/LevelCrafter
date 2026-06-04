import { difficultySizes, type Difficulty } from "../constants/difficulty";
import { editorTiles } from "../constants/tiles";
import type { Level, Tile } from "../types/level";

const STORAGE_KEY = "levelcrafter.levels";

function readAll(): Level[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) return [];

    return JSON.parse(raw) as Level[];
  } catch {
    return [];
  }
}

function writeAll(levels: Level[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(levels));
}

function genId() {
  return `${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(
    36,
  )}`;
}

export function saveLevel(level: Omit<Level, "id" | "createdAt">): string {
  const all = readAll();

  const id = genId();
  const createdAt = Date.now();

  const newLevel: Level = {
    id,
    createdAt,
    ...level,
  };

  all.push(newLevel);

  writeAll(all);

  return id;
}

export function getLevelsByDifficulty(difficulty: "easy" | "medium" | "hard") {
  return readAll().filter((level) => level.difficulty === difficulty);
}

export function getLevelById(id: string): Level | null {
  const all = readAll();

  return all.find((level) => level.id === id) ?? null;
}

export function importLevel(level: Omit<Level, "id" | "createdAt">): string {
  return saveLevel(level);
}

const allowedTiles = new Set<Tile>(editorTiles);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

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

export function importLevelFromCode(code: string): string {
  const binary = atob(code.trim());
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  const json = new TextDecoder().decode(bytes);

  return saveLevel(normalizeImportedLevel(JSON.parse(json)));
}
