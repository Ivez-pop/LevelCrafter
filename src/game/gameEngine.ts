import type {
  Level,
  Position,
} from "../types/level";

import {
  getNextPosition,
  type Direction,
} from "./movement";

import {
  getTileAt,
  isWall,
} from "./collision";

import {
  evaluateTile,
} from "./rules";

export function processMove(
  level: Level,
  player: Position,
  direction: Direction
) {

  const next =
    getNextPosition(
      player,
      direction
    );

  if (
    isWall(
      level,
      next.x,
      next.y
    )
  ) {
    return {
      player,
      event: "blocked",
    };
  }

  const tile =
    getTileAt(
      level,
      next.x,
      next.y
    );

  return {
    player: next,
    event: evaluateTile(tile),
  };
}