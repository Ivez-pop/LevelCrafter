import type { Difficulty } from "../../types/gameState";

interface DifficultySelectorProps {
  onSelect: (difficulty: Difficulty) => void;
}

function DifficultySelector({ onSelect }: DifficultySelectorProps) {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      <button
        onClick={() => onSelect("easy")}
        className="arcade-button-lime"
      >
        Easy
      </button>

      <button
        onClick={() => onSelect("medium")}
        className="arcade-button-yellow"
      >
        Medium
      </button>

      <button
        onClick={() => onSelect("hard")}
        className="arcade-button-rose"
      >
        Hard
      </button>
    </div>
  );
}

export default DifficultySelector;
