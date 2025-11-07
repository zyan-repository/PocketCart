import { useState } from "react";
import ShoppingListPage from "./pages/ShoppingListPage.jsx";
import ShoppingTripPage from "./pages/ShoppingTripPage.jsx";
import SpendingHistoryPage from "./pages/SpendingHistoryPage.jsx";
import "./App.css";

function App() {
  const [currentView, setCurrentView] = useState("lists");

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
        <h1>PocketCart</h1>
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

export default App;
