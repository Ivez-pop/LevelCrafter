import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LogoutButton from "../components/LogoutButton";

function HomePage() {
  const navigate = useNavigate();
  const { session } = useAuth();

  return (
    <div className="arcade-screen flex items-center justify-center">
      <div className="arcade-shell">
        <div className="mb-10 text-center sm:mb-12">
          <p className="arcade-kicker mb-4">Welcome to</p>

          <h1 className="arcade-title text-5xl md:text-7xl">LevelCrafter</h1>

          <p className="mx-auto mt-5 max-w-2xl font-mono text-sm font-black uppercase leading-7 text-cyan-200 sm:text-base">
            Create, save, and play custom puzzle levels
          </p>
        </div>

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
      </div>
    </div>
  );
}

export default HomePage;
