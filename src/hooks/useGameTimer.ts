import { useEffect, useRef, useState } from "react";
import type { GameStatus } from "../types/gameState";

function formatElapsedTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function useGameTimer(levelId: string | null, status: GameStatus) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Reset timer to 0 when starting or restarting a game
  useEffect(() => {
    if (!levelId || status === "idle") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setElapsedSeconds(0);
    }
  }, [levelId, status]);

  useEffect(() => {
    // Freeze the timer if we are in an end-game or idle state
    if (!levelId || status === "win" || status === "restart" || status === "idle") {
      return;
    }

    const intervalId = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [levelId, status]);

  // We need to detect when the user hits 'Retry' or plays a new level,
  // which transitions the status to "continue" from an end-game state.
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
