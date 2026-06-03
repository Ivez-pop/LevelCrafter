import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-[0.4em] text-indigo-300 mb-4">
            Welcome to LevelCrafter
          </p>
          <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight">
            LevelCrafter
          </h1>
          <p className="mt-5 text-slate-300 text-lg md:text-xl max-w-2xl mx-auto">
            Build, Save and Play Custom Puzzle Levels
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="group rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1 hover:border-indigo-400/30">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/20">
                <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-white">Create Mode</h2>
                <p className="mt-3 text-slate-300">
                  Design your own level using the level editor.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/create")}
              className="mt-8 inline-flex items-center justify-center rounded-2xl bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400"
            >
              Create Level
            </button>
          </div>

          <div className="group rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1 hover:border-cyan-400/30">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-cyan-500 text-white shadow-lg shadow-cyan-500/20">
                <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 4v16l15-8L5 4z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-white">Play Mode</h2>
                <p className="mt-3 text-slate-300">
                  Browse and play saved levels.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/play")}
              className="mt-8 inline-flex items-center justify-center rounded-2xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-cyan-400"
            >
              Play Levels
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
