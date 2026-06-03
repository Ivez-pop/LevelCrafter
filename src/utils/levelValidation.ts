import type { Tile } from "../types/level";
import { difficultySizes } from "../constants/difficulty";

export const validateLevel = (
  levelName: string,
  grid: Tile[][],
  difficulty: string | null,
  setSaveError: (message: string) => void,
) => {
  if (!levelName || levelName.trim().length === 0) {
    setSaveError("Please enter a level name.");
    return false;
  }

  setSaveError("");

  if (grid.length === 0) {
    alert("Level is empty. Please place some tiles.");
    return false;
  }

  let playerCount = 0;
  let exitCount = 0;

  for (const row of grid) {
    if (row.length !== grid.length) {
      alert("Grid dimensions are invalid.");
      return false;
    }

    for (const tile of row) {
      if (tile === "player") {
        playerCount++;
      }

      if (tile === "exit") {
        exitCount++;
      }
    }
  }

  if (playerCount === 0) {
    alert("Level must contain exactly 1 player. Currently: 0");
    return false;
  }

  if (playerCount > 1) {
    alert(`Level must contain exactly 1 player. Currently: ${playerCount}`);
    return false;
  }

  if (exitCount === 0) {
    alert("Level must contain at least 1 exit. Currently: 0");
    return false;
  }

  if (exitCount > 1) {
    alert(`Level should contain exactly 1 exit. Currently: ${exitCount}`);
    return false;
  }

  if (difficulty) {
    const expected = difficultySizes[difficulty as keyof typeof difficultySizes];
    if (grid.length !== expected) {
      alert(`Grid size must be ${expected} x ${expected} for ${difficulty} difficulty.`);
      return false;
    }
  }

  return true;
};
