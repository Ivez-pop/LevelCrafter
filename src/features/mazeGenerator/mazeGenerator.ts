import type { Tile } from "../../types/level";

export type MazeAlgorithm = "dfs";

export interface GenerateMazeOptions {
  width: number;
  height: number;
  algorithm?: MazeAlgorithm;
}

type Cell = [number, number];
type CoordKey = `${number},${number}`;

function createWallGrid(width: number, height: number) {
  return Array.from({ length: height }, () =>
    Array.from({ length: width }, () => "wall" as Tile),
  );
}

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function keyOf(x: number, y: number): CoordKey {
  return `${x},${y}`;
}

function getOddCoordinates(limit: number) {
  const coordinates: number[] = [];

  for (let index = 1; index < limit - 1; index += 2) {
    coordinates.push(index);
  }

  return coordinates;
}

function getEvenBandIndex(limit: number) {
  // Perfect-maze carving works on odd interior cells. Even-sized boards get an
  // extra interior band connected after DFS so supported difficulties stay full.
  return limit - 2;
}

function getCarveDirections() {
  return shuffle<Cell>([
    [0, -2],
    [2, 0],
    [0, 2],
    [-2, 0],
  ]);
}

function getPathCells(grid: Tile[][]) {
  const cells: Cell[] = [];

  grid.forEach((row, y) => {
    row.forEach((tile, x) => {
      if (tile === "empty") {
        cells.push([x, y]);
      }
    });
  });

  return cells;
}

function shortestPathDistance(grid: Tile[][], start: Cell, target: Cell) {
  const queue: Array<[number, number, number]> = [[start[0], start[1], 0]];
  const visited = new Set<CoordKey>([keyOf(start[0], start[1])]);
  const traversable = new Set<Tile>(["empty", "player", "exit"]);
  const directions: Cell[] = [
    [0, -1],
    [1, 0],
    [0, 1],
    [-1, 0],
  ];

  while (queue.length > 0) {
    const [x, y, distance] = queue.shift()!;

    if (x === target[0] && y === target[1]) {
      return distance;
    }

    for (const [dx, dy] of directions) {
      const nextX = x + dx;
      const nextY = y + dy;
      const nextTile = grid[nextY]?.[nextX];
      const nextKey = keyOf(nextX, nextY);

      if (nextTile && traversable.has(nextTile) && !visited.has(nextKey)) {
        visited.add(nextKey);
        queue.push([nextX, nextY, distance + 1]);
      }
    }
  }

  return Number.POSITIVE_INFINITY;
}

function pickRandom<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

/**
 * Chooses player and exit cells that are far apart by path distance, not just
 * by coordinates, so generated mazes feel like real runs instead of short walks.
 */
function selectEndpoints(grid: Tile[][]) {
  const pathCells = getPathCells(grid);

  if (pathCells.length < 2) {
    return null;
  }

  const minDistance = Math.max(4, Math.floor(pathCells.length * 0.5));
  const shuffledCells = shuffle(pathCells);

  for (const start of shuffledCells) {
    const candidates = shuffle(
      pathCells.filter(([x, y]) => x !== start[0] || y !== start[1]),
    );

    const farEnough = candidates.filter((candidate) => {
      const distance = shortestPathDistance(grid, start, candidate);

      return distance >= minDistance;
    });

    if (farEnough.length > 0) {
      return {
        start,
        exit: pickRandom(farEnough),
      };
    }
  }

  const start = shuffledCells[0];
  const exit = shuffledCells.find(([x, y]) => x !== start[0] || y !== start[1]) ?? shuffledCells[1];

  return exit ? { start, exit } : null;
}

function carveDfsMaze(width: number, height: number) {
  const grid = createWallGrid(width, height);

  if (width < 3 || height < 3) {
    const playerX = Math.min(0, width - 1);
    const playerY = Math.min(0, height - 1);
    const exitX = Math.max(0, width - 1);
    const exitY = Math.max(0, height - 1);

    grid[playerY][playerX] = "player";
    grid[exitY][exitX] = "exit";
    return grid;
  }

  const oddX = getOddCoordinates(width);
  const oddY = getOddCoordinates(height);

  if (oddX.length === 0 || oddY.length === 0) {
    const playerX = Math.min(1, width - 1);
    const playerY = Math.min(1, height - 1);
    const exitX = Math.max(0, width - 1);
    const exitY = Math.max(0, height - 1);

    grid[playerY][playerX] = "player";
    grid[exitY][exitX] = "exit";
    return grid;
  }

  const start: Cell = [oddX[0], oddY[0]];
  const visited = new Set<string>([keyOf(start[0], start[1])]);
  const stack: Cell[] = [start];

  grid[start[1]][start[0]] = "empty";

  // DFS steps two cells at a time and carves the wall between cells, producing a
  // connected maze with no isolated path islands.
  while (stack.length > 0) {
    const [x, y] = stack[stack.length - 1];
    const nextCells = getCarveDirections()
      .map(([dx, dy]) => [x + dx, y + dy] as Cell)
      .filter(([nextX, nextY]) =>
        nextX > 0 &&
        nextX < width - 1 &&
        nextY > 0 &&
        nextY < height - 1 &&
        nextX % 2 === 1 &&
        nextY % 2 === 1 &&
        !visited.has(keyOf(nextX, nextY)),
      );

    if (nextCells.length === 0) {
      stack.pop();
      continue;
    }

    const next = nextCells[0];
    const betweenX = (x + next[0]) / 2;
    const betweenY = (y + next[1]) / 2;

    grid[betweenY][betweenX] = "empty";
    grid[next[1]][next[0]] = "empty";
    visited.add(keyOf(next[0], next[1]));
    stack.push(next);
  }

  const evenBandX = width % 2 === 0 ? getEvenBandIndex(width) : null;
  const evenBandY = height % 2 === 0 ? getEvenBandIndex(height) : null;
  const extensionTargets: Cell[] = [];

  if (evenBandX !== null) {
    for (let y = 1; y < height - 1; y++) {
      if (y % 2 === 1 && grid[y]?.[evenBandX - 1] === "empty") {
        extensionTargets.push([evenBandX, y]);
      }
    }
  }

  if (evenBandY !== null) {
    for (let x = 1; x < width - 1; x++) {
      if (x % 2 === 1 && grid[evenBandY - 1]?.[x] === "empty") {
        extensionTargets.push([x, evenBandY]);
      }
    }
  }

  for (const [x, y] of shuffle(extensionTargets)) {
    const connectFromLeft = grid[y]?.[x - 1] === "empty";
    const connectFromTop = grid[y - 1]?.[x] === "empty";
    const connectFromRight = grid[y]?.[x + 1] === "empty";
    const connectFromBottom = grid[y + 1]?.[x] === "empty";

    if (connectFromLeft || connectFromTop || connectFromRight || connectFromBottom) {
      grid[y][x] = "empty";
    }
  }

  // Place gameplay markers after carving so they replace floor tiles without
  // participating in the maze-carving algorithm itself.
  const endpoints = selectEndpoints(grid);

  if (!endpoints) {
    const playerX = 1;
    const playerY = 1;
    const exitX = Math.max(1, width - 2);
    const exitY = Math.max(1, height - 2);

    grid[playerY][playerX] = "player";
    grid[exitY][exitX] = "exit";
    return grid;
  }

  const [playerX, playerY] = endpoints.start;
  const [exitX, exitY] = endpoints.exit;

  grid[playerY][playerX] = "player";
  grid[exitY][exitX] = "exit";

  return grid;
}

export function generateMaze(options: GenerateMazeOptions) {
  const { width, height, algorithm = "dfs" } = options;

  if (width <= 0 || height <= 0) {
    return [];
  }

  switch (algorithm) {
    case "dfs":
    default:
      return carveDfsMaze(width, height);
  }
}
