import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";

function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleRegister = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Account created successfully!");

    navigate("/login");
  };

  return (
    <div className="arcade-screen flex items-center justify-center">
      <div className="arcade-panel w-full max-w-md p-8">
        <p className="arcade-kicker mb-2">New Player</p>

        <h1 className="mb-8 font-mono text-4xl font-black uppercase text-yellow-300">
          Register
        </h1>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="arcade-input"
          />

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

          <button
            onClick={handleRegister}
            className="arcade-button-lime w-full"
          >
            Create Account
          </button>
        </div>

        <Link to="/login" className="mt-6 block text-center">
          <span className="arcade-button-cyan inline-block">
            Back To Login
          </span>
        </Link>
      </div>
    </div>
  );
}

export default RegisterPage;