import type { Tile } from "../types/level";

interface TilePaletteProps {
  selectedTile: Tile;
  onSelect: (tile: Tile) => void;
}

function TilePalette({ selectedTile, onSelect }: TilePaletteProps) {
  const tiles: Tile[] = ["wall", "coin", "hazard", "player", "exit", "empty"];

  return (
    <div className="flex flex-wrap justify-center gap-3 mb-8">
      {tiles.map((tile) => (
        <button
          key={tile}
          onClick={() => onSelect(tile)}
          className={`px-4 py-2 rounded-lg font-medium border transition ${
            selectedTile === tile
              ? "bg-indigo-600 border-indigo-400 text-white"
              : "bg-slate-800 border-slate-700 text-slate-200"
          }`}
        >
          {tile}
        </button>
      ))}
    </div>
  );
}

export default TilePalette;
