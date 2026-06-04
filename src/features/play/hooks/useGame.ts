import { useCallback, useRef, useState } from "react";
import type { Level, Position, Tile } from "../../../types/level";
import type { GameState, GameActions, Difficulty } from "../../../types/gameState";
import type { Direction } from "../../../game/movement";
import { processMove } from "../../../game/gameEngine";
import { getPlayerStart } from "../../../game/spawn";
import { getLevelsByDifficulty, getLevelById } from "../../../services/levelStorage";
import { recordCompletedLevel } from "../../../services/gameplayService";

export function useGame(): GameState & GameActions {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [level, setLevel] = useState<Level | null>(null);
  const [levels, setLevels] = useState<Level[]>([]);
  const [player, setPlayer] = useState<Position | null>(null);
  const [collected, setCollected] = useState(0);
  const [moves, setMoves] = useState(0);
  const movesRef = useRef(0);
  const startedAtRef = useRef<number | null>(null);
  const [status, setStatus] = useState<"idle" | "blocked" | "continue" | "collect" | "restart" | "win">("idle");
  const [message, setMessage] = useState("");

  const normalizeGrid = (grid: Tile[][]) =>
    grid.map((row) =>
      row.map((tile) =>
        tile === "player" ? "empty" : tile,
      ),
    );

  const loadGame = useCallback((selectedDifficulty: Difficulty) => {
    console.log("[useGame] loadGame", selectedDifficulty);
    setDifficulty(selectedDifficulty);
    const found = getLevelsByDifficulty(selectedDifficulty);
    setLevels(found);
    setLevel(null);
    setPlayer(null);
    setCollected(0);
    movesRef.current = 0;
    startedAtRef.current = null;
    setMoves(0);
    setStatus("idle");
    setMessage(found.length ? `Found ${found.length} levels.` : "No levels available. Create one first.");
  }, []);

  const resetGame = useCallback(() => {
    if (!difficulty || !level) {
      console.log("[useGame] resetGame early return", { difficulty, level });
      return;
    }

    const reloaded = getLevelById(level.id);
    if (!reloaded) {
      console.log("[useGame] resetGame failed to reload", level.id);
      return;
    }

    const startPosition = getPlayerStart(reloaded);

    setLevel({ ...reloaded, grid: normalizeGrid(reloaded.grid) });
    setPlayer(startPosition);
    setCollected(0);
    movesRef.current = 0;
    startedAtRef.current = Date.now();
    setMoves(0);
    setStatus("restart");
    setMessage("Hazard hit! Level restarted.");
  }, [difficulty, level]);

  const move = useCallback((direction: Direction) => {
    console.log("[useGame] move", direction, { level: level?.id, player, status });

    if (!level || !player) {
      console.log("[useGame] move early return", { level, player, status });
      return;
    }

    if (status === "win") {
      console.log("[useGame] move blocked by win status");
      return;
    }

    const result = processMove(level, player, direction);
    console.log("[useGame] processMove result", result);
    const nextMoveCount = movesRef.current + 1;
    movesRef.current = nextMoveCount;
    setMoves(nextMoveCount);

    if (result.event === "blocked") {
      setStatus("blocked");
      setMessage("Blocked by a wall.");
      return;
    }

    const nextPosition = result.player;

    if (result.event === "restart") {
      resetGame();
      return;
    }

    if (result.event === "collect") {
      setLevel((current: Level | null) => {
        if (!current) return current;

        const updatedGrid = current.grid.map((row: Tile[], rowIndex: number) =>
          row.map((tile: Tile, colIndex: number) =>
            rowIndex === nextPosition.y && colIndex === nextPosition.x
              ? "empty"
              : tile,
          ),
        );

        return { ...current, grid: updatedGrid };
      });

      setCollected((count) => count + 1);
      setPlayer(nextPosition);
      setStatus("collect");
      setMessage("Coin collected!");
      return;
    }

    if (result.event === "win") {
      const completionTimeSeconds = Math.max(
        0,
        Math.floor((Date.now() - (startedAtRef.current ?? Date.now())) / 1000),
      );

      void recordCompletedLevel({
        level,
        coinsCollected: collected,
        moves: nextMoveCount,
        timeSeconds: completionTimeSeconds,
      }).catch((error: unknown) => {
        console.error("[useGame] failed to persist completed level", error);
      });

      setPlayer(nextPosition);
      setStatus("win");
      setMessage("You win! Congratulations.");
      return;
    }

    setPlayer(nextPosition);
    setStatus("continue");
    setMessage("");
  }, [level, player, status, collected, resetGame]);

  const handlePlayLevel = useCallback((id: string) => {
    console.log("[useGame] handlePlayLevel", id);
    const lvl = getLevelById(id);
    if (!lvl) {
      setMessage("Failed to load level.");
      return;
    }

    try {
      const startPosition = getPlayerStart(lvl);
      setLevel({ ...lvl, grid: normalizeGrid(lvl.grid) });
      setPlayer(startPosition);
      setCollected(0);
      movesRef.current = 0;
      startedAtRef.current = Date.now();
      setMoves(0);
      setStatus("continue");
      setMessage(`Playing ${lvl.name}`);
    } catch {
      setMessage("Level is invalid: missing player start.");
    }
  }, []);

  return {
    level,
    player,
    collected,
    moves,
    status,
    difficulty,
    message,
    levels,
    loadGame,
    handlePlayLevel,
    resetGame,
    move,
  };
}
