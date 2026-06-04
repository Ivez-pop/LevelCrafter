import type { Tile } from "../../../types/level";
import { TileArtwork } from "../../tiles/TileArtwork";

interface GameBoardProps {
  width: number;
  grid: Tile[][];
  getTileStyle: (tile: Tile) => string;
}

export function GameBoard({ width, grid, getTileStyle }: GameBoardProps) {
  return (
    <div className="border-4 border-black bg-black p-2 shadow-[8px_8px_0px_#000] sm:p-3">
      <div
        className="grid gap-0 bg-black"
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
                  arcade-tile
                  ${getTileStyle(cell)}
                `
              }
            >
              <TileArtwork tile={cell} className="h-full w-full" imageClassName="p-0.5" />
            </div>
          )),
        )}
      </div>
    </div>
  );
}

