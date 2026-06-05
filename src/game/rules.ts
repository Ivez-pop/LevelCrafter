import type { Tile } from "../types/level";
import { isDynamicDangerTile } from "../constants/tiles";

export type GameResult =
  | "continue"
  | "collect"
  | "restart"
  | "vent"
  | "win";

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
