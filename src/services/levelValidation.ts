import type { Tile } from "../types/level";
import { difficultySizes } from "../constants/difficulty";
import { editorTiles } from "../constants/tiles";

const allowedTiles = new Set<Tile>(editorTiles);
const traversableTiles = new Set<Tile>(["empty", "coin", "exit", "player", "vent"]);

function getVentDestination(grid: Tile[][], entryX: number, entryY: number) {
  const vents: Array<[number, number]> = [];

  grid.forEach((row, y) => {
    row.forEach((tile, x) => {
      if (tile === "vent") {
        vents.push([x, y]);
      }
    });
  });

  if (vents.length < 2) {
    return null;
  }

  const entryIndex = vents.findIndex(([x, y]) => x === entryX && y === entryY);

  if (entryIndex === -1) {
    return null;
  }

  return vents[(entryIndex + 1) % vents.length];
}

function hasPathFromPlayerToExit(grid: Tile[][]): boolean {
  let startX = -1;
  let startY = -1;

  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x] === "player") {
        startX = x;
        startY = y;
        break;
      }
    }

    if (startX !== -1) break;
  }

  if (startX === -1 || startY === -1) {
    return false;
  }

  const visited = new Set<string>([`${startX},${startY}`]);
  const queue: Array<[number, number]> = [[startX, startY]];
  const directions = [
    [0, -1],
    [0, 1],
    [-1, 0],
    [1, 0],
  ];

  while (queue.length > 0) {
    const [x, y] = queue.shift()!;

    if (grid[y][x] === "exit") {
      return true;
    }

    for (const [dx, dy] of directions) {
      const nextX = x + dx;
      const nextY = y + dy;
      const nextTile = grid[nextY]?.[nextX];

      if (
        nextTile &&
        traversableTiles.has(nextTile) &&
        !visited.has(`${nextX},${nextY}`)
      ) {
        visited.add(`${nextX},${nextY}`);
        queue.push([nextX, nextY]);

        if (nextTile === "vent") {
          const destination = getVentDestination(grid, nextX, nextY);

          if (destination) {
            const [ventX, ventY] = destination;

            if (!visited.has(`${ventX},${ventY}`)) {
              visited.add(`${ventX},${ventY}`);
              queue.push([ventX, ventY]);
            }
          }
        }
      }
    }
  }

  return false;
}

export const validateLevel = (
  levelName: string,
  grid: Tile[][],
  difficulty: string | null,
  setSaveError: (message: string) => void,
) => {
  if (!levelName || levelName.trim().length === 0) {
    setSaveError("Please enter a level name.");
    return false;
  }

  setSaveError("");

  if (grid.length === 0) {
    alert("Level is empty. Please place some tiles.");
    return false;
  }

  let playerCount = 0;
  let exitCount = 0;
  let ventCount = 0;

  for (const row of grid) {
    if (row.length !== grid.length) {
      alert("Grid dimensions are invalid.");
      return false;
    }

    for (const tile of row) {
      if (!allowedTiles.has(tile)) {
        alert("Grid contains an unknown tile.");
        return false;
      }

      if (tile === "player") {
        playerCount++;
      }

      if (tile === "exit") {
        exitCount++;
      }

      if (tile === "vent") {
        ventCount++;
      }
    }
  }

  if (playerCount === 0) {
    alert("Level must contain exactly 1 player. Currently: 0");
    return false;
  }

  if (playerCount > 1) {
    alert(`Level must contain exactly 1 player. Currently: ${playerCount}`);
    return false;
  }

  if (exitCount === 0) {
    alert("Level must contain exactly 1 exit. Currently: 0");
    return false;
  }

  if (exitCount > 1) {
    alert(`Level must contain exactly 1 exit. Currently: ${exitCount}`);
    return false;
  }

  if (ventCount === 1) {
    alert("Vents work in pairs. Add another vent or remove the single vent.");
    return false;
  }

  if (!hasPathFromPlayerToExit(grid)) {
    alert("Player cannot reach the exit.");
    return false;
  }

  if (!difficulty) {
    setSaveError("Please select a difficulty.");
    return false;
  }

  const expectedSize = difficultySizes[difficulty as "easy" | "medium" | "hard"];
  if (grid.length !== expectedSize) {
    alert(`Grid size must be ${expectedSize}x${expectedSize}.`);
    return false;
  }

  return true;
};
