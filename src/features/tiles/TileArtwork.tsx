import type { Tile } from "../../types/level";
import { getTileAsset, getTileStyle, floorTile } from "./tileAssets";

interface TileArtworkProps {
  tile: Tile;
  className?: string;
  imageClassName?: string;
}

export function TileArtwork({ tile, className = "", imageClassName = "" }: TileArtworkProps) {
  const asset = getTileAsset(tile);

  return (
    <div className={`relative overflow-hidden ${getTileStyle()} ${className}`.trim()}>
      {asset.hasFloor && (
        <img
          src={floorTile.src ?? undefined}
          alt={floorTile.alt}
          draggable={false}
          className="absolute inset-0 block h-full w-full object-cover"
        />
      )}
      {asset.src ? (
        <img
          src={asset.src}
          alt={asset.alt}
          draggable={false}
          className={`relative z-10 block h-full w-full object-contain p-px ${imageClassName}`.trim()}
        />
      ) : null}
      {tile === "vent" ? (
        <div
          aria-label={asset.alt}
          className="absolute inset-[12%] z-10 rounded-sm border-2 border-black bg-cyan-300 shadow-[3px_3px_0px_#000,inset_2px_2px_0px_rgba(255,255,255,0.6),inset_-2px_-2px_0px_rgba(0,0,0,0.35)]"
        >
          <div className="absolute inset-[14%] rounded-sm bg-violet-500 shadow-[inset_0_0_0_2px_#000]" />
          <div className="absolute left-[22%] top-[18%] h-[64%] w-[12%] bg-yellow-300 shadow-[12px_0_0_#22d3ee,24px_0_0_#fb7185,36px_0_0_#a3e635]" />
          <div className="absolute inset-x-[16%] top-[42%] h-[12%] bg-black/70" />
        </div>
      ) : null}
    </div>
  );
}
