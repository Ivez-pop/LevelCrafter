import type { Tile } from "../../../types/level";

interface GameBoardProps {
  width: number;
  grid: Tile[][];
  getTileStyle: (tile: Tile) => string;
  getTileIcon: (tile: Tile) => string;
}

export function GameBoard({ width, grid, getTileStyle, getTileIcon }: GameBoardProps) {
  return (
    <div className="border-4 border-black bg-black p-3 shadow-[8px_8px_0px_#000] sm:p-4">
      <div
        className="grid gap-1"
        style={{
          gridTemplateColumns: `repeat(${width}, minmax(40px, 56px))`,
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={
                `
                  aspect-square
                  w-full
                  flex
                  items-center
                  justify-center
                  text-2xl
                  sm:text-3xl
                  arcade-tile
                  ${getTileStyle(cell)}
                `
              }
            >
              {getTileIcon(cell)}
            </div>
          )),
        )}
      </div>
    </div>
  );
}
