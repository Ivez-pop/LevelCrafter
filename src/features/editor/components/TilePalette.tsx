import type { Tile } from "../../../types/level";
import { TileArtwork } from "../../tiles/TileArtwork";
import { tileLabels } from "../../../constants/tiles";

// Keep the palette intentionally smaller than editorTiles: these are the tiles
// a level author can place directly in the UI today.
const editorPaletteTiles: Tile[] = [
  "wall",
  "coin",
  "exit",
  "vent",
  "hazard",
  "movingFireHorizontal",
  "movingFireVertical",
  "player",
  "empty",
];

interface TilePaletteProps {
  selectedTile: Tile;
  onSelect: (tile: Tile) => void;
}

function TilePalette({ selectedTile, onSelect }: TilePaletteProps) {
  return (
    <div className="mx-auto grid max-w-[280px] grid-cols-2 gap-1.5 min-[300px]:grid-cols-3">
      {editorPaletteTiles.map((tile) => (
        <button
          key={tile}
          onClick={() => onSelect(tile)}
          className={`group overflow-hidden border-2 border-black bg-[#12122f] p-0.5 text-left shadow-[2px_2px_0px_#000] transition-transform hover:-translate-y-0.5 active:translate-x-px active:translate-y-px active:shadow-[1px_1px_0px_#000] ${
            selectedTile === tile
              ? "border-yellow-300 bg-yellow-300 ring-2 ring-white"
              : "hover:bg-[#1b1b49]"
          }`}
        >
          <div
            className={`flex aspect-square items-center justify-center border border-black ${
              selectedTile === tile ? "bg-black/10" : "bg-black/25"
            }`}
          >
            <TileArtwork tile={tile} className="h-full w-full" imageClassName="p-0.5" />
          </div>
          <div
            className={`mt-0.5 px-0 text-center font-mono text-[8px] font-black uppercase leading-3 ${
              selectedTile === tile ? "text-black" : "text-cyan-100"
            }`}
          >
            {tileLabels[tile]}
          </div>
        </button>
      ))}
    </div>
  );
}

export default TilePalette;
