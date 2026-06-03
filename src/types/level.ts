export type Tile =
  | "empty"
  | "wall"
  | "coin"
  | "hazard"
  | "player"
  | "exit";

export interface Level {
  difficulty: "easy" | "medium" | "hard";
  width: number;
  height: number;
  grid: Tile[][];
}

export interface Position {
  x: number;
  y: number;
}