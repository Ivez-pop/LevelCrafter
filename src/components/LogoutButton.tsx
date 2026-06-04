import { supabase } from "../services/supabase";

function LogoutButton() {
  const handleLogout = async () => {
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
