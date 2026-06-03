import DifficultySelector
from "../components/DifficultySelector";

import { loadLevel }
from "../loaders/levelLoader";

import { getPlayerStart }
from "../game/spawn";

export default function Play() {

  function handleDifficulty(
    difficulty: string
  ) {

    const level =
  loadLevel(difficulty);

const player =
  getPlayerStart(level);

console.log(player);

    console.log(level);
  }

  return (
    <div>
      <DifficultySelector
        onSelect={handleDifficulty}
      />
    </div>
  );
}