import { useState } from "react";
import type { Tile } from "../../../types/level";
import { TileArtwork } from "../../tiles/TileArtwork";

interface GridEditorProps {
  grid: Tile[][];
  onPaintCell: (rowIndex: number, colIndex: number) => void;
}

function GridEditor({ grid, onPaintCell }: GridEditorProps) {
  const [isPainting, setIsPainting] = useState(false);
  // Smaller boards get larger cells so the editor remains comfortable across
  // easy, medium, and hard difficulty grids.
  const tileSize = grid.length <= 5 ? 72 : grid.length <= 8 ? 60 : 48;

  return (
    <div
      className="flex max-w-full touch-none items-center justify-center overflow-auto p-1"
      onPointerLeave={() => setIsPainting(false)}
      onPointerUp={() => setIsPainting(false)}
    >
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
              onPointerDown={(event) => {
                event.preventDefault();
                setIsPainting(true);
                onPaintCell(rowIndex, colIndex);
              }}
              onPointerEnter={() => {
                if (isPainting) {
                  onPaintCell(rowIndex, colIndex);
                }
              }}
              className={`
                flex
                items-center
                justify-center
                arcade-tile
                overflow-hidden
              `}
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
