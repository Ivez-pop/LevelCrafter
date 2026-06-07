import type {
  Level,
  Tile,
} from "../types/level";

export function getTileAt(
  level: Level,
  x: number,
  y: number
): Tile {
  // Treat out-of-bounds as wall so movement callers do not need duplicate
  // bounds checks before every collision lookup.
  if (y < 0 || y >= level.height) return "wall";
  if (x < 0 || x >= level.width) return "wall";

  return level.grid[y][x];
}

/**
 * Collision facade used by movement code.
 * Keeping this as a wrapper allows future blocking tiles to be added without
 * changing every caller that currently asks only about walls.
 */
export function isWall(
  level: Level,
  x: number,
  y: number
): boolean {

  return (
    getTileAt(
      level,
      x,
      y
    ) === "wall"
  );
}
