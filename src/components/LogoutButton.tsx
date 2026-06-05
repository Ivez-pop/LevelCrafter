import { getSupabaseClient } from "../lib/supabase";

function LogoutButton() {
  const handleLogout = async () => {
    const supabase = getSupabaseClient();

    await supabase.auth.signOut();

    alert("Logged out!");
  };

  return (
    <button onClick={handleLogout} className="arcade-button-rose">
      Logout
    </button>
  );
}

export default LogoutButton;
