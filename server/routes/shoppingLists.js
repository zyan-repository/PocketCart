import express from "express";
import {
  createShoppingList,
  getShoppingListById,
  getAllShoppingLists,
  updateShoppingList,
  deleteShoppingList,
} from "../models/ShoppingList.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

router.get("/", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const lists = await getAllShoppingLists(userId);
    res.json(lists);
  } catch (error) {
    console.error("Error fetching shopping lists:", error);
    res.status(500).json({ error: "Failed to fetch shopping lists" });
  }
});

router.get("/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id.toString();
    const list = await getShoppingListById(id, userId);
    if (!list) {
      return res.status(404).json({ error: "Shopping list not found" });
    }
    res.json(list);
  } catch (error) {
    console.error("Error fetching shopping list:", error);
    res.status(500).json({ error: "Failed to fetch shopping list" });
  }
});

router.post("/", isAuthenticated, async (req, res) => {
  try {
    const listData = req.body;
    const userId = req.user._id.toString();
    const createdList = await createShoppingList(listData, userId);
    res.status(201).json(createdList);
  } catch (error) {
    console.error("Error creating shopping list:", error);
    res.status(500).json({ error: "Failed to create shopping list" });
  }
});

router.put("/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user._id.toString();
    const result = await updateShoppingList(id, updates, userId);
    if (!result) {
      return res.status(404).json({ error: "Shopping list not found" });
    }
    res.json(result);
  } catch (error) {
    console.error("Error updating shopping list:", error);
    res.status(500).json({ error: "Failed to update shopping list" });
  }
});

router.delete("/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id.toString();
    const deleted = await deleteShoppingList(id, userId);
    if (!deleted) {
      return res.status(404).json({ error: "Shopping list not found" });
    }
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting shopping list:", error);
    res.status(500).json({ error: "Failed to delete shopping list" });
  }
});

export default router;
