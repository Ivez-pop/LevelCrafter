import type { Tile } from "../../../types/level";
import { TileArtwork } from "../../tiles/TileArtwork";

interface GridEditorProps {
  grid: Tile[][];
  onCellClick: (rowIndex: number, colIndex: number) => void;
}

function GridEditor({ grid, onCellClick }: GridEditorProps) {
  const tileSize = grid.length <= 5 ? 72 : grid.length <= 8 ? 60 : 48;

  return (
    <div className="flex max-w-full items-center justify-center overflow-auto p-0.5">
      <div
        className="grid gap-0 bg-black"
        style={{
          gridTemplateColumns: `repeat(${grid.length}, ${tileSize}px)`,
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              onClick={() => onCellClick(rowIndex, colIndex)}
              className="arcade-tile overflow-hidden"
              style={{
                width: tileSize,
                height: tileSize,
              }}
            >
              <TileArtwork tile={cell} className="h-full w-full" imageClassName="p-0.5" />
            </button>
          )),
        )}
      </div>
    </div>
  );
}

export default GridEditor;
