import type { Tile } from "../types/level";

export type GameResult =
  | "continue"
  | "collect"
  | "restart"
  | "win";

export function evaluateTile(
  tile: Tile
): GameResult {

  switch (tile) {

    case "coin":
      return "collect";

    case "hazard":
      return "restart";

    case "exit":
      return "win";

    default:
      return "continue";
  }
}