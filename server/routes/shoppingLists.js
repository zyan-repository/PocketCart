import express from "express";
import {
  createShoppingList,
  getShoppingListById,
  getAllShoppingLists,
  updateShoppingList,
  deleteShoppingList,
} from "../models/ShoppingList.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const lists = await getAllShoppingLists();
    res.json(lists);
  } catch (error) {
    console.error("Error fetching shopping lists:", error);
    res.status(500).json({ error: "Failed to fetch shopping lists" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const list = await getShoppingListById(id);
    if (!list) {
      return res.status(404).json({ error: "Shopping list not found" });
    }
    res.json(list);
  } catch (error) {
    console.error("Error fetching shopping list:", error);
    res.status(500).json({ error: "Failed to fetch shopping list" });
  }
});

router.post("/", async (req, res) => {
  try {
    const listData = req.body;
    const createdList = await createShoppingList(listData);
    res.status(201).json(createdList);
  } catch (error) {
    console.error("Error creating shopping list:", error);
    res.status(500).json({ error: "Failed to create shopping list" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const result = await updateShoppingList(id, updates);
    if (!result) {
      return res.status(404).json({ error: "Shopping list not found" });
    }
    res.json(result);
  } catch (error) {
    console.error("Error updating shopping list:", error);
    res.status(500).json({ error: "Failed to update shopping list" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteShoppingList(id);
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
