import { useEffect, useState } from "react";
import { getLevelLeaderboard } from "../../../services/leaderboardService";
import type { Level } from "../../../types/level";
import type { LevelLeaderboardEntry } from "../../../types/leaderboard";

interface LeaderboardPlaceholderProps {
  level: Level;
  onClose: () => void;
}

export function LeaderboardPlaceholder({ level, onClose }: LeaderboardPlaceholderProps) {
  const [entries, setEntries] = useState<LevelLeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function loadLeaderboard() {
      setIsLoading(true);
      setError(false);

      try {
        const data = await getLevelLeaderboard(level.id);

        if (!isActive) {
          return;
        }

        setEntries(data);
      } catch {
        if (!isActive) {
          return;
        }

        setEntries([]);
        setError(true);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadLeaderboard();

    return () => {
      isActive = false;
    };
  }, [level.id]);

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");

    return `${minutes}:${seconds}`;
  };

  const getPlayerName = (entry: LevelLeaderboardEntry) =>
    entry.username ?? entry.displayName ?? "Anonymous";

  return (
    <div className="arcade-panel mt-6 p-4 text-left font-mono uppercase">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-yellow-300">Level Leaderboard</h2>
          <p className="mt-1 text-sm font-bold text-cyan-200">{level.name}</p>
        </div>
        <button onClick={onClose} className="arcade-button-rose px-4 py-2">
          Close
        </button>
      </div>

      <div className="arcade-panel-deep mt-4 px-4 py-6">
        {isLoading ? (
          <p className="text-center font-black text-lime-300">Loading leaderboard...</p>
        ) : error ? (
          <p className="text-center font-black text-rose-300">Failed to load leaderboard.</p>
        ) : entries.length === 0 ? (
          <p className="text-center font-black text-cyan-200">No leaderboard entries yet.</p>
        ) : (
          <div className="grid gap-3">
            {entries.map((entry) => (
              <div
                key={`${entry.userId}-${entry.rank}`}
                className="border-2 border-black bg-[#0f1531] px-4 py-3 shadow-[4px_4px_0px_#000]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="truncate text-lg font-black text-yellow-300">
                      #{entry.rank} {getPlayerName(entry)}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm font-bold text-cyan-200">
                      <span>{formatTime(entry.timeSeconds)}</span>
                      <span>{entry.moves} Moves</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-cyan-200">Score</div>
                    <div className="text-xl font-black text-lime-300">{entry.bestScore}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
