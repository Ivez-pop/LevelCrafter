import type { Tile } from "../types/level";

// Full set of tiles accepted by validation/import. The UI palette may expose a
// smaller subset, but storage must recognize every runtime tile.
export const editorTiles: Tile[] = [
  "wall",
  "coin",
  "hazard",
  "enemyHorizontal",
  "enemyVertical",
  "movingHazardHorizontal",
  "movingHazardVertical",
  "movingFireHorizontal",
  "movingFireVertical",
  "vent",
  "player",
  "exit",
  "empty",
];

export const tileLabels: Record<Tile, string> = {
  empty: "Empty",
  wall: "Wall",
  coin: "Coin",
  hazard: "Hazard",
  enemyHorizontal: "Enemy H",
  enemyVertical: "Enemy V",
  movingHazardHorizontal: "Hazard H",
  movingHazardVertical: "Hazard V",
  movingFireHorizontal: "Fire H",
  movingFireVertical: "Fire V",
  vent: "Vent",
  player: "Player",
  exit: "Exit",
};

export const tileStyles: Record<Tile, string> = {
  empty: "bg-[#e9f7ff]",
  wall: "bg-[#4b5563]",
  coin: "bg-[#ffd83d]",
  hazard: "bg-[#ff3d57]",
  enemyHorizontal: "bg-[#fb7185]",
  enemyVertical: "bg-[#f43f5e]",
  movingHazardHorizontal: "bg-[#f97316]",
  movingHazardVertical: "bg-[#ea580c]",
  movingFireHorizontal: "bg-[#ffb02e]",
  movingFireVertical: "bg-[#ff7a1a]",
  vent: "bg-[#7c3aed]",
  player: "bg-[#43ff8f]",
  exit: "bg-[#39dfff]",
};

export const tileIcons: Record<Tile, string> = {
  empty: "",
  wall: "W",
  coin: "$",
  hazard: "!",
  enemyHorizontal: "EH",
  enemyVertical: "EV",
  movingHazardHorizontal: "MH",
  movingHazardVertical: "MV",
  movingFireHorizontal: "FH",
  movingFireVertical: "FV",
  vent: "VT",
  player: "P",
  exit: "EX",
};

/**
 * Dynamic danger tiles move on the gameplay timer and kill on contact.
 * Grouping them here keeps validation, movement, and rendering aligned when new
 * danger variants are introduced.
 */
export function isDynamicDangerTile(tile: Tile) {
  return (
    tile === "enemyHorizontal" ||
    tile === "enemyVertical" ||
    tile === "movingHazardHorizontal" ||
    tile === "movingHazardVertical" ||
    tile === "movingFireHorizontal" ||
    tile === "movingFireVertical"
  );
}
