import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { fetchAPI } from "../services/api.js";
import ErrorDisplay from "../components/ErrorDisplay.jsx";
import Loading from "../components/Loading.jsx";
import EmptyState from "../components/EmptyState.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import "./ShoppingTripPage.css";

function ShoppingTripPage() {
  const [trip, setTrip] = useState(null);
  const [budget, setBudget] = useState(() => {
    const saved = localStorage.getItem("pocketcart_budget");
    return saved ? parseFloat(saved) : 0;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [budgetInput, setBudgetInput] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("1");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    initializeTrip();
  }, []);

  useEffect(() => {
    if (budget > 0) {
      localStorage.setItem("pocketcart_budget", budget.toString());
    }
  }, [budget]);

  function calculateTotal() {
    if (!trip || !trip.items) {
      return 0;
    }
    return trip.items
      .filter((item) => item.checked && item.price && item.quantity)
      .reduce((acc, item) => {
        const price = parseFloat(item.price || 0);
        const quantity = parseFloat(item.quantity || 1);
        return acc + price * quantity;
      }, 0);
  }

  async function initializeTrip() {
    setLoading(true);
    setError("");
    try {
      const trips = await fetchAPI("/api/shopping-trips");
      if (trips && trips.length > 0) {
        setTrip(trips[0]);
      } else {
        const newTrip = await fetchAPI("/api/shopping-trips", {
          method: "POST",
          body: {
            items: [],
            tripDate: new Date().toISOString(),
          },
        });
        setTrip(newTrip);
      }
    } catch (err) {
      setError(err.message || "Failed to initialize trip");
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckItem(itemId, checked) {
    if (!trip || !trip.items) return;
    const updatedItems = trip.items.map((item) =>
      item.itemId === itemId ? { ...item, checked } : item,
    );

    setTrip((prevTrip) => ({
      ...prevTrip,
      items: updatedItems,
    }));

    try {
      await fetchAPI(`/api/shopping-trips/${trip._id}`, {
        method: "PUT",
        body: { items: updatedItems },
      });
      const freshTrip = await fetchAPI(`/api/shopping-trips/${trip._id}`);
      if (freshTrip && freshTrip.items) {
        setTrip(freshTrip);
      }
    } catch (err) {
      setError(err.message || "Failed to update item");
    }
  }

  async function handleUpdateItemPrice(itemId, price) {
    if (!trip || !trip.items) return;
    const updatedItems = trip.items.map((item) =>
      item.itemId === itemId
        ? { ...item, price: parseFloat(price) || 0, checked: true }
        : item,
    );

    setTrip((prevTrip) => ({
      ...prevTrip,
      items: updatedItems,
    }));

    try {
      await fetchAPI(`/api/shopping-trips/${trip._id}`, {
        method: "PUT",
        body: { items: updatedItems },
      });
      const freshTrip = await fetchAPI(`/api/shopping-trips/${trip._id}`);
      if (freshTrip && freshTrip.items) {
        setTrip(freshTrip);
      }
    } catch (err) {
      setError(err.message || "Failed to update price");
    }
  }

  async function handleUpdateItemQuantity(itemId, quantity) {
    if (!trip || !trip.items) return;
    const updatedItems = trip.items.map((item) =>
      item.itemId === itemId
        ? { ...item, quantity: parseFloat(quantity) || 1 }
        : item,
    );

    setTrip((prevTrip) => ({
      ...prevTrip,
      items: updatedItems,
    }));

    try {
      await fetchAPI(`/api/shopping-trips/${trip._id}`, {
        method: "PUT",
        body: { items: updatedItems },
      });
      const freshTrip = await fetchAPI(`/api/shopping-trips/${trip._id}`);
      if (freshTrip && freshTrip.items) {
        setTrip(freshTrip);
      }
    } catch (err) {
      setError(err.message || "Failed to update quantity");
    }
  }

  async function handleAddItem() {
    const price = parseFloat(newItemPrice);
    const quantity = parseFloat(newItemQuantity);

    if (!price || price <= 0) {
      setError("Price is required and must be greater than 0");
      return;
    }
    if (!quantity || quantity <= 0) {
      setError("Quantity is required and must be greater than 0");
      return;
    }

    setError("");
    if (!trip) return;

    const newItem = {
      itemId: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: newItemName.trim() || "Unnamed Item",
      price: price,
      quantity: quantity,
      checked: true,
    };

    try {
      const updatedItems = [...(trip.items || []), newItem];

      setTrip((prevTrip) => ({
        ...prevTrip,
        items: updatedItems,
      }));
      setNewItemName("");
      setNewItemPrice("");
      setNewItemQuantity("1");

      const updated = await fetchAPI(`/api/shopping-trips/${trip._id}`, {
        method: "PUT",
        body: { items: updatedItems },
      });

      const updatedTrip = updated?.value || updated;

      if (
        updatedTrip &&
        updatedTrip.items &&
        Array.isArray(updatedTrip.items) &&
        updatedTrip.items.length === updatedItems.length
      ) {
        const itemIdsMatch = updatedItems.every((localItem) =>
          updatedTrip.items.some(
            (backendItem) => backendItem.itemId === localItem.itemId,
          ),
        );

        if (itemIdsMatch) {
          setTrip(updatedTrip);
        }
      } else {
        try {
          const freshTrip = await fetchAPI(`/api/shopping-trips/${trip._id}`);
          if (freshTrip && freshTrip.items && Array.isArray(freshTrip.items)) {
            setTrip(freshTrip);
          }
        } catch (fetchErr) {
          console.warn(
            "Failed to fetch updated trip, keeping local state",
            fetchErr,
          );
        }
      }
    } catch (err) {
      setError(err.message || "Failed to add item");
    }
  }

  function handleCheckoutClick() {
    if (!trip || !trip.items || trip.items.length === 0) {
      setError("No items to checkout");
      return;
    }
    setShowConfirmDialog(true);
  }

  async function handleCheckout() {
    setShowConfirmDialog(false);
    setError("");
    try {
      const newTrip = await fetchAPI("/api/shopping-trips", {
        method: "POST",
        body: {
          items: [],
          tripDate: new Date().toISOString(),
        },
      });

      setTrip(newTrip);
      setError("");
      setNewItemName("");
      setNewItemPrice("");
      setNewItemQuantity("1");
    } catch (err) {
      setError(err.message || "Failed to checkout");
    }
  }

  async function handleDeleteItem(itemId) {
    if (!trip) return;
    const updatedItems = (trip.items || []).filter(
      (item) => item.itemId !== itemId,
    );

    setTrip((prevTrip) => ({
      ...prevTrip,
      items: updatedItems,
    }));

    try {
      await fetchAPI(`/api/shopping-trips/${trip._id}`, {
        method: "PUT",
        body: { items: updatedItems },
      });
      const freshTrip = await fetchAPI(`/api/shopping-trips/${trip._id}`);
      if (freshTrip && freshTrip.items) {
        setTrip(freshTrip);
      }
    } catch (err) {
      setError(err.message || "Failed to delete item");
    }
  }

  function handleSetBudget() {
    const amount = parseFloat(budgetInput);
    if (!isNaN(amount) && amount >= 0) {
      setBudget(amount);
      setBudgetInput("");
      localStorage.setItem("pocketcart_budget", amount.toString());
    }
  }

  if (loading) {
    return (
      <div className="shopping-trip-page">
        <Loading />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="shopping-trip-page">
        <EmptyState message="No trip available" />
      </div>
    );
  }

  return (
    <div className="shopping-trip-page">
      <h2>Shopping Trip</h2>
      <ErrorDisplay error={error} />

      <div className="shopping-trip-page__budget-section">
        <label>
          Budget:
          <input
            type="number"
            value={budgetInput}
            onChange={(e) => setBudgetInput(e.target.value)}
            placeholder="0.00"
            step="0.01"
            className="shopping-trip-page__budget-input"
          />
        </label>
        <button onClick={handleSetBudget}>Set Budget</button>
      </div>

      <div className="shopping-trip-page__budget-display">
        <p>
          <strong>Total: ${calculateTotal().toFixed(2)}</strong>
        </p>
        {budget > 0 && (
          <p>
            Remaining: ${(budget - calculateTotal()).toFixed(2)}
            {budget - calculateTotal() < 0 && (
              <span className="shopping-trip-page__over-budget">
                (Over budget by $
                {Math.abs(budget - calculateTotal()).toFixed(2)})
              </span>
            )}
          </p>
        )}
      </div>

      <div className="shopping-trip-page__add-item-section">
        <h3>Add Item</h3>
        <div className="shopping-trip-page__add-item-form">
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Item name (optional)"
            className="shopping-trip-page__item-name-input"
          />
          <input
            type="number"
            value={newItemPrice}
            onChange={(e) => setNewItemPrice(e.target.value)}
            placeholder="Price *"
            step="0.01"
            min="0"
            required
            className="shopping-trip-page__item-price-input"
          />
          <input
            type="number"
            value={newItemQuantity}
            onChange={(e) => setNewItemQuantity(e.target.value)}
            placeholder="Quantity *"
            min="1"
            required
            className="shopping-trip-page__item-quantity-input"
          />
          <button onClick={handleAddItem}>Add Item</button>
        </div>
      </div>

      <div className="shopping-trip-page__items-section">
        <h3>Items ({trip.items?.length || 0})</h3>
        {!trip.items || trip.items.length === 0 ? (
          <EmptyState message="No items in this trip. Add items above!" />
        ) : (
          <ul>
            {trip.items.map((item) => {
              const itemTotal = (
                parseFloat(item.price || 0) * parseFloat(item.quantity || 1)
              ).toFixed(2);
              return (
                <li key={item.itemId} className="shopping-trip-page__item-row">
                  <div className="shopping-trip-page__item-content">
                    <input
                      type="checkbox"
                      checked={item.checked || false}
                      onChange={(e) =>
                        handleCheckItem(item.itemId, e.target.checked)
                      }
                    />
                    <span className="shopping-trip-page__item-name">
                      {item.name || "Unnamed Item"}
                    </span>
                    <label>
                      Price:
                      <input
                        type="number"
                        value={item.price || ""}
                        onChange={(e) =>
                          handleUpdateItemPrice(item.itemId, e.target.value)
                        }
                        step="0.01"
                        min="0"
                        className="shopping-trip-page__item-price-input-field"
                      />
                    </label>
                    <label>
                      Qty:
                      <input
                        type="number"
                        value={item.quantity || 1}
                        onChange={(e) =>
                          handleUpdateItemQuantity(item.itemId, e.target.value)
                        }
                        min="1"
                        className="shopping-trip-page__item-quantity-input-field"
                      />
                    </label>
                    <span className="shopping-trip-page__item-total">
                      ${itemTotal}
                    </span>
                    <button
                      onClick={() => handleDeleteItem(item.itemId)}
                      className="shopping-trip-page__item-delete-btn"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {trip.items && trip.items.length > 0 && (
        <div>
          <button
            onClick={handleCheckoutClick}
            className="shopping-trip-page__checkout-btn"
          >
            Checkout (Save Trip)
          </button>
        </div>
      )}

      {showConfirmDialog ? (
        <ConfirmDialog
          title="Confirm Checkout"
          message={`Checkout with total: $${calculateTotal().toFixed(2)}? This will save the trip to history.`}
          onConfirm={handleCheckout}
          onCancel={() => setShowConfirmDialog(false)}
        />
      ) : null}
    </div>
  );
}

ShoppingTripPage.propTypes = {};

export default ShoppingTripPage;
