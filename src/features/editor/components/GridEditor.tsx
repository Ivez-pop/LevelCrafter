import type { Tile } from "../../../types/level";

interface GridEditorProps {
  grid: Tile[][];
  onCellClick: (rowIndex: number, colIndex: number) => void;
}

function GridEditor({ grid, onCellClick }: GridEditorProps) {
  const getTileStyle = (tile: Tile) => {
    switch (tile) {
      case "wall":
        return "bg-[#4b5563]";

      case "coin":
        return "bg-[#ffd83d]";

      case "hazard":
        return "bg-[#ff3d57]";

      case "player":
        return "bg-[#43ff8f]";

      case "exit":
        return "bg-[#39dfff]";

      default:
        return "bg-[#e9f7ff]";
    }
  };

  const getTileIcon = (tile: Tile) => {
    switch (tile) {
      case "wall":
        return "🧱";

      case "coin":
        return "🪙";

      case "hazard":
        return "🔥";

      case "player":
        return "😎";

      case "exit":
        return "🚪";

      default:
        return "";
    }
  };

  const tileSize = grid.length <= 5 ? 72 : grid.length <= 8 ? 60 : 48;

  return (
    <div className="flex max-w-full items-center justify-center overflow-auto p-1">
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
              onClick={() => onCellClick(rowIndex, colIndex)}
              className={`
                flex
                items-center
                justify-center
                text-4xl
                arcade-tile
                ${getTileStyle(cell)}
              `}
              style={{
                width: tileSize,
                height: tileSize,
              }}
            >
              {getTileIcon(cell)}
            </button>
          )),
        )}
      </div>
    </div>
  );
}

export default GridEditor;
