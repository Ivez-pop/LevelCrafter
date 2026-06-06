export type PlayerAvatarId =
  | "crimson-crewmate"
  | "cyan-scout"
  | "lime-runner"
  | "gold-byte"
  | "violet-ghost"
  | "orange-spark";

export interface PlayerAvatarOption {
  id: PlayerAvatarId;
  name: string;
  suit: string;
  shade: string;
  visor: string;
  pack: string;
  accent: string;
}

export const defaultPlayerAvatarId: PlayerAvatarId = "crimson-crewmate";

export const playerAvatarOptions: PlayerAvatarOption[] = [
  {
    id: "crimson-crewmate",
    name: "Crimson Crewmate",
    suit: "#f43f5e",
    shade: "#9f1239",
    visor: "#a5f3fc",
    pack: "#be123c",
    accent: "#fde047",
  },
  {
    id: "cyan-scout",
    name: "Cyan Scout",
    suit: "#22d3ee",
    shade: "#0891b2",
    visor: "#ecfeff",
    pack: "#0e7490",
    accent: "#f0abfc",
  },
  {
    id: "lime-runner",
    name: "Lime Runner",
    suit: "#84cc16",
    shade: "#3f6212",
    visor: "#d9f99d",
    pack: "#65a30d",
    accent: "#38bdf8",
  },
  {
    id: "gold-byte",
    name: "Gold Byte",
    suit: "#facc15",
    shade: "#ca8a04",
    visor: "#fef9c3",
    pack: "#a16207",
    accent: "#fb7185",
  },
  {
    id: "violet-ghost",
    name: "Violet Ghost",
    suit: "#a78bfa",
    shade: "#6d28d9",
    visor: "#ddd6fe",
    pack: "#7c3aed",
    accent: "#67e8f9",
  },
  {
    id: "orange-spark",
    name: "Orange Spark",
    suit: "#fb923c",
    shade: "#c2410c",
    visor: "#ffedd5",
    pack: "#ea580c",
    accent: "#bef264",
  },
];

export function getPlayerAvatarOption(id: string | null | undefined) {
  return (
    playerAvatarOptions.find((option) => option.id === id) ??
    playerAvatarOptions.find((option) => option.id === defaultPlayerAvatarId)!
  );
}
