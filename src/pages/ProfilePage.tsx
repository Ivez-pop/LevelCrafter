import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSupabaseClient } from "../lib/supabase";
import { getProfileDashboard, updatePlayerAvatar, updateUsername } from "../services/profileService";
import type { ProfileDashboardData } from "../services/profileService";
import { deleteLevel } from "../services/levelStorage";
import { PlayerAvatar } from "../features/playerAvatar/PlayerAvatar";
import {
  defaultPlayerAvatarId,
  getPlayerAvatarOption,
  playerAvatarOptions,
  type PlayerAvatarId,
} from "../features/playerAvatar/avatarOptions";

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
  const [selectedAvatarId, setSelectedAvatarId] = useState<PlayerAvatarId | "player">(
    defaultPlayerAvatarId,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const [isDeletingMap, setIsDeletingMap] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const supabase = getSupabaseClient();

  const loadProfile = async () => {
    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const data = await getProfileDashboard();
      setProfile(data);
      setUsername(data.username);
      setSelectedAvatarId(data.playerAvatarId);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "Failed to load profile.";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarSave = async () => {
    setIsSavingAvatar(true);
    setError("");
    setSuccessMessage("");

    try {
      await updatePlayerAvatar(selectedAvatarId);
      await loadProfile();
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "Failed to update character.";

      setError(message);
    } finally {
      setIsSavingAvatar(false);
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
    setSuccessMessage("");

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

  const handleDeleteClick = (level: { id: string; name: string }) => {
    setDeleteTarget(level);
    setError("");
    setSuccessMessage("");
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    setIsDeletingMap(true);
    setError("");

    try {
      await deleteLevel(deleteTarget.id);
      setProfile((current) =>
        current
          ? {
              ...current,
              createdMaps: current.createdMaps.filter((level) => level.id !== deleteTarget.id),
            }
          : current,
      );
      setDeleteTarget(null);
      setSuccessMessage("Map deleted successfully.");
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to delete level.";

      setError(
        message === "Level not found or you do not have permission to delete it."
          ? "Permission denied."
          : message,
      );
    } finally {
      setIsDeletingMap(false);
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

        {successMessage ? (
          <div className="arcade-panel mb-6 p-4">
            <p className="font-mono text-sm font-black uppercase text-lime-300">
              {successMessage}
            </p>
          </div>
        ) : null}

        {profile ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <div className="space-y-6">
              <div className="arcade-panel p-6">
                <h2 className="arcade-section-label">User Identity</h2>

                <div className="mt-4 grid gap-4 sm:grid-cols-[120px_minmax(0,1fr)]">
                  <div className="arcade-panel-deep mx-auto h-28 w-28 p-2">
                    <PlayerAvatar
                      avatarId={profile.playerAvatarId}
                      className="drop-shadow-[4px_4px_0px_#000]"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="arcade-chip bg-cyan-300 text-black">
                      Username: {profile.username}
                    </div>

                    <div className="arcade-chip bg-yellow-300 text-black">
                      Character: {getPlayerAvatarOption(profile.playerAvatarId).name}
                    </div>

                    <div className="arcade-chip bg-orange-300 text-black">
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
                <h2 className="arcade-section-label">Edit Character</h2>

                <div className="mt-4 grid gap-5">
                  <div className="arcade-panel-deep mx-auto h-36 w-36 p-3">
                    <PlayerAvatar
                      avatarId={selectedAvatarId}
                      className="drop-shadow-[5px_5px_0px_#000]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {playerAvatarOptions.map((avatar) => {
                      const isSelected = selectedAvatarId === avatar.id;

                      return (
                        <button
                          key={avatar.id}
                          onClick={() => setSelectedAvatarId(avatar.id)}
                          className={`border-4 border-black p-2 text-left shadow-[4px_4px_0px_#000] transition-transform hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0px_#000] ${
                            isSelected
                              ? "bg-yellow-300 text-black"
                              : "bg-[#12122f] text-cyan-100 hover:bg-[#1b1b49]"
                          }`}
                        >
                          <div className="mx-auto h-16 w-16">
                            <PlayerAvatar avatarId={avatar.id} />
                          </div>

                          <div className="mt-2 text-center font-mono text-[10px] font-black uppercase leading-4">
                            {avatar.name}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setSelectedAvatarId(defaultPlayerAvatarId)}
                    className={`border-4 border-black px-4 py-3 font-mono text-sm font-black uppercase shadow-[4px_4px_0px_#000] transition-transform hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0px_#000] ${
                      selectedAvatarId === defaultPlayerAvatarId
                        ? "bg-yellow-300 text-black"
                        : "bg-[#12122f] text-cyan-100 hover:bg-[#1b1b49]"
                    }`}
                  >
                    Set Default Character
                  </button>

                  <button
                    onClick={handleAvatarSave}
                    disabled={isSavingAvatar || selectedAvatarId === profile.playerAvatarId}
                    className="arcade-button-orange w-full disabled:opacity-60"
                  >
                    {isSavingAvatar ? "Saving..." : "Save Character"}
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
                        <div className="mt-4 flex flex-wrap gap-3">
                          <button
                            onClick={() => handleDeleteClick({ id: level.id, name: level.name })}
                            className="arcade-button-rose px-4 py-2 text-xs"
                          >
                            Delete
                          </button>
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

        {deleteTarget ? (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4">
            <div className="arcade-panel w-full max-w-xl p-5 sm:p-6">
              <h2 className="arcade-section-label">Confirm Delete</h2>
              <p className="font-mono text-2xl font-black uppercase text-yellow-300 drop-shadow-[3px_3px_0px_#000]">
                Delete this map permanently?
              </p>
              <p className="mt-3 font-mono text-sm font-bold uppercase leading-6 text-cyan-200">
                "{deleteTarget.name}" will be removed from your saved maps.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="arcade-button-cyan w-full"
                  disabled={isDeletingMap}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="arcade-button-rose w-full disabled:opacity-50"
                  disabled={isDeletingMap}
                >
                  {isDeletingMap ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default ProfilePage;
