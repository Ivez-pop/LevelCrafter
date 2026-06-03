// levelLoader is deprecated. The application now uses the storage API
// to manage levels (`src/utils/storage.ts`).
// This file remains as a compatibility shim and will throw if used.

import type { Level } from "../types/level";

export function loadLevel(_: string): Level {
  throw new Error(
    "levelLoader.loadLevel is removed — use getLevelById / getLevelsByDifficulty from utils/storage instead",
  );
}