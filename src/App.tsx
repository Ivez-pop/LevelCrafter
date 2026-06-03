import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CreateLevelPage from "./pages/CreateLevelPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<CreateLevelPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
