import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getSupabaseClient } from "../lib/supabase";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    const supabase = getSupabaseClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Login successful!");

    navigate("/profile");
  };

  return (
    <div className="arcade-screen flex min-h-screen flex-col">
      <div className="flex justify-end gap-3 p-4 sm:p-6">
        <button onClick={() => navigate("/")} className="arcade-button-cyan">HOME</button>
        <button onClick={() => navigate("/profile")} className="arcade-button-violet">PROFILE</button>
      </div>
      <div className="flex flex-grow items-center justify-center p-4">
        <div className="arcade-panel w-full max-w-md p-8">
        <p className="arcade-kicker mb-2">Account Access</p>

        <h1 className="mb-8 font-mono text-4xl font-black uppercase text-yellow-300">
          Login
        </h1>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="arcade-input"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="arcade-input"
          />

          <button onClick={handleLogin} className="arcade-button-cyan w-full">
            Login
          </button>
        </div>

        <p className="mt-6 text-center font-mono text-sm font-bold uppercase text-cyan-200">
          No account?
        </p>

        <Link to="/register" className="mt-3 block text-center">
          <span className="arcade-button-yellow inline-block">Register</span>
        </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
