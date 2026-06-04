import { useEffect, useRef, useState } from "react";
import type { GameStatus } from "../types/gameState";

function formatElapsedTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function useGameTimer(levelId: string | null, status: GameStatus) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const previousLevelId = useRef<string | null>(levelId);
  const previousStatus = useRef<GameStatus>(status);

  useEffect(() => {
    if (previousLevelId.current !== levelId) {
      previousLevelId.current = levelId;
      setElapsedSeconds(0);
    }

    if (!levelId) {
      setElapsedSeconds(0);
    }
  }, [levelId]);

  useEffect(() => {
    if (status === "restart") {
      setElapsedSeconds(0);
    }

    if (levelId && previousStatus.current === "win" && status !== "win") {
      setElapsedSeconds(0);
    }

    previousStatus.current = status;
  }, [levelId, status]);

  useEffect(() => {
    if (!levelId || status === "win") {
      return;
    }

    const intervalId = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [levelId, status]);

  return formatElapsedTime(elapsedSeconds);
}
