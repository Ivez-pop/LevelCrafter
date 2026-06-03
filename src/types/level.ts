export type Tile =
  | "empty"
  | "wall"
  | "coin"
  | "hazard"
  | "player"
  | "exit";

export interface Level {
  id: string;
  name: string;
  difficulty: "easy" | "medium" | "hard";
  createdAt: number;
  width: number;
  height: number;
  grid: Tile[][];
}

export interface Position {
  x: number;
  y: number;
}