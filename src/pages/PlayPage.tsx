import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import type { ChangeEvent } from "react";
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
import { getTileStyle } from "../features/tiles/tileAssets";
import {
  getLevelById,
  importLevelFromCode,
  importLevelFromJson,
} from "../services/levelStorage";

function PlayPage() {
  const game = useGame();
  const timer = useGameTimer(
    game.level?.id ?? null,
    game.status,
    game.countdownValue,
    game.moves,
  );
  const navigate = useNavigate();
  const [leaderboardLevel, setLeaderboardLevel] = useState<Level | null>(null);
  const [levelCode, setLevelCode] = useState("");
  const [isImportOpen, setIsImportOpen] = useState(false);

  const controlsRef = useRef<HTMLDivElement>(null);
  const [buttonGroup, setButtonGroup] = useState<Element | null>(null);

  const openLeaderboard = (level: Level) => {
    setLeaderboardLevel(level);
  };

  const closeLeaderboard = () => {
    setLeaderboardLevel(null);
  };

  useEffect(() => {
    if (!game.level && controlsRef.current) {
      // The import button visually belongs with the difficulty controls, so it
      // portals into that button row once the child component has rendered.
      const buttons = Array.from(controlsRef.current.querySelectorAll("button"));
      const hardBtn = buttons.find((b) => b.textContent?.toUpperCase().includes("HARD"));
      if (hardBtn && hardBtn.parentElement) {
        setButtonGroup(hardBtn.parentElement);
      }
    } else {
      setButtonGroup(null);
    }
  }, [game.level, game.difficulty]);

  useKeyboardControls(game.move);

  useEffect(() => {
    const shouldLockScroll =
      Boolean(leaderboardLevel) ||
      isImportOpen ||
      game.status === "win" ||
      game.status === "restart" ||
      game.countdownValue !== null;

    // Modal overlays and terminal game states should not scroll the page behind
    // them, especially on small screens where the board can be wider than view.
    const previousOverflow = document.body.style.overflow;

    if (shouldLockScroll) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [leaderboardLevel, game.countdownValue, game.status, isImportOpen]);

  const startImportedLevel = async (importedLevelId: string) => {
    const importedLevel = await getLevelById(importedLevelId);

    if (!importedLevel) {
      throw new Error("Imported level could not be loaded.");
    }

    await game.loadGame(importedLevel.difficulty);
    await game.handlePlayLevel(importedLevelId);
  };

  const handleImportJson = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      await startImportedLevel(await importLevelFromJson(file));
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Invalid level file!");
    } finally {
      event.target.value = "";
      setIsImportOpen(false);
    }
  };

  const handleImportCode = async () => {
    try {
      await startImportedLevel(await importLevelFromCode(levelCode));
      setLevelCode("");
      setIsImportOpen(false);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Invalid level code!");
    }
  };

  const renderedGrid =
    // Game state stores the player separately from the static level grid. The
    // board receives a rendered overlay so tile art stays simple.
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
      <div className="relative mb-6 flex items-start justify-end">
  <h1 className="arcade-title absolute left-1/2 -translate-x-1/2 !mb-0">
    PLAY LEVELS
  </h1>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => navigate("/")} className="arcade-button-cyan">HOME</button>
          <button onClick={() => navigate("/profile")} className="arcade-button-violet">PROFILE</button>
        </div>
      </div>

      {!game.level ? (
        <div className="mx-auto max-w-5xl">
          <div className="arcade-panel p-4 sm:p-6" ref={controlsRef}>
            <GameControls
              difficulty={game.difficulty}
              collected={game.collected}
              message={game.message}
              onSelectDifficulty={game.loadGame}
            />
            {buttonGroup ? (
              createPortal(
                <button
                  onClick={() => setIsImportOpen(true)}
                  className="arcade-button-violet whitespace-nowrap"
                >
                  IMPORT
                </button>,
                buttonGroup
              )
            ) : (
              <div className="mt-4 flex">
                <button
                  onClick={() => setIsImportOpen(true)}
                  className="arcade-button-violet whitespace-nowrap"
                >
                  IMPORT
                </button>
              </div>
            )}
          </div>

          <div className="mt-8">
            <LevelList
              levels={game.levels}
              onPlayLevel={game.handlePlayLevel}
              onOpenLeaderboard={openLeaderboard}
            />

            {isImportOpen && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 sm:p-6">
                <div className="arcade-panel w-full max-w-2xl p-6 sm:p-8">
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="arcade-section-label !mb-0">Import Level</h2>
                    <button
                      onClick={() => setIsImportOpen(false)}
                      className="font-mono text-2xl font-black text-rose-400 hover:text-rose-300"
                    >
                      X
                    </button>
                  </div>

                  <div className="mt-4">
                    <label className="arcade-button-violet block cursor-pointer text-center">
                      IMPORT JSON
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportJson}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="mt-4 grid items-start gap-3 sm:grid-cols-[1fr_auto]">
                    <textarea
                      value={levelCode}
                      onChange={(event) => setLevelCode(event.target.value)}
                      placeholder="Paste share code"
                      className="arcade-input min-h-48 text-sm"
                    />
                    <button
                      onClick={handleImportCode}
                      disabled={!levelCode.trim()}
                      className="arcade-button-cyan disabled:opacity-50"
                    >
                      Import Code
                    </button>
                  </div>
                </div>
              </div>
            )}
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

          <div className="relative arcade-panel flex justify-center p-3 sm:p-8">
            <div className="arcade-panel-deep max-w-full overflow-x-auto p-3 sm:p-6">
              <GameBoard
                width={game.level.width}
                grid={renderedGrid}
                player={game.player}
                playerDirection={game.playerDirection}
                isPlayerMoving={game.isPlayerMoving}
                showBombs={game.showBombs}
                explosion={game.explosion}
                getTileStyle={getTileStyle}
                onMove={game.move}
                onSelectVentDestination={game.selectVentDestination}
                isSelectingVent={game.isSelectingVent}
                availableVentDestinations={game.ventDestinations}
              />
            </div>

            <GameStatus
              status={game.status}
              deathReason={game.deathReason}
              level={game.level}
              timer={timer}
              collected={game.collected}
              moves={game.moves}
              scoreBreakdown={game.scoreBreakdown}
              onPlayAgain={() => game.level && game.handlePlayLevel(game.level.id)}
              onReturnToLevelSelection={() => game.difficulty && game.loadGame(game.difficulty)}
              onOpenLeaderboard={openLeaderboard}
            />

          </div>
        </div>
      )}

      {leaderboardLevel ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden bg-black/90 p-4 sm:p-6">
          <div className="w-full max-w-3xl min-w-0 max-h-[calc(100vh-2rem)] overflow-y-auto overflow-x-hidden">
            <LeaderboardPlaceholder
              key={leaderboardLevel.id}
              level={leaderboardLevel}
              onClose={closeLeaderboard}
            />
          </div>
        </div>
      ) : null}

      {game.countdownValue !== null ? (
        <div className="pointer-events-none fixed inset-0 z-[65] flex items-center justify-center bg-black/25">
          <div className="text-center font-mono font-black uppercase text-white drop-shadow-[4px_4px_0px_#000]">
            <div className="text-7xl sm:text-9xl">
              {game.countdownValue}
            </div>
            <div className="mt-3 text-sm tracking-[0.4em] text-yellow-300 sm:text-base">
              Memorize the bombs
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default PlayPage;
