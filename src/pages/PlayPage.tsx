import { useEffect, useState } from "react";

import DifficultySelector from "../components/DifficultySelector";
import { getLevelsByDifficulty, getLevelById } from "../utils/storage";
import { getPlayerStart } from "../game/spawn";
import { processMove } from "../game/gameEngine";
import type { Level, Position, Tile } from "../types/level";
import type { Direction } from "../game/movement";

const getTileColor = (tile: Tile) => {
  switch (tile) {
    case "wall":
      return "bg-gray-500";
    case "coin":
      return "bg-yellow-400";
    case "hazard":
      return "bg-red-500";
    case "player":
      return "bg-green-500";
    case "exit":
      return "bg-blue-500";
    default:
      return "bg-white";
  }
};

function PlayPage() {
  const [difficulty, setDifficulty] =
    useState<"easy" | "medium" | "hard" | null>(null);

  const [level, setLevel] =
    useState<Level | null>(null);

  const [levels, setLevels] = useState<Level[]>([]);

  const [player, setPlayer] =
    useState<Position | null>(null);

  const [collected, setCollected] =
    useState(0);

  const [status, setStatus] =
    useState<"idle" | "blocked" | "continue" | "collect" | "restart" | "win">("idle");

  const [message, setMessage] =
    useState("");

  const normalizeGrid = (grid: Tile[][]) =>
    grid.map((row) =>
      row.map((tile) =>
        tile === "player" ? "empty" : tile,
      ),
    );

  const loadGame = (
    selectedDifficulty: "easy" | "medium" | "hard"
  ) => {
    setDifficulty(selectedDifficulty);
    const found = getLevelsByDifficulty(selectedDifficulty);
    setLevels(found);
    setLevel(null);
    setPlayer(null);
    setCollected(0);
    setStatus("idle");
    setMessage(found.length ? `Found ${found.length} levels.` : "No levels available. Create one first.");
  };

  const resetGame = () => {
    if (!difficulty || !level) return;

    // reload the current level by id to reset state
    const reloaded = getLevelById(level.id);
    if (!reloaded) return;

    const startPosition = getPlayerStart(reloaded);

    setLevel({ ...reloaded, grid: normalizeGrid(reloaded.grid) });
    setPlayer(startPosition);
    setCollected(0);
    setStatus("restart");
    setMessage("Hazard hit! Level restarted.");
  };

  const handleMove = (direction: Direction) => {
    if (!level || !player) return;
    if (status === "win") return;

    const result = processMove(level, player, direction);

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
      setLevel((current) => {
        if (!current) return current;

        const updatedGrid = current.grid.map((row, rowIndex) =>
          row.map((tile, colIndex) =>
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
      setPlayer(nextPosition);
      setStatus("win");
      setMessage("You win! Congratulations.");
      return;
    }

    setPlayer(nextPosition);
    setStatus("continue");
    setMessage("");
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      const directions: Record<string, Direction> = {
        w: "up",
        a: "left",
        s: "down",
        d: "right",
      };

      const direction = directions[key];

      if (direction) {
        event.preventDefault();
        handleMove(direction);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleMove, level, player, status]);

  const handlePlayLevel = (id: string) => {
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
      setStatus("continue");
      setMessage(`Playing ${lvl.name}`);
    } catch (e) {
      setMessage("Level is invalid: missing player start.");
    }
  };

  const renderedGrid =
    level?.grid.map((row, rowIndex) =>
      row.map((cell, colIndex) => {
        if (player?.x === colIndex && player?.y === rowIndex) {
          return "player" as Tile;
        }

        return cell;
      }),
    );

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-white">
      <h1 className="mb-8 text-center text-4xl font-bold">
        Play Level
      </h1>

      <div className="mb-8 flex justify-center">
        <DifficultySelector onSelect={loadGame} />
      </div>

      <div className="mb-6 flex flex-col items-center gap-3 text-center">
        <p>Difficulty: {difficulty ?? "None"}</p>
        <p>Collected Coins: {collected}</p>
        <p className="text-sm text-slate-300">Use W/A/S/D to move.</p>
        {message && (
          <p className="rounded-xl bg-slate-800 px-4 py-3 text-lg">
            {message}
          </p>
        )}
      </div>

      {!level && (
        <div className="mx-auto w-full max-w-xl">
          {levels.length === 0 ? (
            <p className="text-center text-slate-300">No levels available. Create one first.</p>
          ) : (
            <div className="grid gap-3">
              {levels.map((lvl) => (
                <div key={lvl.id} className="rounded-lg bg-slate-800 px-4 py-3 flex items-center justify-between">
                  <div className="text-left">
                    <div className="font-semibold">{lvl.name}</div>
                    <div className="text-sm text-slate-400">Created {new Date(lvl.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePlayLevel(lvl.id)}
                      className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-500"
                    >
                      Play
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {level && renderedGrid && (
        <div className="mx-auto w-max">
          <div
            className="grid gap-1"
            style={{
              gridTemplateColumns: `repeat(${level.width}, 48px)`,
            }}
          >
            {renderedGrid.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`h-12 w-12 border border-slate-600 ${getTileColor(cell)}`}
                />
              )),
            )}
          </div>
          {status === "win" && (
            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={() => level && handlePlayLevel(level.id)}
                className="rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-500"
              >
                Play Again
              </button>

              <button
                onClick={() => {
                  // return to level selection for current difficulty
                  if (difficulty) loadGame(difficulty);
                }}
                className="rounded-lg bg-slate-700 px-6 py-3 font-semibold text-white hover:bg-slate-600"
              >
                Return To Level Selection
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PlayPage;
