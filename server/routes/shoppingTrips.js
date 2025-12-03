import express from "express";
import {
  createShoppingTrip,
  getShoppingTripById,
  getAllShoppingTrips,
  updateShoppingTrip,
  deleteShoppingTrip,
  getTripsByDateRange,
} from "../models/ShoppingTrip.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

router.get("/", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const trips = await getAllShoppingTrips(userId);
    res.json(trips);
  } catch (error) {
    console.error("Error fetching shopping trips:", error);
    res.status(500).json({ error: "Failed to fetch shopping trips" });
  }
});

router.get("/history", isAuthenticated, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({
        error: "startDate and endDate query parameters are required",
      });
    }
    const userId = req.user._id.toString();
    const trips = await getTripsByDateRange(startDate, endDate, userId);
    res.json(trips);
  } catch (error) {
    console.error("Error fetching shopping trips by date range:", error);
    res.status(500).json({
      error: error.message || "Failed to fetch shopping trips by date range",
    });
  }
});

router.get("/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id.toString();
    const trip = await getShoppingTripById(id, userId);
    if (!trip) {
      return res.status(404).json({ error: "Shopping trip not found" });
    }
    res.json(trip);
  } catch (error) {
    console.error("Error fetching shopping trip:", error);
    res.status(500).json({ error: "Failed to fetch shopping trip" });
  }
});

router.post("/", isAuthenticated, async (req, res) => {
  try {
    const tripData = req.body;
    const userId = req.user._id.toString();
    const createdTrip = await createShoppingTrip(tripData, userId);
    res.status(201).json(createdTrip);
  } catch (error) {
    console.error("Error creating shopping trip:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to create shopping trip" });
  }
});

router.put("/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user._id.toString();
    const result = await updateShoppingTrip(id, updates, userId);
    if (!result) {
      return res.status(404).json({ error: "Shopping trip not found" });
    }
    res.json(result);
  } catch (error) {
    console.error("Error updating shopping trip:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to update shopping trip" });
  }
});

router.delete("/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id.toString();
    const deleted = await deleteShoppingTrip(id, userId);
    if (!deleted) {
      return res.status(404).json({ error: "Shopping trip not found" });
    }
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting shopping trip:", error);
    res.status(500).json({ error: "Failed to delete shopping trip" });
  }
});

export default router;
