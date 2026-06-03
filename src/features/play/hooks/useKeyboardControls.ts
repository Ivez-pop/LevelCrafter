import { useEffect } from "react";
import type { Direction } from "../../../game/movement";

export function useKeyboardControls(onMove: (direction: Direction) => void) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      console.log("[useKeyboardControls] keydown", key);

      const directions: Record<string, Direction> = {
        w: "up",
        a: "left",
        s: "down",
        d: "right",
      };

      const direction = directions[key];

      if (direction) {
        event.preventDefault();
        console.log("[useKeyboardControls] triggering move", direction);
        onMove(direction);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onMove]);
}
