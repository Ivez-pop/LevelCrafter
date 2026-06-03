import { useState } from "react";
import DifficultySelector from "../components/DifficultySelector";
import TilePalette from "../components/TilePalette";
import type { Tile } from "../types/level";

function CreateLevelPage() {
  const [difficulty, setDifficulty] = useState<
    "easy" | "medium" | "hard" | null
  >(null);

  const [grid, setGrid] = useState<Tile[][]>([]);

  const [selectedTile, setSelectedTile] = useState<Tile>("wall");

  const createGrid = (selectedDifficulty: "easy" | "medium" | "hard") => {
    setDifficulty(selectedDifficulty);

    let size = 5;

    if (selectedDifficulty === "medium") {
      size = 8;
    }

    if (selectedDifficulty === "hard") {
      size = 12;
    }

    const newGrid: Tile[][] = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => "empty" as Tile),
    );

    setGrid(newGrid);

    console.log(selectedDifficulty);
  };

  const handleTileSelect = (tile: Tile) => {
    setSelectedTile(tile);
    console.log(tile);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <h1 className="mb-8 text-center text-4xl font-bold">Create Level</h1>

      <div className="mb-8 flex justify-center">
        <DifficultySelector onSelect={createGrid} />
      </div>

      {difficulty && (
        <p className="mb-6 text-center">Difficulty: {difficulty}</p>
      )}

      {grid.length > 0 && (
        <>
          <TilePalette
            selectedTile={selectedTile}
            onSelect={handleTileSelect}
          />

          <p className="mb-6 text-center">Selected Tile: {selectedTile}</p>

          <div className="flex justify-center">
            <div
              className="grid gap-1"
              style={{
                gridTemplateColumns: `repeat(${grid.length}, 40px)`,
              }}
            >
              {grid.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className="h-10 w-10 border border-slate-500 bg-white"
                  />
                )),
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default CreateLevelPage;
