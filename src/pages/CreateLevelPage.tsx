import { useState } from "react";
import DifficultySelector from "../components/DifficultySelector";
import TilePalette from "../components/TilePalette";
import type { Tile, Level } from "../types/level";
import { saveLevel, loadLevel } from "../utils/storage";

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
  };

  const handleTileSelect = (tile: Tile) => {
    setSelectedTile(tile);
  };

  const placeTile = (rowIndex: number, colIndex: number) => {
    const updatedGrid = [...grid];

    updatedGrid[rowIndex][colIndex] = selectedTile;

    setGrid(updatedGrid);
  };

  const getTileColor = (tile: Tile) => {
    switch (tile) {
      case "wall":
        return "bg-gray-500";
      case "coin":
        return "bg-yellow-400";
      case "hazard":
        return "bg-red-500";
      case "player":
        return "bg-green-500";
      case "exit":
        return "bg-blue-500";
      default:
        return "bg-white";
    }
  };

  const handleSaveLevel = () => {
    if (!difficulty) return;

    const level: Level = {
      difficulty,
      width: grid.length,
      height: grid.length,
      grid,
    };

    saveLevel(level);

    alert(`${difficulty} level saved!`);
  };

  const handleLoadLevel = () => {
    if (!difficulty) return;

    const level = loadLevel(difficulty);

    if (!level) {
      alert("No saved level found!");
      return;
    }

    setGrid(level.grid);

    alert(`${difficulty} level loaded!`);
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

          <div className="mb-6 flex justify-center gap-4">
            <button
              onClick={handleSaveLevel}
              className="rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-500"
            >
              Save Level
            </button>

            <button
              onClick={handleLoadLevel}
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-500"
            >
              Load Level
            </button>
          </div>

          <div className="flex justify-center">
            <div
              className="grid gap-1"
              style={{
                gridTemplateColumns: `repeat(${grid.length}, 48px)`,
              }}
            >
              {grid.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <button
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => placeTile(rowIndex, colIndex)}
                    className={`h-12 w-12 border border-slate-600 ${getTileColor(
                      cell,
                    )}`}
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
