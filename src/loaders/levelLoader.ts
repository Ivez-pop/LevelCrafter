import easy from "../mock-levels/easy.json";
import medium from "../mock-levels/medium.json";
import hard from "../mock-levels/hard.json";

import type { Level } from "../types/level";

export function loadLevel(
  difficulty: string
): Level {

  switch (difficulty) {

    case "easy":
      return easy as Level;

    case "medium":
      return medium as Level;

    case "hard":
      return hard as Level;

    default:
      throw new Error("Level not found");
  }
}