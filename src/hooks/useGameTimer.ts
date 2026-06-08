import { useEffect, useRef, useState } from "react";
import type { GameStatus } from "../types/gameState";

function formatElapsedTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/**
 * Tracks visible elapsed play time for the active level.
 * The timer freezes during the bomb preview and starts only after the player's
 * first post-preview move attempt.
 */
export function useGameTimer(
  levelId: string | null,
  status: GameStatus,
  countdownValue: string | null,
  moves: number,
) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Reset immediately when no active game is selected.
  useEffect(() => {
    if (!levelId || status === "idle" || moves === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setElapsedSeconds(0);
    }
  }, [levelId, moves, status]);

  useEffect(() => {
    // Freeze the timer before play starts, during preview, and in terminal states.
    if (
      !levelId ||
      moves === 0 ||
      countdownValue !== null ||
      status === "win" ||
      status === "restart" ||
      status === "idle"
    ) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [countdownValue, levelId, moves, status]);

  // Detect retry/new-level transitions because the same hook instance can stay
  // mounted while the user restarts from the win/game-over overlay.
  const previousStatus = useRef<GameStatus>(status);
  const previousLevelId = useRef<string | null>(levelId);

  useEffect(() => {
    const isNewLevel = previousLevelId.current !== levelId;
    const isRestarting =
      (previousStatus.current === "restart" || previousStatus.current === "win") &&
      status === "continue";

    if (isNewLevel || isRestarting) {
      setElapsedSeconds(0);
    }

    previousStatus.current = status;
    previousLevelId.current = levelId;
  }, [levelId, status]);

  return formatElapsedTime(elapsedSeconds);
}
