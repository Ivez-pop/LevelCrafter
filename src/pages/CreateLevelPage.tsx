import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DifficultySelector from "../shared/components/DifficultySelector";
import GridEditor from "../features/editor/components/GridEditor";
import TilePalette from "../features/editor/components/TilePalette";
import type { Level, Tile } from "../types/level";
import { encodeLevelCode, getLevelById, saveLevel } from "../services/levelStorage";
import { validateLevel } from "../services/levelValidation";
import { buildStandaloneGameHtml } from "../services/standaloneExport";
import { difficultySizes, type Difficulty } from "../constants/difficulty";
import GlobalPageNavigation from "../components/GlobalPageNavigation";

type LevelDraft = Omit<Level, "id" | "createdAt">;

function cloneGrid(grid: Tile[][]) {
  return grid.map((row) => [...row]);
}

function emptyGrid(size: number) {
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => "empty" as Tile),
  );
}

function downloadFile(filename: string, contents: string, type: string) {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

function CreateLevelPage() {
  const { levelId } = useParams<{ levelId?: string }>();
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [grid, setGrid] = useState<Tile[][]>([]);
  const [history, setHistory] = useState<Tile[][][]>([]);
  const [future, setFuture] = useState<Tile[][][]>([]);
  const [levelName, setLevelName] = useState("");
  const [saveError, setSaveError] = useState("");
  const [selectedTile, setSelectedTile] = useState<Tile>("wall");
  const [shareCode, setShareCode] = useState("");
  const [isLoadingLevel, setIsLoadingLevel] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!levelId) return;

    let cancelled = false;

    const loadLevel = async () => {
      setIsLoadingLevel(true);

      try {
        const existing = await getLevelById(levelId);

        if (!existing || cancelled) return;

        setDifficulty(existing.difficulty);
        setGrid(existing.grid);
        setHistory([]);
        setFuture([]);
        setLevelName(existing.name);
        setShareCode("");
      } catch (error) {
        console.error("[CreateLevelPage] failed to load level", error);
        if (!cancelled) {
          setSaveError(error instanceof Error ? error.message : "Failed to load level.");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingLevel(false);
        }
      }
    };

    void loadLevel();

    return () => {
      cancelled = true;
    };
  }, [levelId]);

  const commitGrid = (nextGrid: Tile[][]) => {
    setHistory((items) => [...items, cloneGrid(grid)]);
    setFuture([]);
    setGrid(nextGrid);
  };

  const createGrid = (selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty);
    setGrid(emptyGrid(difficultySizes[selectedDifficulty]));
    setHistory([]);
    setFuture([]);
    setShareCode("");
  };

  const createStarterGrid = (selectedDifficulty: Difficulty) => {
    const size = difficultySizes[selectedDifficulty];
    const nextGrid = emptyGrid(size);

    for (let index = 0; index < size; index++) {
      nextGrid[0][index] = "wall";
      nextGrid[size - 1][index] = "wall";
      nextGrid[index][0] = "wall";
      nextGrid[index][size - 1] = "wall";
    }

    nextGrid[1][1] = "player";
    nextGrid[size - 2][size - 2] = "exit";
    nextGrid[1][Math.min(size - 2, 3)] = "coin";
    nextGrid[Math.max(1, size - 3)][2] = "coin";

    if (size >= 8) {
      nextGrid[3][3] = "enemyHorizontal";
      nextGrid[size - 4][size - 3] = "movingHazardVertical";
    } else {
      nextGrid[2][size - 2] = "hazard";
    }

    setDifficulty(selectedDifficulty);
    setGrid(nextGrid);
    setHistory([]);
    setFuture([]);
    setShareCode("");

    if (!levelName.trim()) {
      setLevelName(`Starter ${selectedDifficulty}`);
    }
  };

  const handleGenerateStarter = () => {
    createStarterGrid(difficulty ?? "easy");
  };

  const handleTileSelect = (tile: Tile) => {
    setSelectedTile(tile);
  };

  const placeTile = (rowIndex: number, colIndex: number) => {
    if (!grid[rowIndex] || grid[rowIndex][colIndex] === selectedTile) {
      return;
    }

    const updatedGrid = cloneGrid(grid);

    if (selectedTile === "player" || selectedTile === "exit") {
      for (const row of updatedGrid) {
        const existingIndex = row.indexOf(selectedTile);

        if (existingIndex !== -1) {
          row[existingIndex] = "empty";
        }
      }
    }

    updatedGrid[rowIndex][colIndex] = selectedTile;
    commitGrid(updatedGrid);
  };

  const undo = () => {
    const previous = history.at(-1);

    if (!previous) return;

    setFuture((items) => [cloneGrid(grid), ...items]);
    setHistory((items) => items.slice(0, -1));
    setGrid(cloneGrid(previous));
  };

  const redo = () => {
    const next = future[0];

    if (!next) return;

    setHistory((items) => [...items, cloneGrid(grid)]);
    setFuture((items) => items.slice(1));
    setGrid(cloneGrid(next));
  };

  const getValidatedDraft = (): LevelDraft | null => {
    if (!validateLevel(levelName, grid, difficulty, setSaveError)) {
      return null;
    }

    if (!difficulty) return null;

    return {
      name: levelName.trim(),
      difficulty,
      width: grid.length,
      height: grid.length,
      grid,
    };
  };

  const handleValidateLevel = () => {
    if (getValidatedDraft()) {
      alert("Level looks playable.");
    }
  };

  const handleSaveLevel = async () => {
    const draft = getValidatedDraft();

    if (!draft) return;

    const id = await saveLevel(draft, levelId);

    alert(`Level saved! id: ${id}`);
    navigate(`/create/${id}`);
  };

  const handleExportJson = () => {
    const draft = getValidatedDraft();

    if (!draft) return;

    downloadFile(
      `${draft.difficulty}-level.json`,
      JSON.stringify(draft, null, 2),
      "application/json",
    );
  };

  const handleCopyLevelCode = async () => {
    const draft = getValidatedDraft();

    if (!draft) return;

    const code = encodeLevelCode(draft);
    setShareCode(code);

    try {
      await navigator.clipboard.writeText(code);
      alert("Level code copied.");
    } catch {
      alert("Level code generated. Copy it from the field.");
    }
  };

  const handleExportStandalone = () => {
    const draft = getValidatedDraft();

    if (!draft) return;

    downloadFile(
      `${draft.name || draft.difficulty}-playable.html`,
      buildStandaloneGameHtml(draft),
      "text/html",
    );
  };

  return (
    <div className="arcade-screen">
      <GlobalPageNavigation />
      <div className="arcade-shell grid min-h-[calc(100vh-2rem)] gap-5 lg:grid-cols-[340px_minmax(0,1fr)] sm:min-h-[calc(100vh-3rem)]">
        <div className="arcade-panel flex min-h-0 flex-col gap-5 p-4 lg:max-h-[calc(100vh-3rem)] lg:overflow-auto">
          {isLoadingLevel ? (
            <div className="arcade-chip text-cyan-200">Loading level...</div>
          ) : null}
          <div>
            <p className="arcade-kicker mb-2">Builder</p>
            <h1 className="font-mono text-3xl font-black uppercase text-yellow-300 drop-shadow-[3px_3px_0px_#000]">
              Create Level
            </h1>
          </div>

          <section className="space-y-2">
            <h3 className="arcade-section-label">Difficulty</h3>

            <DifficultySelector onSelect={createGrid} />

            {difficulty && (
              <div className="arcade-chip inline-flex bg-yellow-300 text-black">
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

          <section>
            <h3 className="arcade-section-label">Editor</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={undo}
                disabled={history.length === 0}
                className="arcade-button-cyan disabled:opacity-50"
              >
                Undo
              </button>
              <button
                onClick={redo}
                disabled={future.length === 0}
                className="arcade-button-cyan disabled:opacity-50"
              >
                Redo
              </button>
              <button onClick={handleGenerateStarter} className="arcade-button-orange">
                Starter
              </button>
              <button onClick={handleValidateLevel} className="arcade-button-lime">
                Validate
              </button>
            </div>
          </section>

          {shareCode && (
            <textarea
              readOnly
              value={shareCode}
              className="arcade-input min-h-24 text-xs"
            />
          )}

          <div className="mt-auto grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <button onClick={handleSaveLevel} className="arcade-button-lime w-full">
              Save Level
            </button>

            <button onClick={handleExportJson} className="arcade-button-violet w-full">
              Export JSON
            </button>

            <button onClick={handleCopyLevelCode} className="arcade-button-cyan w-full">
              Share Code
            </button>

            <button
              onClick={handleExportStandalone}
              className="arcade-button-yellow w-full"
            >
              Export Game
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
              <GridEditor grid={grid} onPaintCell={placeTile} />
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
