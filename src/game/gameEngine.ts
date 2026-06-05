import type {
  Level,
  Position,
  Tile,
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

export function getVentPositions(level: Level): Position[] {
  const vents: Position[] = [];

  level.grid.forEach((row: Tile[], y: number) => {
    row.forEach((tile: Tile, x: number) => {
      if (tile === "vent") {
        vents.push({ x, y });
      }
    });
  });

  return vents;
}

export function getVentDestinations(level: Level, entry: Position): Position[] {
  return getVentPositions(level).filter(
    (vent) => vent.x !== entry.x || vent.y !== entry.y,
  );
}

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
  const event = evaluateTile(tile);

  return {
    player: next,
    event,
  };
}
