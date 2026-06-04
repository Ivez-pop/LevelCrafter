import { Link } from "react-router-dom";

function RegisterPage() {
  return (
    <div className="arcade-screen flex items-center justify-center">
      <div className="arcade-panel w-full max-w-md p-8">
        <p className="arcade-kicker mb-2">New Player</p>

        <h1 className="mb-8 font-mono text-4xl font-black uppercase text-yellow-300">
          Register
        </h1>

        <div className="space-y-4">
          <input type="text" placeholder="Username" className="arcade-input" />

          <input type="email" placeholder="Email" className="arcade-input" />

          <input
            type="password"
            placeholder="Password"
            className="arcade-input"
          />

          <button className="arcade-button-lime w-full">Create Account</button>
        </div>

        <Link to="/login" className="mt-6 block text-center">
          <span className="arcade-button-cyan inline-block">Back To Login</span>
        </Link>
      </div>
    </div>
  );
}

export default RegisterPage;
