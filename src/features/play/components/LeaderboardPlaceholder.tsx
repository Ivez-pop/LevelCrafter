import type { Level } from "../../../types/level";

interface LeaderboardPlaceholderProps {
  level: Level;
  onClose: () => void;
}

export function LeaderboardPlaceholder({ level, onClose }: LeaderboardPlaceholderProps) {
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

      <div className="arcade-panel-deep mt-4 px-4 py-6 text-center">
        <p className="font-black text-lime-300">Coming Soon</p>
      </div>
    </div>
  );
}
