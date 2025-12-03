import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import ShoppingListPage from "./pages/ShoppingListPage.jsx";
import ShoppingTripPage from "./pages/ShoppingTripPage.jsx";
import SpendingHistoryPage from "./pages/SpendingHistoryPage.jsx";
import "./App.css";

function AppContent() {
  const { user, loading, logout } = useAuth();
  const [currentView, setCurrentView] = useState("lists");
  const [authView, setAuthView] = useState("home");

  if (loading) {
    return (
      <div className="app loading-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    if (authView === "login") {
      return (
        <LoginPage
          onSwitchToRegister={() => setAuthView("register")}
          onBackToHome={() => setAuthView("home")}
        />
      );
    }
    if (authView === "register") {
      return (
        <RegisterPage
          onSwitchToLogin={() => setAuthView("login")}
          onBackToHome={() => setAuthView("home")}
        />
      );
    }
    return (
      <HomePage
        onLogin={() => setAuthView("login")}
        onRegister={() => setAuthView("register")}
      />
    );
  }

  function renderCurrentView() {
    switch (currentView) {
      case "lists":
        return <ShoppingListPage />;
      case "trip":
        return <ShoppingTripPage />;
      case "history":
        return <SpendingHistoryPage />;
      default:
        return <ShoppingListPage />;
    }
  }

  return (
    <div className="app">
      <header>
        <div className="header-top">
          <h1>PocketCart</h1>
          <div className="user-info">
            <span>Welcome, {user.name}</span>
            <button onClick={logout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
        <nav>
          <button onClick={() => setCurrentView("lists")}>Lists</button>
          <button onClick={() => setCurrentView("trip")}>Trip</button>
          <button onClick={() => setCurrentView("history")}>History</button>
        </nav>
      </header>
      <main>{renderCurrentView()}</main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
