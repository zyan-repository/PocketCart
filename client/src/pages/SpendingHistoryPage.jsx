import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { fetchAPI } from "../services/api.js";
import ErrorDisplay from "../components/ErrorDisplay.jsx";
import Loading from "../components/Loading.jsx";
import EmptyState from "../components/EmptyState.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import "./SpendingHistoryPage.css";

function SpendingHistoryPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleteTripId, setDeleteTripId] = useState(null);

  async function fetchAllTrips() {
    setLoading(true);
    setError("");
    try {
      const data = await fetchAPI("/api/shopping-trips");
      const validTrips = data.filter(
        (trip) => trip.items?.length > 0,
      );
      setTrips(validTrips);
    } catch (err) {
      setError(err.message || "Failed to fetch trips");
      setTrips([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!startDate && !endDate) {
      fetchAllTrips();
    }
  }, [startDate, endDate]);

  async function handleFetchHistory() {
    if (!startDate || !endDate) {
      setError("Please select both start and end dates");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await fetchAPI(
        `/api/shopping-trips/history?startDate=${startDate}&endDate=${endDate}`,
      );
      setTrips(data || []);
    } catch (err) {
      setError(err.message || "Failed to fetch history");
      setTrips([]);
    } finally {
      setLoading(false);
    }
  }

  function handleDeleteTripClick(tripId) {
    setDeleteTripId(tripId);
  }

  async function handleDeleteTrip() {
    if (!deleteTripId) return;
    const tripId = deleteTripId;
    setDeleteTripId(null);
    setError("");
    try {
      await fetchAPI(`/api/shopping-trips/${tripId}`, {
        method: "DELETE",
      });
      setTrips((prevTrips) => prevTrips.filter((trip) => trip._id !== tripId));
    } catch (err) {
      setError(err.message || "Failed to delete trip");
    }
  }

  function formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }

  const totalSpending = trips.reduce(
    (sum, trip) => sum + trip.totalAmount,
    0,
  );

  return (
    <div className="spending-history-page">
      <h2>Spending History</h2>

      <div className="spending-history-page__filter-section">
        <button
          onClick={() => {
            setError("");
            setStartDate("");
            setEndDate("");
          }}
          className={`spending-history-page__view-all-btn ${!startDate && !endDate ? "spending-history-page__view-all-btn--active" : ""}`}
        >
          View All Trips
        </button>
        <span className="spending-history-page__filter-separator">or</span>
        <div className="spending-history-page__date-inputs">
          <label>
            Start Date:
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setError("");
              }}
              className="spending-history-page__date-input"
            />
          </label>
          <label>
            End Date:
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setError("");
              }}
              className="spending-history-page__date-input"
            />
          </label>
          <button onClick={handleFetchHistory}>Search by Date</button>
        </div>
      </div>

      <ErrorDisplay error={error} />
      {loading && <Loading />}
      {!loading && trips.length === 0 && startDate && endDate && (
        <EmptyState message="No trips found in this date range" />
      )}
      {!loading && trips.length === 0 && !startDate && !endDate && (
        <EmptyState message="No trips found" />
      )}
      {!loading && trips.length > 0 && (
        <div className="spending-history-page__results-section">
          <p>
            <strong>Results ({trips.length} trips):</strong>
          </p>
          <ul className="spending-history-page__trips-list">
            {trips.map((trip) => {
              const checkedItems = (trip.items || []).filter(
                (item) => item.checked,
              );
              return (
                <li key={trip._id} className="spending-history-page__trip-card">
                  <div className="spending-history-page__trip-content">
                    <div className="spending-history-page__trip-info">
                      <div className="spending-history-page__trip-field">
                        <strong>Date:</strong> {formatDate(trip.tripDate)}
                      </div>
                      <div className="spending-history-page__trip-field">
                        <strong>Total:</strong> $
                        {(trip.totalAmount || 0).toFixed(2)}
                      </div>
                      {checkedItems.length > 0 && (
                        <div>
                          <strong>Items ({checkedItems.length}):</strong>
                          <ul className="spending-history-page__trip-items">
                            {checkedItems.map((item, index) => (
                              <li key={item.itemId || index}>
                                {item.name || "Unnamed Item"}
                                {item.quantity > 1 && ` (x${item.quantity})`}
                                {item.price &&
                                  ` - $${(parseFloat(item.price) * parseFloat(item.quantity || 1)).toFixed(2)}`}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteTripClick(trip._id)}
                      className="spending-history-page__trip-delete-btn"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="spending-history-page__total-spending">
            <p>
              <strong>Total Spending: ${totalSpending.toFixed(2)}</strong>
            </p>
          </div>
        </div>
      )}

      {deleteTripId !== null ? (
        <ConfirmDialog
          title="Delete Trip"
          message="Are you sure you want to delete this trip?"
          confirmType="delete"
          onConfirm={handleDeleteTrip}
          onCancel={() => setDeleteTripId(null)}
        />
      ) : null}
    </div>
  );
}

SpendingHistoryPage.propTypes = {};

export default SpendingHistoryPage;
