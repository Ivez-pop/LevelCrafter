import type { Tile } from "../types/level";

export const editorTiles: Tile[] = [
  "wall",
  "coin",
  "hazard",
  "enemyHorizontal",
  "enemyVertical",
  "movingHazardHorizontal",
  "movingHazardVertical",
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
  player: "P",
  exit: "EX",
};

export function isDynamicDangerTile(tile: Tile) {
  return (
    tile === "enemyHorizontal" ||
    tile === "enemyVertical" ||
    tile === "movingHazardHorizontal" ||
    tile === "movingHazardVertical"
  );
}
