import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DifficultySelector from "../components/DifficultySelector";
import GridEditor from "../components/GridEditor";
import TilePalette from "../components/TilePalette";
import type { Tile } from "../types/level";
import { saveLevel } from "../utils/storage";
import { validateLevel } from "../utils/levelValidation";
import { difficultySizes, type Difficulty } from "../constants/difficulty";

function CreateLevelPage() {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);

  const [grid, setGrid] = useState<Tile[][]>([]);

  const [levelName, setLevelName] = useState("");
  const [saveError, setSaveError] = useState("");

  const [selectedTile, setSelectedTile] = useState<Tile>("wall");

  const navigate = useNavigate();

  const createGrid = (selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty);

    const size = difficultySizes[selectedDifficulty];
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

  const handleSaveLevel = () => {
    if (!validateLevel(levelName, grid, difficulty, setSaveError)) {
      return;
    }

    if (!difficulty) return;

    const id = saveLevel({
      name: levelName.trim(),
      difficulty,
      width: grid.length,
      height: grid.length,
      grid,
    });

    alert(`Level saved! id: ${id}`);
  };

  // load handled in Play page; Create page only saves/exports

  const handleExportJson = () => {
    if (!difficulty) return;

    const level = {
      name: levelName.trim(),
      difficulty,
      width: grid.length,
      height: grid.length,
      grid,
    };

    const json = JSON.stringify(level, null, 2);

    const blob = new Blob([json], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = `${difficulty}-level.json`;

    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-white">
      <h1 className="mb-8 text-center text-4xl font-bold">Create Level</h1>

      <div className="mb-8 flex justify-center">
        <DifficultySelector onSelect={createGrid} />
      </div>

      {difficulty && (
        <p className="mb-6 text-center">Difficulty: {difficulty}</p>
      )}

      {grid.length > 0 && (
        <>
          <div className="mb-4 flex flex-col items-center gap-2">
            <label className="text-lg font-medium" htmlFor="level-name-input">
              Level Name:
            </label>
            <input
              id="level-name-input"
              value={levelName}
              onChange={(e) => {
                setLevelName(e.target.value);
                if (saveError) {
                  setSaveError("");
                }
              }}
              placeholder="Enter level name"
              className="rounded-lg bg-white px-4 py-2 text-slate-900 w-80"
            />
            {saveError && (
              <p className="text-sm text-red-400">{saveError}</p>
            )}
          </div>
          <TilePalette
            selectedTile={selectedTile}
            onSelect={handleTileSelect}
          />

          <p className="mb-6 text-center">Selected Tile: {selectedTile}</p>

          <div className="mb-6 flex flex-wrap justify-center gap-4">
            <button
              onClick={handleSaveLevel}
              className="rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-slate-400/50 focus:ring-offset-2 focus:ring-offset-slate-950"
            >
              Save Level
            </button>

            <button
              onClick={handleExportJson}
              className="rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-slate-400/50 focus:ring-offset-2 focus:ring-offset-slate-950"
            >
              Export JSON
            </button>

            <button
              onClick={() => navigate("/play")}
              className="rounded-lg bg-orange-600 px-6 py-3 font-semibold text-white hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-slate-400/50 focus:ring-offset-2 focus:ring-offset-slate-950"
            >
              Playtest
            </button>
          </div>

          <GridEditor grid={grid} onCellClick={placeTile} />
        </>
      )}
    </div>
  );
}

export default CreateLevelPage;
