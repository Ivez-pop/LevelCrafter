import { useState } from "react";
import type { Tile } from "../types/level";
import { useGame } from "../features/play/hooks/useGame";
import { useKeyboardControls } from "../features/play/hooks/useKeyboardControls";
import { GameBoard } from "../features/play/components/GameBoard";
import { GameControls } from "../features/play/components/GameControls";
import { LevelList } from "../features/play/components/LevelList";
import { GameStatus } from "../features/play/components/GameStatus";
import { LeaderboardPlaceholder } from "../features/play/components/LeaderboardPlaceholder";
import { useGameTimer } from "../hooks/useGameTimer";
import type { Level } from "../types/level";
import { getLevelById, importLevelFromJson } from "../services/levelStorage";

const getTileStyle = (tile: Tile) => {
  switch (tile) {
    case "wall":
      return "bg-[#4b5563]";
    case "coin":
      return "bg-[#ffd83d]";
    case "hazard":
      return "bg-[#ff3d57]";
    case "player":
      return "bg-[#43ff8f]";
    case "exit":
      return "bg-[#39dfff]";
    default:
      return "bg-[#e9f7ff]";
  }
};

const getTileIcon = (tile: Tile) => {
  switch (tile) {
    case "wall":
      return "🧱";
    case "coin":
      return "🪙";
    case "hazard":
      return "🔥";
    case "player":
      return "😎";
    case "exit":
      return "🚪";
    default:
      return "";
  }
};

function PlayPage() {
  const game = useGame();
  const timer = useGameTimer(game.level?.id ?? null, game.status);
  const [leaderboardLevel, setLeaderboardLevel] = useState<Level | null>(null);

  useKeyboardControls(game.move);

  const handleImportJson = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      const importedLevelId = await importLevelFromJson(file);
      const importedLevel = getLevelById(importedLevelId);

      if (!importedLevel) {
        throw new Error("Imported level could not be loaded.");
      }

      game.loadGame(importedLevel.difficulty);
      game.handlePlayLevel(importedLevelId);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Invalid level file!");
    } finally {
      event.target.value = "";
    }
  };

  const renderedGrid =
    game.level?.grid.map((row: Tile[], rowIndex: number) =>
      row.map((cell: Tile, colIndex: number) => {
        if (game.player?.x === colIndex && game.player?.y === rowIndex) {
          return "player" as Tile;
        }

        return cell;
      }),
    ) ?? [];

  return (
    <div className="arcade-screen">
      <h1 className="arcade-title mb-6">PLAY LEVELS</h1>

      {!game.level ? (
        <div className="mx-auto max-w-5xl">
          <div className="arcade-panel p-4 sm:p-6">
            <GameControls
              difficulty={game.difficulty}
              collected={game.collected}
              message={game.message}
              onSelectDifficulty={game.loadGame}
            />

            <div className="mt-4">
              <label className="arcade-button-violet cursor-pointer">
                IMPORT JSON
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJson}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="mt-8">
            <LevelList
              levels={game.levels}
              onPlayLevel={game.handlePlayLevel}
              onOpenLeaderboard={setLeaderboardLevel}
            />

            {leaderboardLevel ? (
              <LeaderboardPlaceholder
                level={leaderboardLevel}
                onClose={() => setLeaderboardLevel(null)}
              />
            ) : null}
          </div>
        </div>
      ) : (
        <div className="arcade-shell">
          <div className="arcade-panel mb-6 grid grid-cols-1 gap-4 p-4 sm:grid-cols-4">
            <div className="arcade-chip text-yellow-300">
              LEVEL: {game.level.name}
            </div>

            <div className="arcade-chip text-fuchsia-300">TIME: {timer}</div>

            <div className="arcade-chip text-cyan-300">
              COINS: {game.collected}
            </div>

            <div className="arcade-chip text-lime-300">
              STATUS: {game.status.toUpperCase()}
            </div>
          </div>

          <div className="arcade-panel flex justify-center p-3 sm:p-8">
            <div className="arcade-panel-deep max-w-full overflow-x-auto p-3 sm:p-6">
              <GameBoard
                width={game.level.width}
                grid={renderedGrid}
                getTileStyle={getTileStyle}
                getTileIcon={getTileIcon}
              />
            </div>
          </div>

          <div className="arcade-panel mt-6 p-4">
            <GameStatus
              status={game.status}
              onPlayAgain={() =>
                game.level && game.handlePlayLevel(game.level.id)
              }
              onReturnToLevelSelection={() =>
                game.difficulty && game.loadGame(game.difficulty)
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default PlayPage;
