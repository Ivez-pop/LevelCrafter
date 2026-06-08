import type { Tile } from "../../types/level";
import type { FacingDirection } from "../../game/movement";
import { getTileAsset, getTileStyle, floorTile } from "./tileAssets";
import { PlayerAvatar } from "../playerAvatar/PlayerAvatar";
import { usePlayerAvatar } from "../playerAvatar/usePlayerAvatar";

interface TileArtworkProps {
  tile: Tile;
  className?: string;
  imageClassName?: string;
  playerDirection?: FacingDirection;
  isPlayerMoving?: boolean;
  showBombs?: boolean;
}

export function TileArtwork({
  tile,
  className = "",
  imageClassName = "",
  playerDirection = "right",
  isPlayerMoving = false,
  showBombs = true,
}: TileArtworkProps) {
  const asset = getTileAsset(tile);
  const playerAvatarId = usePlayerAvatar();
  // Bombs fade out after the preview timer but still occupy the same logical
  // hazard tile for collision and reset handling.
  const isHiddenBomb = tile === "hazard" && !showBombs;

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
          direction={playerDirection}
          isMoving={isPlayerMoving}
        />
      ) : asset.src ? (
        <img
          src={asset.src}
          alt={asset.alt}
          draggable={false}
          className={`relative z-10 block h-full w-full object-contain p-px transition-opacity duration-300 ${isHiddenBomb ? "opacity-0" : "opacity-100"} ${imageClassName}`.trim()}
        />
      ) : null}
    </div>
  );
}
