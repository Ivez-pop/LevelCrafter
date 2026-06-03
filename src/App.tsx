import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CreateLevelPage from "./pages/CreateLevelPage";
import PlayPage from "./pages/PlayPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<CreateLevelPage />} />
        <Route path="/play" element={<PlayPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;