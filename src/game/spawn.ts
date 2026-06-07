import type {
  Level,
  Position,
} from "../types/level";

/**
 * Finds the authored player start in a level.
 * Validation should guarantee exactly one player tile, so throwing here is a
 * hard data-integrity failure rather than a recoverable gameplay state.
 */
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
