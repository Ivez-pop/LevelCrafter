import { useLocation, useNavigate } from "react-router-dom";

function GlobalPageNavigation() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (pathname === "/" || pathname === "/profile" || pathname === "/global-leaderboard") {
    return null;
  }

  return (
    <div className="pointer-events-none fixed left-4 top-4 z-50 flex items-center justify-end gap-3 sm:left-6 sm:top-6">
      <button
        onClick={() => navigate("/")}
        className="pointer-events-auto arcade-button-cyan px-4 py-2 text-xs sm:text-sm"
      >
        Home
      </button>

      <button
        onClick={() => navigate("/profile")}
        className="pointer-events-auto arcade-button-violet px-4 py-2 text-xs sm:text-sm"
      >
        Profile
      </button>
    </div>
  );
}

export default GlobalPageNavigation;
