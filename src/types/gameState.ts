import type { Level, Position } from "./level";

export type GameStatus = "idle" | "blocked" | "continue" | "collect" | "restart" | "win";

export type Difficulty = "easy" | "medium" | "hard";

export interface GameState {
  level: Level | null;
  player: Position | null;
  explosion: Position | null;
  collected: number;
  moves: number;
  status: GameStatus;
  difficulty: Difficulty | null;
  message: string;
  levels: Level[];
}

export interface GameActions {
  loadGame: (difficulty: Difficulty) => Promise<void>;
  handlePlayLevel: (id: string) => Promise<void>;
  resetGame: () => Promise<void>;
  move: (direction: import("../game/movement").Direction) => void;
}
