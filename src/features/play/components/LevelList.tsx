import type { Level } from "../../../types/level";

interface LevelListProps {
  levels: Level[];
  onPlayLevel: (id: string) => void;
}

export function LevelList({ levels, onPlayLevel }: LevelListProps) {
  if (levels.length === 0) {
    return <p className="arcade-chip px-5 py-4 text-cyan-200">No levels available. Create one first.</p>;
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="grid gap-3">
        {levels.map((lvl) => (
          <div key={lvl.id} className="grid gap-4 border-4 border-black bg-[#12122f] px-4 py-3 shadow-[5px_5px_0px_#000] sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="min-w-0 text-left font-mono uppercase">
              <div className="truncate font-black text-yellow-300">{lvl.name}</div>
              <div className="mt-1 text-xs font-bold text-cyan-200">Created {new Date(lvl.createdAt).toLocaleString()}</div>
            </div>
            <div className="flex gap-2 sm:justify-end">
              <button
                onClick={() => onPlayLevel(lvl.id)}
                className="arcade-button-lime w-full px-4 py-2 sm:w-auto"
              >
                Play
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
