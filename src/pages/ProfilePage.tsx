import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import { useAuth } from "../context/AuthContext";

function ProfilePage() {
  const { session } = useAuth();

  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();

    navigate("/login");
  };

  return (
    <div className="arcade-screen flex items-center justify-center">
      <div className="arcade-panel w-full max-w-3xl p-8">
        <p className="arcade-kicker mb-2">Player Profile</p>

        <h1 className="mb-8 font-mono text-4xl font-black uppercase text-yellow-300">
          Profile
        </h1>

        <div className="space-y-4">
          <div className="arcade-chip bg-cyan-300 text-black">
            Email: {session?.user.email}
          </div>

          <div className="arcade-chip break-all bg-violet-300 text-black">
            User ID: {session?.user.id}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <button
            onClick={() => navigate("/")}
            className="arcade-button-cyan"
          >
            Home
          </button>

          <button
            onClick={handleLogout}
            className="arcade-button-rose"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;