import { useState } from "react";
import type { Tile } from "../../../types/level";
import { tileIcons, tileStyles } from "../../../constants/tiles";

interface GridEditorProps {
  grid: Tile[][];
  onPaintCell: (rowIndex: number, colIndex: number) => void;
}

function GridEditor({ grid, onPaintCell }: GridEditorProps) {
  const [isPainting, setIsPainting] = useState(false);
  const tileSize = grid.length <= 5 ? 72 : grid.length <= 8 ? 60 : 48;

  return (
    <div
      className="flex max-w-full touch-none items-center justify-center overflow-auto p-1"
      onPointerLeave={() => setIsPainting(false)}
      onPointerUp={() => setIsPainting(false)}
    >
      <div
        className="grid gap-1"
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
                text-lg
                font-mono
                font-black
                arcade-tile
                ${tileStyles[cell]}
              `}
              style={{
                width: tileSize,
                height: tileSize,
              }}
            >
              {tileIcons[cell]}
            </button>
          )),
        )}
      </div>
    </div>
  );
}

export default GridEditor;
