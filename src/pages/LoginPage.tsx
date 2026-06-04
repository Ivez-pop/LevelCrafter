import { Link } from "react-router-dom";

function LoginPage() {
  return (
    <div className="arcade-screen flex items-center justify-center">
      <div className="arcade-panel w-full max-w-md p-8">
        <p className="arcade-kicker mb-2">Account Access</p>

        <h1 className="mb-8 font-mono text-4xl font-black uppercase text-yellow-300">
          Login
        </h1>

        <div className="space-y-4">
          <input type="email" placeholder="Email" className="arcade-input" />

          <input
            type="password"
            placeholder="Password"
            className="arcade-input"
          />

          <button className="arcade-button-cyan w-full">Login</button>
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
