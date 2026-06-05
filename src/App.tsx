import { BrowserRouter, Routes, Route } from "react-router-dom";
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

function App() {
  return (
    <BrowserRouter>
      <RetroAudioController />
      <ThemeSelector />
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
