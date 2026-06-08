export type Tile =
  | "empty"
  | "wall"
  | "coin"
  | "hazard"
  | "enemyHorizontal"
  | "enemyVertical"
  | "movingHazardHorizontal"
  | "movingHazardVertical"
  | "movingFireHorizontal"
  | "movingFireVertical"
  | "vent"
  | "player"
  | "exit";

export interface Level {
  id: string;
  name: string;
  difficulty: "easy" | "medium" | "hard";
  bombPreviewSeconds?: number;
  createdAt: number;
  width: number;
  height: number;
  grid: Tile[][];
}

export interface Position {
  x: number;
  y: number;
}
