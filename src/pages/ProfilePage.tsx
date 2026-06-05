import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import { getProfileDashboard, updateUsername } from "../services/profileService";
import type { ProfileDashboardData } from "../services/profileService";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");

  return `${minutes}:${seconds}`;
}

function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileDashboardData | null>(null);
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const loadProfile = async () => {
    setIsLoading(true);
    setError("");

    try {
      const data = await getProfileDashboard();
      setProfile(data);
      setUsername(data.username);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "Failed to load profile.";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();

    navigate("/login");
  };

  const handleUsernameSave = async () => {
    const nextUsername = username.trim();

    if (!nextUsername) {
      setError("Username cannot be empty.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      await updateUsername(nextUsername);
      await loadProfile();
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "Failed to update username.";

      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="arcade-screen flex items-center justify-center">
        <div className="arcade-panel w-full max-w-4xl p-8 text-center">
          <p className="font-mono text-xl font-black uppercase text-lime-300">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="arcade-screen">
      <div className="arcade-shell">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="arcade-kicker mb-2">Player Dashboard</p>
            <h1 className="arcade-title text-4xl md:text-6xl">Profile</h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <button onClick={() => navigate("/global-leaderboard")} className="arcade-button-yellow">
              Global Leaderboard
            </button>

            <button onClick={() => navigate("/")} className="arcade-button-cyan">
              HOME
            </button>

            <button onClick={handleLogout} className="arcade-button-rose">
              LOGOUT
            </button>
          </div>
        </div>

        {error ? (
          <div className="arcade-panel mb-6 p-4">
            <p className="font-mono text-sm font-black uppercase text-rose-300">
              {error}
            </p>
          </div>
        ) : null}

        {profile ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <div className="space-y-6">
              <div className="arcade-panel p-6">
                <h2 className="arcade-section-label">User Identity</h2>

                <div className="mt-4 space-y-3">
                  <div className="arcade-chip bg-cyan-300 text-black">
                    Username: {profile.username}
                  </div>

                  <div className="arcade-chip bg-yellow-300 text-black">
                    Email: {profile.email}
                  </div>

                  <div className="arcade-chip bg-violet-300 text-black">
                    Join Date: {formatDate(profile.joinDate)}
                  </div>

                  <div className="arcade-chip bg-lime-300 text-black">
                    Global Rank: {profile.globalRank ?? "Unranked"}
                  </div>
                </div>
              </div>

              <div className="arcade-panel p-6">
                <h2 className="arcade-section-label">Edit Username</h2>

                <div className="mt-4 space-y-3">
                  <input
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    className="arcade-input"
                    placeholder="Enter new username"
                  />

                  <button
                    onClick={handleUsernameSave}
                    disabled={isSaving}
                    className="arcade-button-lime w-full disabled:opacity-60"
                  >
                    {isSaving ? "Saving..." : "Save Username"}
                  </button>
                </div>
              </div>

              <div className="arcade-panel p-6">
                <h2 className="arcade-section-label">Statistics</h2>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="arcade-chip text-cyan-200">
                    Created Maps: {profile.createdMaps.length}
                  </div>

                  <div className="arcade-chip text-cyan-200">
                    Play History: {profile.playHistory.length}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="arcade-panel p-6">
                <h2 className="arcade-section-label">Created Maps</h2>

                <div className="mt-4 grid gap-3">
                  {profile.createdMaps.length === 0 ? (
                    <p className="arcade-chip text-cyan-200">No created maps yet.</p>
                  ) : (
                    profile.createdMaps.map((level) => (
                      <div
                        key={level.id}
                        className="border-4 border-black bg-[#12122f] px-4 py-3 shadow-[5px_5px_0px_#000]"
                      >
                        <div className="font-mono text-lg font-black uppercase text-yellow-300">
                          {level.name}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-3 text-xs font-bold uppercase text-cyan-200">
                          <span>Difficulty: {level.difficulty}</span>
                          <span>Created: {formatDate(level.created_at)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="arcade-panel p-6">
                <h2 className="arcade-section-label">Play History</h2>

                <div className="mt-4 grid gap-3">
                  {profile.playHistory.length === 0 ? (
                    <p className="arcade-chip text-cyan-200">No play history yet.</p>
                  ) : (
                    profile.playHistory.map((run) => (
                      <div
                        key={run.id}
                        className="border-4 border-black bg-[#12122f] px-4 py-3 shadow-[5px_5px_0px_#000]"
                      >
                        <div className="font-mono text-lg font-black uppercase text-yellow-300">
                          {run.levels?.name ?? run.level_id}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-3 text-xs font-bold uppercase text-cyan-200">
                          <span>Score: {run.score}</span>
                          <span>Time: {formatTime(run.time_seconds)}</span>
                          <span>Moves: {run.moves}</span>
                          <span>Completed: {formatDate(run.completed_at)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default ProfilePage;
