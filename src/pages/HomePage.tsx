import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LogoutButton from "../components/LogoutButton";
import { TileArtwork } from "../features/tiles/TileArtwork";
import type { Tile } from "../types/level";

type HomeTab = "menu" | "tutorial";

const tutorialBoard: Tile[][] = [
  ["wall", "wall", "wall", "wall", "wall", "wall"],
  ["wall", "player", "empty", "coin", "movingFireHorizontal", "wall"],
  ["wall", "empty", "wall", "empty", "empty", "wall"],
  ["wall", "vent", "empty", "hazard", "exit", "wall"],
  ["wall", "empty", "coin", "movingFireVertical", "empty", "wall"],
  ["wall", "wall", "wall", "wall", "wall", "wall"],
];

const tileGuide: Array<{ tile: Tile; name: string; note: string }> = [
  { tile: "player", name: "Player", note: "Start here and reach the trophy." },
  { tile: "exit", name: "Exit", note: "Touch it to finish the level." },
  { tile: "coin", name: "Coin", note: "Collect these while solving the route." },
  { tile: "wall", name: "Wall", note: "Blocks players and moving hazards." },
  { tile: "hazard", name: "Bomb", note: "Touching danger restarts the run." },
  { tile: "vent", name: "Vent", note: "Jump between linked vents." },
  { tile: "movingFireHorizontal", name: "Fire H", note: "Sweeps left and right until blocked." },
  { tile: "movingFireVertical", name: "Fire V", note: "Sweeps up and down until blocked." },
];

const playSteps = [
  "Pick a difficulty, choose a saved level, then guide the player across the grid.",
  "Move one tile at a time. Walls block movement, while coins, vents, and exits can be entered.",
  "Avoid bombs, enemies, and moving fire. If a hazard touches you, the run ends.",
  "Reach the trophy exit to win. Fewer moves and faster clears make better scores.",
];

function HomePage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [activeTab, setActiveTab] = useState<HomeTab>("menu");

  return (
    <div className="arcade-screen flex items-start justify-center py-8 sm:py-10">
      <div className="arcade-shell">
        <div className="mb-6 text-center sm:mb-8">
          <p className="arcade-kicker mb-4">Welcome to</p>

          <h1 className="arcade-title text-5xl md:text-7xl">LevelCrafter</h1>

          <p className="mx-auto mt-5 max-w-2xl font-mono text-sm font-black uppercase leading-7 text-cyan-200 sm:text-base">
            Create, save, and play custom puzzle levels
          </p>
        </div>

        <div className="mx-auto mb-8 grid max-w-md grid-cols-2 gap-3">
          {(["menu", "tutorial"] as HomeTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`border-4 border-black px-4 py-3 font-mono text-sm font-black uppercase shadow-[5px_5px_0px_#000] transition-transform hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0px_#000] ${
                activeTab === tab
                  ? "bg-yellow-300 text-black"
                  : "bg-[#12122f] text-cyan-100 hover:bg-[#1b1b49]"
              }`}
            >
              {tab === "menu" ? "Main Menu" : "Tutorial"}
            </button>
          ))}
        </div>

        {activeTab === "menu" ? (
          <>
            <div className="grid gap-5 lg:grid-cols-2">
              <div
                className="
                  arcade-panel
                  p-5
                  transition-transform hover:-translate-y-1
                  sm:p-8
                "
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                  <div
                    className="
                      flex h-16 w-16 shrink-0 items-center justify-center
                      border-4 border-black
                      bg-rose-400
                      text-black
                      shadow-[5px_5px_0px_#000]
                    "
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-8 w-8"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </div>

                  <div>
                    <h2 className="font-mono text-3xl font-black uppercase text-yellow-300">
                      CREATE MODE
                    </h2>

                    <p className="mt-3 max-w-lg text-sm font-semibold leading-6 text-cyan-100 sm:text-base">
                      Design your own puzzle levels and save them locally.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/create")}
                  className="arcade-button-yellow mt-8 w-full sm:w-auto"
                >
                  CREATE LEVEL
                </button>
              </div>

              <div
                className="
                  arcade-panel
                  p-5
                  transition-transform hover:-translate-y-1
                  sm:p-8
                "
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                  <div
                    className="
                      flex h-16 w-16 shrink-0 items-center justify-center
                      border-4 border-black
                      bg-cyan-300
                      text-black
                      shadow-[5px_5px_0px_#000]
                    "
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-8 w-8"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 4v16l15-8L5 4z" />
                    </svg>
                  </div>

                  <div>
                    <h2 className="font-mono text-3xl font-black uppercase text-yellow-300">
                      PLAY MODE
                    </h2>

                    <p className="mt-3 max-w-lg text-sm font-semibold leading-6 text-cyan-100 sm:text-base">
                      Browse your saved levels and test your puzzle-solving skills.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/play")}
                  className="arcade-button-cyan mt-8 w-full sm:w-auto"
                >
                  PLAY LEVELS
                </button>
              </div>
            </div>

            <div className="mt-8 text-center sm:mt-10">
              <p className="font-mono text-xs font-black uppercase tracking-[0.25em] text-yellow-200">
                Build / Create / Play
              </p>

              <div className="mt-6 flex justify-center">
                {session ? (
                  <div className="flex flex-wrap justify-center gap-4">
                    <button
                      onClick={() => navigate("/global-leaderboard")}
                      className="arcade-button-yellow"
                    >
                      Global Leaderboard
                    </button>

                    <button
                      onClick={() => navigate("/profile")}
                      className="arcade-button-violet"
                    >
                      My Profile
                    </button>

                    <LogoutButton />
                  </div>
                ) : (
                  <div className="flex flex-wrap justify-center gap-4">
                    <button
                      onClick={() => navigate("/login")}
                      className="arcade-button-cyan"
                    >
                      Login
                    </button>

                    <button
                      onClick={() => navigate("/register")}
                      className="arcade-button-yellow"
                    >
                      Register
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
            <section className="arcade-panel p-4 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="arcade-kicker mb-2">Player Guide</p>
                  <h2 className="font-mono text-3xl font-black uppercase text-yellow-300">
                    How To Play
                  </h2>
                </div>

                <button onClick={() => navigate("/play")} className="arcade-button-cyan">
                  Start Playing
                </button>
              </div>

              <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
                <div className="arcade-panel-deep overflow-auto p-3">
                  <div className="mx-auto grid w-max grid-cols-6 gap-0 border-4 border-black bg-black">
                    {tutorialBoard.flatMap((row, rowIndex) =>
                      row.map((tile, colIndex) => (
                        <div
                          key={`${rowIndex}-${colIndex}`}
                          className="arcade-tile relative h-12 w-12 sm:h-14 sm:w-14"
                        >
                          <TileArtwork
                            tile={tile}
                            className="h-full w-full"
                            imageClassName={
                              tile === "movingFireHorizontal" || tile === "movingFireVertical"
                                ? "p-0"
                                : "p-0.5"
                            }
                          />
                          {tile === "movingFireHorizontal" ? (
                            <div className="absolute inset-x-1 bottom-1 z-20 h-1 bg-yellow-300 shadow-[2px_2px_0px_#000]" />
                          ) : null}
                          {tile === "movingFireVertical" ? (
                            <div className="absolute bottom-1 right-1 top-1 z-20 w-1 bg-yellow-300 shadow-[2px_2px_0px_#000]" />
                          ) : null}
                        </div>
                      )),
                    )}
                  </div>
                </div>

                <div className="grid content-start gap-3">
                  {playSteps.map((step, index) => (
                    <div key={step} className="arcade-chip text-left text-cyan-100">
                      <span className="mr-2 text-yellow-300">{index + 1}.</span>
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="arcade-panel p-4 sm:p-6">
              <p className="arcade-kicker mb-2">Tile Decoder</p>
              <h2 className="font-mono text-2xl font-black uppercase text-yellow-300">
                Board Icons
              </h2>

              <div className="mt-5 grid gap-3">
                {tileGuide.map((item) => (
                  <div
                    key={item.name}
                    className="grid grid-cols-[48px_minmax(0,1fr)] gap-3 border-2 border-black bg-[#12122f] p-2 shadow-[3px_3px_0px_#000]"
                  >
                    <TileArtwork tile={item.tile} className="h-12 w-12 border-2 border-black" />
                    <div className="min-w-0">
                      <h3 className="font-mono text-sm font-black uppercase text-yellow-200">
                        {item.name}
                      </h3>
                      <p className="mt-1 text-xs font-semibold leading-5 text-cyan-100">
                        {item.note}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;
