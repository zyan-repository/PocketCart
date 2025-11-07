import express from "express";
import {
  createShoppingTrip,
  getShoppingTripById,
  getAllShoppingTrips,
  updateShoppingTrip,
  deleteShoppingTrip,
  getTripsByDateRange,
} from "../models/ShoppingTrip.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const trips = await getAllShoppingTrips();
    res.json(trips);
  } catch (error) {
    console.error("Error fetching shopping trips:", error);
    res.status(500).json({ error: "Failed to fetch shopping trips" });
  }
});

router.get("/history", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({
        error: "startDate and endDate query parameters are required",
      });
    }
    const trips = await getTripsByDateRange(startDate, endDate);
    res.json(trips);
  } catch (error) {
    console.error("Error fetching shopping trips by date range:", error);
    res.status(500).json({
      error: error.message || "Failed to fetch shopping trips by date range",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const trip = await getShoppingTripById(id);
    if (!trip) {
      return res.status(404).json({ error: "Shopping trip not found" });
    }
    res.json(trip);
  } catch (error) {
    console.error("Error fetching shopping trip:", error);
    res.status(500).json({ error: "Failed to fetch shopping trip" });
  }
});

router.post("/", async (req, res) => {
  try {
    const tripData = req.body;
    const createdTrip = await createShoppingTrip(tripData);
    res.status(201).json(createdTrip);
  } catch (error) {
    console.error("Error creating shopping trip:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to create shopping trip" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const result = await updateShoppingTrip(id, updates);
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

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteShoppingTrip(id);
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
