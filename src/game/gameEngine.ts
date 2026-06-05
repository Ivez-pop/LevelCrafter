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

function getVentDestination(level: Level, entry: Position): Position {
  const vents: Position[] = [];

  level.grid.forEach((row: Tile[], y: number) => {
    row.forEach((tile: Tile, x: number) => {
      if (tile === "vent") {
        vents.push({ x, y });
      }
    });
  });

  if (vents.length < 2) {
    return entry;
  }

  const entryIndex = vents.findIndex(
    (vent) => vent.x === entry.x && vent.y === entry.y,
  );

  if (entryIndex === -1) {
    return entry;
  }

  return vents[(entryIndex + 1) % vents.length];
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
    player: event === "vent" ? getVentDestination(level, next) : next,
    event,
  };
}
