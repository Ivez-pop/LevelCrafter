import type { Tile } from "../../types/level";
import { getTileAsset, getTileStyle, floorTile } from "./tileAssets";
import { PlayerAvatar } from "../playerAvatar/PlayerAvatar";
import { usePlayerAvatar } from "../playerAvatar/usePlayerAvatar";

interface TileArtworkProps {
  tile: Tile;
  className?: string;
  imageClassName?: string;
}

export function TileArtwork({ tile, className = "", imageClassName = "" }: TileArtworkProps) {
  const asset = getTileAsset(tile);
  const playerAvatarId = usePlayerAvatar();

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
      {tile === "player" ? (
        <PlayerAvatar
          avatarId={playerAvatarId}
          className={`relative z-10 p-1 ${imageClassName}`.trim()}
        />
      ) : asset.src ? (
        <img
          src={asset.src}
          alt={asset.alt}
          draggable={false}
          className={`relative z-10 block h-full w-full object-contain p-px ${imageClassName}`.trim()}
        />
      ) : null}
    </div>
  );
}
