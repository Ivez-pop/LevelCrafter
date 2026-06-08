import defaultAvatarSrc from "../../../tiles/player.png";

const avatarModules = import.meta.glob("../../../avatar/*.{png,jpg,jpeg,webp,avif}", {
  eager: true,
  import: "default",
}) as Record<string, string>;

export type PlayerAvatarId =
  | "player"
  | "avatar1"
  | "avatar2"
  | "avatar3"
  | "avatar4"
  | "avatar5"
  | "avatar6";

export interface PlayerAvatarOption {
  id: PlayerAvatarId;
  name: string;
  src: string;
}

export const defaultPlayerAvatarId: PlayerAvatarId = "player";
const legacyAvatarIdMap: Record<string, Exclude<PlayerAvatarId, "player">> = {
  "crimson-crewmate": "avatar1",
  "cyan-scout": "avatar2",
  "lime-runner": "avatar3",
  "gold-byte": "avatar4",
  "violet-ghost": "avatar5",
  "orange-spark": "avatar6",
};

function resolveAvatarSrc(fileName: string) {
  const match = Object.entries(avatarModules).find(([path]) => path.endsWith(`/${fileName}`));

  return match?.[1] ?? defaultAvatarSrc;
}

export const playerAvatarOptions: PlayerAvatarOption[] = [
  {
    id: "avatar1",
    name: "Avatar 1",
    src: resolveAvatarSrc("avatar1.png"),
  },
  {
    id: "avatar2",
    name: "Avatar 2",
    src: resolveAvatarSrc("avatar2.png"),
  },
  {
    id: "avatar3",
    name: "Avatar 3",
    src: resolveAvatarSrc("avatar3.png"),
  },
  {
    id: "avatar4",
    name: "Avatar 4",
    src: resolveAvatarSrc("avatar4.png"),
  },
  {
    id: "avatar5",
    name: "Avatar 5",
    src: resolveAvatarSrc("avatar5.png"),
  },
  {
    id: "avatar6",
    name: "Avatar 6",
    src: resolveAvatarSrc("avatar6.png"),
  },
];

export function getPlayerAvatarOption(id: string | null | undefined) {
  return (
    playerAvatarOptions.find((option) => option.id === normalizePlayerAvatarId(id)) ??
    {
      id: defaultPlayerAvatarId,
      name: "Default Player",
      src: defaultAvatarSrc,
    }
  );
}

export function normalizePlayerAvatarId(id: string | null | undefined): PlayerAvatarId {
  if (id && playerAvatarOptions.some((option) => option.id === id)) {
    return id as PlayerAvatarId;
  }

  if (id && id in legacyAvatarIdMap) {
    return legacyAvatarIdMap[id];
  }

  return defaultPlayerAvatarId;
}
