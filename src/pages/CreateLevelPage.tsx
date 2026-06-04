import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DifficultySelector from "../shared/components/DifficultySelector";
import GridEditor from "../features/editor/components/GridEditor";
import TilePalette from "../features/editor/components/TilePalette";
import type { Tile } from "../types/level";
import { saveLevel } from "../services/levelStorage";
import { publishCreatedLevel } from "../services/profileService";
import { validateLevel } from "../services/levelValidation";
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

  const handleSaveLevel = async () => {
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

    void publishCreatedLevel({
      id,
      name: levelName.trim(),
      difficulty,
      width: grid.length,
      height: grid.length,
      createdAt: Date.now(),
      grid,
    }).catch((error: unknown) => {
      console.error("[CreateLevelPage] failed to publish created level", error);
    });

    alert(`Level saved! id: ${id}`);
  };

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
    <div className="arcade-screen">
      <div className="arcade-shell grid min-h-[calc(100vh-2rem)] gap-5 lg:grid-cols-[340px_minmax(0,1fr)] sm:min-h-[calc(100vh-3rem)]">
        <div className="arcade-panel flex min-h-0 flex-col gap-5 p-4 lg:max-h-[calc(100vh-3rem)] lg:overflow-auto">
          <div>
            <p className="arcade-kicker mb-2">Builder</p>
            <h1 className="font-mono text-3xl font-black uppercase text-yellow-300 drop-shadow-[3px_3px_0px_#000]">
              Create Level
            </h1>
          </div>

          <section>
            <h3 className="arcade-section-label">Difficulty</h3>

            <DifficultySelector onSelect={createGrid} />

            {difficulty && (
              <div className="arcade-chip mt-3 bg-yellow-300 text-black">
                {difficulty.toUpperCase()}
              </div>
            )}
          </section>

          <section>
            <h3 className="arcade-section-label">Level Name</h3>

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
              className="arcade-input"
            />

            {saveError && (
              <p className="mt-3 border-2 border-black bg-rose-500 px-3 py-2 font-mono text-xs font-black uppercase text-white shadow-[3px_3px_0px_#000]">
                {saveError}
              </p>
            )}
          </section>

          <section>
            <h3 className="arcade-section-label">Tiles</h3>

            <TilePalette selectedTile={selectedTile} onSelect={handleTileSelect} />
          </section>

          <div className="mt-auto grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <button onClick={handleSaveLevel} className="arcade-button-lime w-full">
              Save Level
            </button>

            <button onClick={handleExportJson} className="arcade-button-violet w-full">
              Export JSON
            </button>

            <button
              onClick={() => navigate("/play")}
              className="arcade-button-orange w-full"
            >
              Playtest
            </button>
          </div>
        </div>

        <div className="arcade-panel flex min-h-[420px] min-w-0 items-center justify-center p-3 sm:p-6 lg:min-h-0">
          {grid.length > 0 ? (
            <div className="arcade-panel-deep max-h-full max-w-full overflow-auto p-3 sm:p-6">
              <GridEditor grid={grid} onCellClick={placeTile} />
            </div>
          ) : (
            <div className="max-w-xl text-center">
              <p className="arcade-kicker mb-4">Ready</p>
              <h2 className="font-mono text-3xl font-black uppercase text-yellow-300 drop-shadow-[3px_3px_0px_#000] sm:text-5xl">
                Select Difficulty
              </h2>

              <p className="mx-auto mt-4 max-w-md font-mono text-sm font-bold uppercase leading-6 text-cyan-200">
                Create a grid to start building your level.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreateLevelPage;
