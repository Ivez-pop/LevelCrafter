import type { Level } from "../types/level";

const STORAGE_KEY = "levelcrafter.levels";

function readAll(): Level[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Level[];
  } catch (e) {
    return [];
  }
}

function writeAll(levels: Level[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(levels));
}

function genId() {
  return `${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6)
    .toString(36)}`;
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

export function getAllLevels(): Level[] {
  return readAll();
}

export function getLevelsByDifficulty(difficulty: "easy" | "medium" | "hard") {
  return readAll().filter((l) => l.difficulty === difficulty);
}

export function getLevelById(id: string): Level | null {
  const all = readAll();
  return all.find((l) => l.id === id) ?? null;
}

export function updateLevel(id: string, patch: Partial<Omit<Level, "id" | "createdAt">>): boolean {
  const all = readAll();
  const idx = all.findIndex((l) => l.id === id);
  if (idx === -1) return false;
  const existing = all[idx];
  const updated: Level = { ...existing, ...patch } as Level;
  all[idx] = updated;
  writeAll(all);
  return true;
}

export function deleteLevel(id: string): boolean {
  const all = readAll();
  const filtered = all.filter((l) => l.id !== id);
  if (filtered.length === all.length) return false;
  writeAll(filtered);
  return true;
}

export function clearLevels(): void {
  localStorage.removeItem(STORAGE_KEY);
}
