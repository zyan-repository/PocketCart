import { useState } from "react";
import PropTypes from "prop-types";
import { useAuth } from "../context/AuthContext.jsx";
import "./AuthPage.css";

function RegisterPage({ onSwitchToLogin, onBackToHome }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const result = await register(email, password, name);

    if (result.success) {
      setSuccess("Registration successful! You can now login.");
      setTimeout(() => onSwitchToLogin(), 2000);
    } else {
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
        <h2>Register</h2>
        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter your name"
            />
          </div>

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
              placeholder="Create a password"
              minLength={6}
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <button onClick={onSwitchToLogin} className="link-btn">
            Login
          </button>
        </p>
      </div>
    </div>
  );
}

RegisterPage.propTypes = {
  onSwitchToLogin: PropTypes.func.isRequired,
  onBackToHome: PropTypes.func.isRequired,
};

export default RegisterPage;
