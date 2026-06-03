import type {
  Level,
  Position,
} from "../types/level";

export function getPlayerStart(
  level: Level
): Position {

  for (let y = 0; y < level.height; y++) {

    for (let x = 0; x < level.width; x++) {

      if (
        level.grid[y][x] === "player"
      ) {
        return { x, y };
      }

    }

  }

  throw new Error(
    "Player start not found"
  );
}