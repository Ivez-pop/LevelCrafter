import { getPlayerAvatarOption, type PlayerAvatarId } from "./avatarOptions";

interface PlayerAvatarProps {
  avatarId: PlayerAvatarId | string;
  className?: string;
}

export function PlayerAvatar({ avatarId, className = "" }: PlayerAvatarProps) {
  const avatar = getPlayerAvatarOption(avatarId);

  return (
    <div
      className={`relative h-full w-full ${className}`.trim()}
      style={{ imageRendering: "pixelated" }}
      aria-label={avatar.name}
      role="img"
    >
      <div
        className="absolute left-[22%] top-[10%] h-[70%] w-[52%] border-2 border-black shadow-[3px_3px_0px_#000]"
        style={{
          background: avatar.suit,
          borderRadius: "36% 34% 24% 24%",
          boxShadow: `inset -8px -8px 0 ${avatar.shade}, 3px 3px 0 #000`,
        }}
      />
      <div
        className="absolute left-[62%] top-[33%] h-[34%] w-[18%] border-2 border-black"
        style={{
          background: avatar.pack,
          borderRadius: "0 35% 35% 0",
        }}
      />
      <div
        className="absolute left-[42%] top-[22%] h-[23%] w-[36%] border-2 border-black"
        style={{
          background: avatar.visor,
          borderRadius: "42% 28% 28% 42%",
          boxShadow: "inset -4px -4px 0 rgba(14,116,144,0.45)",
        }}
      />
      <div
        className="absolute left-[30%] top-[76%] h-[15%] w-[18%] border-2 border-black"
        style={{ background: avatar.shade }}
      />
      <div
        className="absolute left-[52%] top-[76%] h-[15%] w-[18%] border-2 border-black"
        style={{ background: avatar.shade }}
      />
      <div
        className="absolute left-[27%] top-[14%] h-[10%] w-[12%] border-2 border-black"
        style={{ background: avatar.accent }}
      />
    </div>
  );
}
