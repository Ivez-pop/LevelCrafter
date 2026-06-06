import { useCallback, useEffect, useRef, useState } from "react";
import type { Level, Position, Tile } from "../../../types/level";
import type { GameState, GameActions, Difficulty, VentDestination } from "../../../types/gameState";
import type { Direction } from "../../../game/movement";
import { getVentDestinations, processMove } from "../../../game/gameEngine";
import { getPlayerStart } from "../../../game/spawn";
import { getLevelsByDifficulty, getLevelById } from "../../../services/levelStorage";
import { recordCompletedLevel } from "../../../services/gameplayService";
import { isDynamicDangerTile } from "../../../constants/tiles";
import { retroAudio } from "../../../audio/retroAudio";
import type { FacingDirection } from "../../../game/movement";
import { calculateCompletionScore } from "../../../services/scoreService";
import type { ScoreBreakdown } from "../../../types/leaderboard";

type DynamicDangerState = { dx: number; dy: number; underTile: Tile };

const DYNAMIC_DANGER_TICK_MS = 450;
const DEFAULT_BOMB_PREVIEW_SECONDS = 3;
const getDynamicDangerState = (tile: Tile): DynamicDangerState => ({
  dx:
    tile === "enemyHorizontal" ||
    tile === "movingHazardHorizontal" ||
    tile === "movingFireHorizontal"
      ? 1
      : 0,
  dy:
    tile === "enemyVertical" ||
    tile === "movingHazardVertical" ||
    tile === "movingFireVertical"
      ? 1
      : 0,
  underTile: "empty",
});

function advanceDynamicDangers(
  grid: Tile[][],
  player: Position,
  directions: Map<string, DynamicDangerState>,
) {
  const nextGrid = grid.map((row) => [...row]);
  const dangerOrdinals = new Map<string, number>();
  const dangers: Array<{
    key: string;
    x: number;
    y: number;
    tile: Tile;
    state: DynamicDangerState;
  }> = [];

  for (let y = 0; y < nextGrid.length; y++) {
    for (let x = 0; x < nextGrid[y].length; x++) {
      const tile = nextGrid[y][x];

      if (isDynamicDangerTile(tile)) {
        const axisKey = `${tile}:${tile.endsWith("Horizontal") ? y : x}`;
        const ordinal = dangerOrdinals.get(axisKey) ?? 0;
        const key = `${axisKey}:${ordinal}`;
        const state = directions.get(key) ?? getDynamicDangerState(tile);

        dangerOrdinals.set(axisKey, ordinal + 1);

        dangers.push({
          key,
          x,
          y,
          tile,
          state,
        });
        nextGrid[y][x] = state.underTile;
      }
    }
  }

  const isBlocked = (x: number, y: number) =>
    y < 0 ||
    y >= nextGrid.length ||
    x < 0 ||
    x >= nextGrid[y].length ||
    nextGrid[y][x] === "wall" ||
    dangers.some((danger) => danger.x === x && danger.y === y);

  for (const danger of dangers) {
    let nextX = danger.x + danger.state.dx;
    let nextY = danger.y + danger.state.dy;

    if (isBlocked(nextX, nextY)) {
      danger.state = {
        ...danger.state,
        dx: -danger.state.dx,
        dy: -danger.state.dy,
      };
      nextX = danger.x + danger.state.dx;
      nextY = danger.y + danger.state.dy;
    }

    if (!isBlocked(nextX, nextY)) {
      danger.state = {
        ...danger.state,
        underTile: nextGrid[nextY][nextX],
      };
      danger.x = nextX;
      danger.y = nextY;
    }
  }

  for (const danger of dangers) {
    nextGrid[danger.y][danger.x] = danger.tile;
  }

  const nextDirections = new Map<string, DynamicDangerState>();

  for (const danger of dangers) {
    nextDirections.set(danger.key, danger.state);
  }

  return {
    grid: nextGrid,
    directions: nextDirections,
    hasDangers: dangers.length > 0,
    hitPlayer: dangers.some(
      (danger) => danger.x === player.x && danger.y === player.y,
    ),
  };
}

export function useGame(): GameState & GameActions {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [level, setLevel] = useState<Level | null>(null);
  const [levels, setLevels] = useState<Level[]>([]);
  const [player, setPlayer] = useState<Position | null>(null);
  const [playerDirection, setPlayerDirection] = useState<FacingDirection>("right");
  const [isPlayerMoving, setIsPlayerMoving] = useState(false);
  const [showBombs, setShowBombs] = useState(true);
  const [countdownValue, setCountdownValue] = useState<string | null>(null);
  const [scoreBreakdown, setScoreBreakdown] = useState<ScoreBreakdown | null>(null);
  const [collected, setCollected] = useState(0);
  const [moves, setMoves] = useState(0);
  const movesRef = useRef(0);
  const startedAtRef = useRef<number | null>(null);
  const dynamicDirectionsRef = useRef(new Map<string, DynamicDangerState>());
  const explosionTimeoutRef = useRef<number | null>(null);
  const movementTimeoutRef = useRef<number | null>(null);
  const countdownTimeoutRef = useRef<number | null>(null);
  const bombFadeTimeoutRef = useRef<number | null>(null);
  const countdownStepRefs = useRef<number[]>([]);
  const [explosion, setExplosion] = useState<Position | null>(null);
  const [status, setStatus] = useState<"idle" | "blocked" | "continue" | "collect" | "restart" | "win">("idle");
  const [message, setMessage] = useState("");
  const [isSelectingVent, setIsSelectingVent] = useState(false);
  const [ventDestinations, setVentDestinations] = useState<VentDestination[]>([]);

  const normalizeGrid = (grid: Tile[][]) =>
    grid.map((row) =>
      row.map((tile) =>
        tile === "player" ? "empty" : tile,
      ),
    );

  const clearVentSelection = useCallback(() => {
    setIsSelectingVent(false);
    setVentDestinations([]);
  }, []);

  const clearMovementTimeout = useCallback(() => {
    if (movementTimeoutRef.current !== null) {
      window.clearTimeout(movementTimeoutRef.current);
      movementTimeoutRef.current = null;
    }
  }, []);

  const clearCountdownTimeout = useCallback(() => {
    if (countdownTimeoutRef.current !== null) {
      window.clearTimeout(countdownTimeoutRef.current);
      countdownTimeoutRef.current = null;
    }

    if (bombFadeTimeoutRef.current !== null) {
      window.clearTimeout(bombFadeTimeoutRef.current);
      bombFadeTimeoutRef.current = null;
    }

    for (const timeoutId of countdownStepRefs.current) {
      window.clearTimeout(timeoutId);
    }
    countdownStepRefs.current = [];
  }, []);

  const startCountdown = useCallback(
    (previewSeconds: number) => {
      clearCountdownTimeout();
      setShowBombs(true);
      const clampedSeconds = Math.max(1, Math.min(10, Math.floor(previewSeconds)));
      setCountdownValue(String(clampedSeconds));

      for (let index = 1; index < clampedSeconds; index++) {
        const stepTimeout = window.setTimeout(() => {
          setCountdownValue(String(clampedSeconds - index));
        }, 1000 * index);

        countdownStepRefs.current.push(stepTimeout);
      }

      countdownTimeoutRef.current = window.setTimeout(() => {
        countdownTimeoutRef.current = null;
        setCountdownValue("GO!");
        bombFadeTimeoutRef.current = window.setTimeout(() => {
          bombFadeTimeoutRef.current = null;
          setShowBombs(false);
          setCountdownValue(null);
        }, 320);
      }, 1000 * clampedSeconds);
    },
    [clearCountdownTimeout],
  );

  const pulseMovement = useCallback(() => {
    clearMovementTimeout();
    setIsPlayerMoving(true);
    movementTimeoutRef.current = window.setTimeout(() => {
      movementTimeoutRef.current = null;
      setIsPlayerMoving(false);
    }, 180);
  }, [clearMovementTimeout]);

  const triggerHazardReset = useCallback((position: Position) => {
    clearMovementTimeout();
    setIsPlayerMoving(false);
    if (explosionTimeoutRef.current !== null) {
      window.clearTimeout(explosionTimeoutRef.current);
      explosionTimeoutRef.current = null;
    }

    setExplosion(position);
    setStatus("restart");
    setMessage("Boom!");
    retroAudio.playDeath();

    explosionTimeoutRef.current = window.setTimeout(() => {
      explosionTimeoutRef.current = null;
      setExplosion(null);
      setStatus("restart");
      setMessage("GAME OVER");
    }, 500);
  }, [clearMovementTimeout]);

  const enterVentSelection = useCallback(
    (entry: Position, levelToUse: Level) => {
      const destinations = getVentDestinations(levelToUse, entry);

      if (destinations.length === 0) {
        clearVentSelection();
        setMessage("Vent jump!");
        return;
      }

      setVentDestinations(destinations);
      setIsSelectingVent(true);
      setStatus("continue");
      setMessage("Click a vent destination.");
    },
    [clearVentSelection],
  );

  const loadGame = useCallback(async (selectedDifficulty: Difficulty) => {
    console.log("[useGame] loadGame", selectedDifficulty);
    setDifficulty(selectedDifficulty);
    const found = await getLevelsByDifficulty(selectedDifficulty);
    setLevels(found);
    setLevel(null);
    setPlayer(null);
    setPlayerDirection("right");
    setIsPlayerMoving(false);
    setCollected(0);
    movesRef.current = 0;
    startedAtRef.current = null;
    dynamicDirectionsRef.current = new Map();
    clearMovementTimeout();
    clearCountdownTimeout();
    clearVentSelection();
    if (explosionTimeoutRef.current !== null) {
      window.clearTimeout(explosionTimeoutRef.current);
      explosionTimeoutRef.current = null;
    }
    setExplosion(null);
    setMoves(0);
    setStatus("idle");
    setShowBombs(true);
    setCountdownValue(null);
    setScoreBreakdown(null);
    setMessage(found.length ? `Found ${found.length} levels.` : "No levels available. Create one first.");
  }, [clearCountdownTimeout, clearMovementTimeout, clearVentSelection]);

  const resetGame = useCallback(async () => {
    if (!difficulty || !level) {
      console.log("[useGame] resetGame early return", { difficulty, level });
      return;
    }

    const reloaded = await getLevelById(level.id);
    if (!reloaded) {
      console.log("[useGame] resetGame failed to reload", level.id);
      return;
    }

    const startPosition = getPlayerStart(reloaded);

    setLevel({ ...reloaded, grid: normalizeGrid(reloaded.grid) });
    setPlayer(startPosition);
    setPlayerDirection("right");
    setIsPlayerMoving(false);
    setShowBombs(true);
    setCountdownValue(null);
    setCollected(0);
    movesRef.current = 0;
    startedAtRef.current = Date.now();
    dynamicDirectionsRef.current = new Map();
    clearMovementTimeout();
    clearCountdownTimeout();
    setExplosion(null);
    setMoves(0);
    setStatus("continue");
    setMessage("");
    setScoreBreakdown(null);
    startCountdown(reloaded.bombPreviewSeconds ?? DEFAULT_BOMB_PREVIEW_SECONDS);
  }, [clearCountdownTimeout, clearMovementTimeout, difficulty, level, startCountdown]);

  const move = useCallback((direction: Direction) => {
    console.log("[useGame] move", direction, { level: level?.id, player, status });

    if (!level || !player) {
      console.log("[useGame] move early return", { level, player, status });
      return;
    }

    if (status === "win" || status === "restart" || isSelectingVent) {
      console.log("[useGame] move blocked by win status");
      return;
    }

    if (countdownValue !== null) {
      return;
    }

    const result = processMove(level, player, direction);
    console.log("[useGame] processMove result", result);
    const nextFacing: FacingDirection =
      direction === "left" ? "left" : direction === "right" ? "right" : playerDirection;
    setPlayerDirection(nextFacing);
    const nextMoveCount = movesRef.current + 1;
    movesRef.current = nextMoveCount;
    setMoves(nextMoveCount);

    if (result.event === "blocked") {
      clearMovementTimeout();
      setIsPlayerMoving(false);
      setStatus("blocked");
      setMessage("Blocked by a wall.");
      retroAudio.playBlocked();
      return;
    }

    const nextPosition = result.player;
    pulseMovement();

    if (result.event === "restart") {
      setShowBombs(true);
      triggerHazardReset(nextPosition);
      return;
    }

    if (result.event === "collect") {
      const updatedGrid = level.grid.map((row: Tile[], rowIndex: number) =>
        row.map((tile: Tile, colIndex: number) =>
          rowIndex === nextPosition.y && colIndex === nextPosition.x
            ? "empty"
            : tile,
        ),
      );

      setLevel({ ...level, grid: updatedGrid });
      setCollected((count) => count + 1);
      setPlayer(nextPosition);
      setStatus("collect");
      setMessage("Coin collected!");
      retroAudio.playCoin();
      return;
    }

    if (result.event === "win") {
      const completionTimeSeconds = Math.max(
        0,
        Math.floor((Date.now() - (startedAtRef.current ?? Date.now())) / 1000),
      );
      const nextScoreBreakdown = calculateCompletionScore({
        coinsCollected: collected,
        moves: nextMoveCount,
        timeSeconds: completionTimeSeconds,
        difficulty: level.difficulty,
        bombPreviewSeconds: level.bombPreviewSeconds,
      });
      setScoreBreakdown(nextScoreBreakdown);

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
      retroAudio.playWin();
      return;
    }

    if (result.event === "vent") {
      setPlayer(nextPosition);
      enterVentSelection(nextPosition, level);
      retroAudio.playMove();
      return;
    }

    setPlayer(nextPosition);
    setStatus("continue");
    setMessage("");
    retroAudio.playMove();
  }, [clearMovementTimeout, countdownValue, enterVentSelection, level, player, playerDirection, pulseMovement, status, collected, triggerHazardReset, isSelectingVent]);

  const handlePlayLevel = useCallback(async (id: string) => {
    console.log("[useGame] handlePlayLevel", id);
    const lvl = await getLevelById(id);
    if (!lvl) {
      setMessage("Failed to load level.");
      return;
    }

    try {
      const startPosition = getPlayerStart(lvl);
      setLevel({ ...lvl, grid: normalizeGrid(lvl.grid) });
      setPlayer(startPosition);
      setPlayerDirection("right");
      setIsPlayerMoving(false);
      setShowBombs(true);
      setCountdownValue(null);
      setCollected(0);
      movesRef.current = 0;
      startedAtRef.current = Date.now();
      dynamicDirectionsRef.current = new Map();
      setMoves(0);
      setStatus("continue");
      setMessage(`Playing ${lvl.name}`);
      setScoreBreakdown(null);
      clearVentSelection();
      clearMovementTimeout();
      clearCountdownTimeout();
      startCountdown(lvl.bombPreviewSeconds ?? DEFAULT_BOMB_PREVIEW_SECONDS);
    } catch {
      setMessage("Level is invalid: missing player start.");
    }
  }, [clearCountdownTimeout, clearMovementTimeout, clearVentSelection, startCountdown]);

  const selectVentDestination = useCallback(
    (destination: VentDestination) => {
      if (!isSelectingVent || !level) {
        return;
      }

      const isAllowed = ventDestinations.some(
        (vent) => vent.x === destination.x && vent.y === destination.y,
      );

      if (!isAllowed) {
        return;
      }

      setPlayer(destination);
      pulseMovement();
      setStatus("continue");
      setMessage("Vent jump!");
      clearVentSelection();
      retroAudio.playMove();
    },
    [clearVentSelection, isSelectingVent, level, pulseMovement, ventDestinations],
  );

  const activeLevelId = level?.id;

  useEffect(() => {
    if (!activeLevelId || !player || status === "idle" || status === "restart" || status === "win") {
      return;
    }

    const intervalId = window.setInterval(() => {
      setLevel((currentLevel) => {
        if (!currentLevel) {
          return currentLevel;
        }

        const advanced = advanceDynamicDangers(
          currentLevel.grid,
          player,
          dynamicDirectionsRef.current,
        );

        if (!advanced.hasDangers) {
          return currentLevel;
        }

        dynamicDirectionsRef.current = advanced.directions;

        if (advanced.hitPlayer) {
          clearVentSelection();
          triggerHazardReset(player);
        }

        return { ...currentLevel, grid: advanced.grid };
      });
    }, DYNAMIC_DANGER_TICK_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [activeLevelId, clearVentSelection, player, status, triggerHazardReset]);

  useEffect(() => {
    if (!isSelectingVent) {
      return;
    }

    const handleVentSelectionKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      event.preventDefault();
      clearVentSelection();
      setMessage("Vent selection cancelled.");
    };

    window.addEventListener("keydown", handleVentSelectionKeyDown);

    return () => {
      window.removeEventListener("keydown", handleVentSelectionKeyDown);
    };
  }, [clearVentSelection, isSelectingVent]);

  const clearExplosionTimeout = useCallback(() => {
    if (explosionTimeoutRef.current !== null) {
      window.clearTimeout(explosionTimeoutRef.current);
      explosionTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearExplosionTimeout();
      clearMovementTimeout();
      clearCountdownTimeout();
    };
  }, [clearCountdownTimeout, clearExplosionTimeout, clearMovementTimeout]);

  return {
    level,
    player,
    playerDirection,
    isPlayerMoving,
    showBombs,
    countdownValue,
    scoreBreakdown,
    collected,
    moves,
    status,
    difficulty,
    message,
    levels,
    explosion,
    isSelectingVent,
    ventDestinations,
    loadGame,
    handlePlayLevel,
    resetGame,
    move,
    selectVentDestination,
  };
}
