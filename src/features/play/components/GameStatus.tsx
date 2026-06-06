import { TileArtwork } from "../../tiles/TileArtwork";
import { blastTile } from "../../tiles/tileAssets";
import type { Level } from "../../../types/level";
import type { ScoreBreakdown } from "../../../types/leaderboard";

interface GameStatusProps {
  status: "idle" | "blocked" | "continue" | "collect" | "restart" | "win";
  level: Level | null;
  timer: string;
  collected: number;
  moves: number;
  scoreBreakdown?: ScoreBreakdown | null;
  onPlayAgain: () => void;
  onReturnToLevelSelection: () => void;
  onOpenLeaderboard: (level: Level) => void;
}

export function GameStatus({
  status,
  level,
  timer,
  collected,
  moves,
  scoreBreakdown,
  onPlayAgain,
  onReturnToLevelSelection,
  onOpenLeaderboard,
}: GameStatusProps) {
  if (status !== "win" && status !== "restart") {
    return null;
  }

  const isWin = status === "win";

  return (
    <div className="fixed inset-0 z-50 flex overflow-y-auto overflow-x-hidden bg-black/80 p-4 md:p-6">
      <div className="m-auto w-full max-w-4xl border-[3px] sm:border-[4px] md:border-[6px] border-black bg-[#12122f] p-1.5 sm:p-2 md:p-3 shadow-[6px_6px_0px_rgba(0,0,0,0.8)] sm:shadow-[8px_8px_0px_rgba(0,0,0,0.8)] md:shadow-[12px_12px_0px_rgba(0,0,0,0.8)]">
        <div className="border-[3px] sm:border-[4px] md:border-[6px] border-[#f8d94c] bg-[#1b1b49] p-2 sm:p-3 md:p-4 shadow-[inset_2px_2px_0px_rgba(255,255,255,0.2),inset_-2px_-2px_0px_rgba(0,0,0,0.6)] md:shadow-[inset_4px_4px_0px_rgba(255,255,255,0.2),inset_-4px_-4px_0px_rgba(0,0,0,0.6)]">
          <div className="border-[2px] sm:border-[3px] md:border-[4px] border-black bg-black p-3 sm:p-4 md:p-6 text-center shadow-[inset_0px_0px_10px_rgba(0,0,0,1)] md:shadow-[inset_0px_0px_20px_rgba(0,0,0,1)]">
            <div className="mb-2 sm:mb-4 md:mb-6 flex justify-center drop-shadow-[0px_4px_0px_#000]">
              {isWin ? (
                <div className="h-12 w-12 sm:h-16 sm:w-16 md:h-24 md:w-24">
                  <TileArtwork tile="exit" className="h-full w-full" imageClassName="p-1 md:p-2 pixelated" />
                </div>
              ) : (
                <img
                  src={blastTile.src ?? undefined}
                  alt={blastTile.alt}
                  draggable={false}
                  className="h-12 w-12 sm:h-16 sm:w-16 md:h-24 md:w-24 object-cover pixelated"
                />
              )}
            </div>

            <h2 className={`font-mono text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-widest drop-shadow-[3px_3px_0px_#000] md:drop-shadow-[5px_5px_0px_#000] ${isWin ? "text-yellow-300" : "text-rose-500"}`}>
              {isWin ? "YOU WIN!" : "GAME OVER!"}
            </h2>

            <p className="mt-2 md:mt-4 font-mono text-sm sm:text-lg md:text-2xl font-bold uppercase text-white drop-shadow-[2px_2px_0px_#000]">
              {isWin ? "Excellent work." : "The hazard got you."}
            </p>

            <div className="mx-auto mt-4 sm:mt-6 md:mt-8 w-full max-w-2xl border-[2px] sm:border-[3px] md:border-[4px] border-cyan-400 bg-[#0a0a1f] p-3 sm:p-4 md:p-6 text-left font-mono text-xs sm:text-base md:text-xl font-bold uppercase text-cyan-100 shadow-[3px_3px_0px_#000] md:shadow-[6px_6px_0px_#000]">
              <div className="grid gap-1.5 sm:gap-2 md:gap-3">
                <div className="flex justify-between border-b-2 border-cyan-800 pb-1 sm:pb-2">
                  <span className="text-cyan-400">Time:</span>
                  <span>{timer}</span>
                </div>
                <div className="flex justify-between border-b-2 border-cyan-800 pb-1 sm:pb-2">
                  <span className="text-cyan-400">Moves:</span>
                  <span>{moves}</span>
                </div>
                <div className="flex justify-between pb-1 sm:pb-2">
                  <span className="text-cyan-400">Coins:</span>
                  <span className="text-yellow-300">{collected}</span>
                </div>
                {scoreBreakdown ? (
                  <div className="mt-2 space-y-1 border-t-2 border-cyan-800 pt-3 text-[10px] sm:text-sm md:text-base">
                    <div className="flex justify-between">
                      <span className="text-cyan-400">Base Score</span>
                      <span className="text-yellow-300">+{scoreBreakdown.baseScore}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-cyan-400">Coins</span>
                      <span className="text-yellow-300">+{scoreBreakdown.coinBonus}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-cyan-400">Moves</span>
                      <span className="text-rose-300">-{scoreBreakdown.movePenalty}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-cyan-400">Time</span>
                      <span className="text-rose-300">-{scoreBreakdown.timePenalty}</span>
                    </div>
                    <div className="flex justify-between border-t border-cyan-800 pt-2">
                      <span className="text-cyan-400">Difficulty</span>
                      <span className="text-lime-300">x{scoreBreakdown.difficultyMultiplier.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-cyan-400">Bomb Timer</span>
                      <span className="text-lime-300">x{scoreBreakdown.bombPreviewMultiplier.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-cyan-800 pt-2 text-sm sm:text-base md:text-lg">
                      <span className="text-yellow-300">Final Score</span>
                      <span className="text-yellow-300">{scoreBreakdown.finalScore}</span>
                    </div>
                  </div>
                ) : null}
                {level ? (
                  <div className="mt-1 sm:mt-2 text-center text-[10px] sm:text-xs md:text-sm text-fuchsia-300">
                    Level: {level.name}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="mt-6 md:mt-10 flex flex-col gap-2 sm:gap-4 sm:flex-row sm:justify-center">
              {isWin ? (
                <>
                  <button
                    onClick={() => level && onOpenLeaderboard(level)}
                    className="arcade-button-cyan min-w-[140px] sm:min-w-[200px] text-sm sm:text-lg md:text-xl py-2 sm:py-3 md:py-4"
                  >
                    LEADERBOARD
                  </button>
                  <button onClick={onReturnToLevelSelection} className="arcade-button-orange min-w-[100px] sm:min-w-[150px] text-sm sm:text-lg md:text-xl py-2 sm:py-3 md:py-4">
                    EXIT
                  </button>
                </>
              ) : (
                <>
                  <button onClick={onPlayAgain} className="arcade-button-lime min-w-[140px] sm:min-w-[200px] text-sm sm:text-lg md:text-xl py-2 sm:py-3 md:py-4">
                    RETRY
                  </button>
                  <button onClick={onReturnToLevelSelection} className="arcade-button-orange min-w-[100px] sm:min-w-[150px] text-sm sm:text-lg md:text-xl py-2 sm:py-3 md:py-4">
                    EXIT
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
