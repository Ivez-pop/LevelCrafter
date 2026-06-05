import { useLocation, useNavigate } from "react-router-dom";

function GlobalPageNavigation() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const excludedPaths = ["/", "/profile" , "/global-leaderboard"];

  if (excludedPaths.includes(pathname)) {
    return null;
  }
  
  return (
    <div className="pointer-events-none fixed left-4 top-4 z-50 flex flex-wrap justify-start gap-3 sm:left-6 sm:top-6">
      <button
        onClick={() => navigate("/")}
        className="arcade-button-cyan pointer-events-auto px-4 py-2 text-xs sm:text-sm"
      >
        Home
      </button>

      <button
        onClick={() => navigate("/profile")}
        className="arcade-button-violet pointer-events-auto px-4 py-2 text-xs sm:text-sm"
      >
        Profile
      </button>
    </div>
  );
}

export default GlobalPageNavigation;
