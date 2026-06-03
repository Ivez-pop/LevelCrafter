import type { Tile } from "../types/level";

interface GridEditorProps {
  grid: Tile[][];
  onCellClick: (rowIndex: number, colIndex: number) => void;
}

function GridEditor({ grid, onCellClick }: GridEditorProps) {
  const getTileColor = (tile: Tile) => {
    switch (tile) {
      case "wall":
        return "bg-gray-500";

      case "coin":
        return "bg-yellow-400";

      case "hazard":
        return "bg-red-500";

      case "player":
        return "bg-green-500";

      case "exit":
        return "bg-blue-500";

      default:
        return "bg-white";
    }
  };

  return (
    <div className="flex justify-center">
      <div
        className="grid gap-1"
        style={{
          gridTemplateColumns: `repeat(${grid.length}, 48px)`,
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              onClick={() => onCellClick(rowIndex, colIndex)}
              className={`h-12 w-12 border border-slate-600 ${getTileColor(
                cell,
              )}`}
            />
          )),
        )}
      </div>
    </div>
  );
}

export default GridEditor;
