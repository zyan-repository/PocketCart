import { useState } from "react";
import PropTypes from "prop-types";
import { useAuth } from "../context/AuthContext.jsx";
import "./AuthPage.css";

function LoginPage({ onSwitchToRegister, onBackToHome }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email, password);

    if (!result.success) {
      setError(result.message);
    }
    setLoading(false);
  }

  return (
    <div className="auth-container">
      <button onClick={onBackToHome} className="back-home-btn">
        ← Back to Home
      </button>
      <div className="auth-card">
        <h2>Login</h2>
        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="auth-switch">
          Don&apos;t have an account?{" "}
          <button onClick={onSwitchToRegister} className="link-btn">
            Register
          </button>
        </p>
      </div>
    </div>
  );
}

LoginPage.propTypes = {
  onSwitchToRegister: PropTypes.func.isRequired,
  onBackToHome: PropTypes.func.isRequired,
};

export default LoginPage;
