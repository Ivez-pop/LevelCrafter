import { getPlayerAvatarOption, type PlayerAvatarId } from "./avatarOptions";
import { getTileAsset } from "../tiles/tileAssets";
import type { FacingDirection } from "../../game/movement";

interface PlayerAvatarProps {
  avatarId: PlayerAvatarId | string;
  className?: string;
  direction?: FacingDirection;
  isMoving?: boolean;
}

export function PlayerAvatar({
  avatarId,
  className = "",
  direction = "right",
  isMoving = false,
}: PlayerAvatarProps) {
  const avatar = getPlayerAvatarOption(avatarId);
  const playerAsset = getTileAsset("player");
  const facingClass = direction === "left" ? "scale-x-[-1]" : "scale-x-100";
  const motionClass = isMoving ? "player-avatar-moving" : "player-avatar-idle";

  return (
    <div
      className={`relative h-full w-full ${facingClass} ${className}`.trim()}
      aria-label={avatar.name}
      role="img"
    >
      <div className={`player-avatar-root absolute inset-0 ${motionClass}`.trim()}>
        <img
          src={playerAsset.src ?? undefined}
          alt={playerAsset.alt}
          draggable={false}
          className="player-avatar-sprite block h-full w-full object-contain"
        />
      </div>
    </div>
  );
}
