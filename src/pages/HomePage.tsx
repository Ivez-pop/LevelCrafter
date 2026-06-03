import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-10 text-center shadow-2xl">
        <h1 className="text-6xl font-extrabold text-white mb-3">
          LevelCrafter
        </h1>

        <p className="text-slate-300 mb-8">Design it. Save it. Play it.</p>

        <button
          onClick={() => navigate("/create")}
          className="w-full rounded-xl bg-indigo-600 px-6 py-4 text-lg font-semibold text-white transition hover:bg-indigo-500"
        >
          Create Level
        </button>
      </div>
    </div>
  );
}

export default HomePage;
