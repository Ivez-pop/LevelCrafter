import DifficultySelector from "../../../shared/components/DifficultySelector.tsx";
import type { Difficulty } from "../../../types/gameState";

interface GameControlsProps {
  difficulty: Difficulty | null;
  collected: number;
  message: string;
  onSelectDifficulty: (difficulty: Difficulty) => void;
}

export function GameControls({ difficulty, collected, message, onSelectDifficulty }: GameControlsProps) {
  return (
    <>
      <div className="mb-8 flex justify-center">
        <DifficultySelector onSelect={onSelectDifficulty} />
      </div>

      <div className="mb-2 flex flex-col items-center gap-4 text-center tracking-wide">
        <div className="grid w-full max-w-xl gap-3 sm:grid-cols-2">
          <p className="arcade-chip text-lime-300">
            Difficulty: <span className="text-white">{difficulty ?? "None"}</span>
          </p>
          <p className="arcade-chip text-yellow-300">
            Coins: <span className="text-white">{collected}</span>
          </p>
        </div>

        <p className="border-2 border-cyan-300 bg-black px-4 py-2 font-mono text-xs font-bold uppercase text-cyan-200 shadow-[3px_3px_0px_#000]">
          Use W/A/S/D or Drag to move
        </p>

        {message && (
          <p className="border-4 border-black bg-yellow-300 px-5 py-3 font-mono text-base font-black uppercase text-black shadow-[5px_5px_0px_#000] sm:text-lg">
            {message}
          </p>
        )}
      </div>
    </>
  );
}
