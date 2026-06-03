import type {
  Level,
  Tile,
} from "../types/level";

export function getTileAt(
  level: Level,
  x: number,
  y: number
): Tile {
  // Safe read: out-of-bounds should be treated as wall to block movement
  if (y < 0 || y >= level.height) return "wall";
  if (x < 0 || x >= level.width) return "wall";

  return level.grid[y][x];
}

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