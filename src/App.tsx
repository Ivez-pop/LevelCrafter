import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CreateLevelPage from "./pages/CreateLevelPage";
import PlayPage from "./pages/PlayPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import GlobalLeaderboardPage from "./pages/GlobalLeaderboardPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { ThemeSelector } from "./shared/components/ThemeSelector";
import { RetroAudioController } from "./components/RetroAudioController";

function ConditionalThemeSelector() {
  const location = useLocation();
  // Theme selection is a home-screen affordance; hiding it elsewhere keeps play
  // and editor screens focused on their primary controls.
  if (location.pathname !== "/") {
    return null;
  }
  return <ThemeSelector />;
}

function App() {
  return (
    <BrowserRouter>
      {/* Mount once inside the router so audio can follow route changes. */}
      <RetroAudioController />
      <ConditionalThemeSelector />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<CreateLevelPage />} />
        <Route path="/create/:levelId" element={<CreateLevelPage />} />
        <Route path="/play" element={<PlayPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/global-leaderboard" element={<GlobalLeaderboardPage />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
