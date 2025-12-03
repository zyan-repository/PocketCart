import PropTypes from "prop-types";
import "./HomePage.css";

function HomePage({ onLogin, onRegister }) {
  return (
    <div className="home-container">
      <div className="home-content">
        <div className="home-hero">
          <h1>Welcome to PocketCart</h1>
          <p className="home-subtitle">
            Your Smart Shopping & Budgeting Assistant
          </p>
        </div>

        <div className="home-features">
          <div className="feature-card">
            <span className="feature-icon">📝</span>
            <h3>Shopping Lists</h3>
            <p>Create and manage your shopping lists with ease</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🛒</span>
            <h3>Shopping Trips</h3>
            <p>Track your spending in real-time while shopping</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">📊</span>
            <h3>Spending History</h3>
            <p>View your spending history and stay on budget</p>
          </div>
        </div>

        <div className="home-actions">
          <button onClick={onLogin} className="home-btn home-btn-primary">
            Login
          </button>
          <button onClick={onRegister} className="home-btn home-btn-secondary">
            Register
          </button>
        </div>
      </div>
    </div>
  );
}

HomePage.propTypes = {
  onLogin: PropTypes.func.isRequired,
  onRegister: PropTypes.func.isRequired,
};

export default HomePage;
