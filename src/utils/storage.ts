import type { Level } from "../types/level";

export const saveLevel = (level: Level) => {
  localStorage.setItem(`${level.difficulty}-level`, JSON.stringify(level));
};

export const loadLevel = (
  difficulty: "easy" | "medium" | "hard",
): Level | null => {
  const data = localStorage.getItem(`${difficulty}-level`);

  if (!data) {
    return null;
  }

  return JSON.parse(data) as Level;
};
