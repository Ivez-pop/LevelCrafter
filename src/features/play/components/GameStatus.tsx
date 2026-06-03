interface GameStatusProps {
  status: "idle" | "blocked" | "continue" | "collect" | "restart" | "win";
  onPlayAgain: () => void;
  onReturnToLevelSelection: () => void;
}

export function GameStatus({ status, onPlayAgain, onReturnToLevelSelection }: GameStatusProps) {
  if (status !== "win") {
    return null;
  }

  return (
    <div className="flex flex-wrap justify-center gap-3">
      <button
        onClick={onPlayAgain}
        className="arcade-button-lime"
      >
        Play Again
      </button>

      <button
        onClick={onReturnToLevelSelection}
        className="arcade-button-cyan"
      >
        Return To Level Selection
      </button>
    </div>
  );
}
