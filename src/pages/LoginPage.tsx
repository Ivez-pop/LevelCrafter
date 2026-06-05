import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import GlobalPageNavigation from "../components/GlobalPageNavigation";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
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
    <div className="arcade-screen flex items-center justify-center">
      <GlobalPageNavigation />
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
  );
}

export default LoginPage;
