import { useEffect, useState } from "react";
import { getGlobalRankings } from "../services/rankingService";
import type { GlobalRankingEntry } from "../types/leaderboard";
import GlobalPageNavigation from "../components/GlobalPageNavigation";

function formatRankedUsername(entry: GlobalRankingEntry) {
  return entry.username ?? entry.displayName ?? "Anonymous";
}

export default function GlobalLeaderboardPage() {
  const [entries, setEntries] = useState<GlobalRankingEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function loadRankings() {
      setIsLoading(true);
      setError(false);

      try {
        const data = await getGlobalRankings(1, 100);

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

    loadRankings();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <div className="arcade-screen">
      <GlobalPageNavigation />
      <div className="arcade-shell">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="arcade-kicker mb-2">Platform Rankings</p>
            <h1 className="arcade-title text-4xl md:text-6xl">Global Leaderboard</h1>
          </div>

        </div>

        <div className="arcade-panel p-4 sm:p-6">
          <div className="arcade-panel-deep px-4 py-6">
            {isLoading ? (
              <p className="text-center font-mono text-lg font-black uppercase text-lime-300">
                Loading global leaderboard...
              </p>
            ) : error ? (
              <p className="text-center font-mono text-lg font-black uppercase text-rose-300">
                Failed to load global leaderboard.
              </p>
            ) : entries.length === 0 ? (
              <p className="text-center font-mono text-lg font-black uppercase text-cyan-200">
                No leaderboard entries yet.
              </p>
            ) : (
              <div className="grid gap-3">
                {entries.map((entry) => (
                  <div
                    key={entry.userId}
                    className="border-2 border-black bg-[#0f1531] px-4 py-3 shadow-[4px_4px_0px_#000]"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="truncate font-mono text-lg font-black uppercase text-yellow-300">
                          #{entry.rank} {formatRankedUsername(entry)}
                        </div>
                        <div className="mt-1 text-xs font-bold uppercase text-cyan-200">
                          {entry.completedMaps} Completed Maps
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-bold uppercase text-cyan-200">
                          Total Score
                        </div>
                        <div className="text-xl font-black text-lime-300">
                          {entry.globalScore}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
