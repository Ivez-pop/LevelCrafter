import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DifficultySelector from "../shared/components/DifficultySelector";
import GridEditor from "../features/editor/components/GridEditor";
import TilePalette from "../features/editor/components/TilePalette";
import type { Level, Tile } from "../types/level";
import { encodeLevelCode, getLevelById, getLevelsByOwner, saveLevel } from "../services/levelStorage";
import { getAuthenticatedUser, publishCreatedLevel } from "../services/profileService";
import { validateLevel } from "../services/levelValidation";
import { buildStandaloneGameHtml } from "../services/standaloneExport";
import { difficultySizes, type Difficulty } from "../constants/difficulty";

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
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [grid, setGrid] = useState<Tile[][]>([]);
  const [history, setHistory] = useState<Tile[][][]>([]);
  const [future, setFuture] = useState<Tile[][][]>([]);
  const [levelName, setLevelName] = useState("");
  const [saveError, setSaveError] = useState("");
  const [selectedTile, setSelectedTile] = useState<Tile>("wall");
  const [shareCode, setShareCode] = useState("");
  const [editingLevelId, setEditingLevelId] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importError, setImportError] = useState("");
  const [importLoading, setImportLoading] = useState(false);
  const [ownedLevels, setOwnedLevels] = useState<Array<{ id: string; name: string; difficulty: Difficulty; createdAt: number }>>([]);

  const navigate = useNavigate();

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
    setEditingLevelId(null);
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
    setEditingLevelId(null);

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

    const id = await saveLevel(draft, editingLevelId ?? undefined);
    setEditingLevelId(id);

    void publishCreatedLevel({
      id,
      ...draft,
      createdAt: Date.now(),
    }).catch((error: unknown) => {
      console.error("[CreateLevelPage] failed to publish created level", error);
    });

    alert(`Level saved! id: ${id}`);
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

  const openImportModal = async () => {
    setImportError("");
    setShowImportModal(true);
    setImportLoading(true);

    try {
      const user = await getAuthenticatedUser();
      const levels = await getLevelsByOwner(user.id);
      setOwnedLevels(levels);
    } catch (error) {
      console.error("[CreateLevelPage] failed to load owned levels", error);
      setImportError(error instanceof Error ? error.message : "Failed to load your saved levels.");
      setOwnedLevels([]);
    } finally {
      setImportLoading(false);
    }
  };

  const importLevelIntoEditor = async (levelId: string) => {
    setImportError("");

    try {
      const ownedLevel = ownedLevels.find((item) => item.id === levelId);

      if (!ownedLevel) {
        throw new Error("That level is not available in your saved maps.");
      }

      const level = await getLevelById(levelId);

      if (!level) {
        throw new Error("That level no longer exists.");
      }

      setDifficulty(level.difficulty);
      setGrid(level.grid.map((row) => [...row]));
      setHistory([]);
      setFuture([]);
      setLevelName(level.name);
      setEditingLevelId(level.id);
      setShowImportModal(false);
    } catch (error) {
      console.error("[CreateLevelPage] failed to import level", error);
      setImportError(error instanceof Error ? error.message : "Failed to import the selected level.");
    }
  };

  return (
    <div className="arcade-screen relative min-h-screen">
      <div className="absolute right-4 top-2 z-50 flex gap-3">
        <button onClick={() => navigate("/")} className="arcade-button-cyan">HOME</button>
        <button onClick={() => navigate("/profile")} className="arcade-button-violet">PROFILE</button>
      </div>
      <div className="arcade-shell grid min-h-[calc(100vh-2rem)] gap-5 lg:grid-cols-[340px_minmax(0,1fr)] sm:min-h-[calc(100vh-3rem)]">
        <div className="arcade-panel flex min-h-0 flex-col gap-5 p-4 lg:max-h-[calc(100vh-3rem)] lg:overflow-auto">
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
            {grid.length > 0 && (
              <button onClick={handleSaveLevel} className="arcade-button-lime w-full">
                Save Level
              </button>
            )}

            <button onClick={openImportModal} className="arcade-button-orange w-full">
              Import Saved Level
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

            <button onClick={() => navigate("/play")} className="arcade-button-orange w-full">
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

      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="arcade-panel w-full max-w-3xl p-4 sm:p-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="arcade-kicker mb-2">Load Saved Map</p>
                <h2 className="font-mono text-2xl font-black uppercase text-yellow-300 drop-shadow-[3px_3px_0px_#000]">
                  Import Saved Level
                </h2>
              </div>
              <button onClick={() => setShowImportModal(false)} className="arcade-button-cyan">
                Close
              </button>
            </div>

            {importError && (
              <p className="mb-4 border-2 border-black bg-rose-500 px-3 py-2 font-mono text-xs font-black uppercase text-white shadow-[3px_3px_0px_#000]">
                {importError}
              </p>
            )}

            {importLoading ? (
              <div className="arcade-panel-deep p-6 text-center font-mono text-sm font-black uppercase text-cyan-200">
                Loading your saved levels...
              </div>
            ) : ownedLevels.length === 0 ? (
              <div className="arcade-panel-deep p-6 text-center font-mono text-sm font-black uppercase text-cyan-200">
                You haven't created any levels yet.
              </div>
            ) : (
              <div className="max-h-[60vh] overflow-auto">
                <div className="grid gap-3">
                  {ownedLevels.map((level) => (
                    <button
                      key={level.id}
                      onClick={() => importLevelIntoEditor(level.id)}
                      className="arcade-panel-deep flex items-center justify-between gap-4 p-4 text-left transition-transform hover:-translate-y-0.5"
                    >
                      <div>
                        <div className="font-mono text-lg font-black uppercase text-yellow-300">
                          {level.name}
                        </div>
                        <div className="font-mono text-xs font-bold uppercase text-cyan-200">
                          {level.difficulty} • {new Date(level.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="arcade-chip bg-lime-300 text-black">Import</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateLevelPage;
