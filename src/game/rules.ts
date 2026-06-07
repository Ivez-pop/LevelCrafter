import type { Tile } from "../types/level";
import { isDynamicDangerTile } from "../constants/tiles";

export type GameResult =
  | "continue"
  | "collect"
  | "restart"
  | "vent"
  | "win";

/**
 * Converts a board tile into the high-level gameplay event it triggers.
 * Dynamic danger tiles intentionally share the same restart result as bombs so
 * the play hook can keep death/reset handling in one path.
 */
export function evaluateTile(
  tile: Tile
): GameResult {

  if (isDynamicDangerTile(tile)) {
    return "restart";
  }

  switch (tile) {

    case "coin":
      return "collect";

    case "hazard":
      return "restart";

    case "vent":
      return "vent";

    case "exit":
      return "win";

    default:
      return "continue";
  }
}
