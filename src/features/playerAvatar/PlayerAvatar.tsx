import { getPlayerAvatarOption, type PlayerAvatarId } from "./avatarOptions";
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
  const facingClass = direction === "left" ? "scale-x-[-1]" : "scale-x-100";

  return (
    <div
      className={`relative h-full w-full ${facingClass} ${className}`.trim()}
      aria-label={avatar.name}
      role="img"
    >
      <img
        src={avatar.src}
        alt={avatar.name}
        draggable={false}
        className={`block h-full w-full object-contain ${isMoving ? "scale-105" : ""}`.trim()}
      />
    </div>
  );
}
