import type { Level, Position } from "./level";
import type { FacingDirection } from "../game/movement";
import type { ScoreBreakdown } from "./leaderboard";

export type GameStatus = "idle" | "blocked" | "continue" | "collect" | "restart" | "win";
export type DeathReason = "fire" | "bomb" | "generic";

export type Difficulty = "easy" | "medium" | "hard";

export interface VentDestination {
  x: number;
  y: number;
}

export interface GameState {
  level: Level | null;
  player: Position | null;
  playerDirection: FacingDirection;
  isPlayerMoving: boolean;
  showBombs: boolean;
  countdownValue: string | null;
  scoreBreakdown: ScoreBreakdown | null;
  explosion: Position | null;
  deathReason: DeathReason | null;
  collected: number;
  moves: number;
  status: GameStatus;
  difficulty: Difficulty | null;
  message: string;
  levels: Level[];
  isSelectingVent: boolean;
  ventDestinations: VentDestination[];
}

export interface GameActions {
  loadGame: (difficulty: Difficulty) => Promise<void>;
  handlePlayLevel: (id: string) => Promise<void>;
  resetGame: () => Promise<void>;
  move: (direction: import("../game/movement").Direction) => void;
  selectVentDestination: (destination: VentDestination) => void;
}
