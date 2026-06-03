import type {
  Position,
} from "../types/level";

export type Direction =
  | "up"
  | "down"
  | "left"
  | "right";

export function getNextPosition(
  current: Position,
  direction: Direction
): Position {

  switch (direction) {

    case "up":
      return {
        x: current.x,
        y: current.y - 1,
      };

    case "down":
      return {
        x: current.x,
        y: current.y + 1,
      };

    case "left":
      return {
        x: current.x - 1,
        y: current.y,
      };

    case "right":
      return {
        x: current.x + 1,
        y: current.y,
      };

    default:
      return current;
  }
}