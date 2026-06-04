import type { Level } from "../types/level";

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
  } as Level;

  all.push(newLevel);

  writeAll(all);

  return id;
}

export function getLevelsByDifficulty(difficulty: "easy" | "medium" | "hard") {
  return readAll().filter((l) => l.difficulty === difficulty);
}

export function getLevelById(id: string): Level | null {
  const all = readAll();

  return all.find((l) => l.id === id) ?? null;
}

export function importLevel(level: Omit<Level, "id" | "createdAt">): string {
  return saveLevel(level);
}
