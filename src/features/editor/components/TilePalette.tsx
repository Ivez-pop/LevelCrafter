import type { Tile } from "../../../types/level";
import { editorTiles, tileLabels } from "../../../constants/tiles";

interface TilePaletteProps {
  selectedTile: Tile;
  onSelect: (tile: Tile) => void;
}

function TilePalette({ selectedTile, onSelect }: TilePaletteProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2">
      {editorTiles.map((tile) => (
        <button
          key={tile}
          onClick={() => onSelect(tile)}
          className={`border-4 border-black px-3 py-3 font-mono text-xs font-black uppercase shadow-[4px_4px_0px_#000] transition-transform hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0px_#000] ${
            selectedTile === tile
              ? "bg-yellow-300 text-black"
              : "bg-[#12122f] text-cyan-100 hover:bg-[#1b1b49]"
          }`}
        >
          {tileLabels[tile]}
        </button>
      ))}
    </div>
  );
}

export default TilePalette;
