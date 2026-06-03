type Props = {
  onSelect: (difficulty: string) => void;
};

export default function DifficultySelector({
  onSelect,
}: Props) {
  return (
    <div>
      <h2>Select Difficulty</h2>

      <button onClick={() => onSelect("easy")}>
        Easy
      </button>

      <button onClick={() => onSelect("medium")}>
        Medium
      </button>

      <button onClick={() => onSelect("hard")}>
        Hard
      </button>
    </div>
  );
}