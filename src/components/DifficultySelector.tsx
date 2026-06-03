interface DifficultySelectorProps {
  onSelect: (difficulty: "easy" | "medium" | "hard") => void;
}

function DifficultySelector({ onSelect }: DifficultySelectorProps) {
  return (
    <div className="flex gap-4">
      <button
        onClick={() => onSelect("easy")}
        className="rounded-lg bg-green-600 px-5 py-2 text-white"
      >
        Easy
      </button>

      <button
        onClick={() => onSelect("medium")}
        className="rounded-lg bg-yellow-600 px-5 py-2 text-white"
      >
        Medium
      </button>

      <button
        onClick={() => onSelect("hard")}
        className="rounded-lg bg-red-600 px-5 py-2 text-white"
      >
        Hard
      </button>
    </div>
  );
}

export default DifficultySelector;
