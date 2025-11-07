import { getDatabase } from "../config/database.js";
import { ObjectId } from "mongodb";

const COLLECTION_NAME = "shoppingLists";

export async function createShoppingList(listData) {
  const db = getDatabase();
  const collection = db.collection(COLLECTION_NAME);

  const listDocument = {
    name: listData.name,
    items: listData.items || [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await collection.insertOne(listDocument);
  return {
    _id: result.insertedId,
    ...listDocument,
  };
}

export async function getShoppingListById(id) {
  try {
    const db = getDatabase();
    const collection = db.collection(COLLECTION_NAME);
    const objectId = ObjectId.createFromHexString(id);
    const list = await collection.findOne({ _id: objectId });
    return list;
  } catch (error) {
    console.error("Error fetching shopping list by ID:", error);
    return null;
  }
}

export async function getAllShoppingLists() {
  const db = getDatabase();
  const collection = db.collection(COLLECTION_NAME);
  const lists = await collection.find({}).sort({ createdAt: -1 }).toArray();
  return lists;
}

export async function updateShoppingList(id, updates) {
  try {
    const db = getDatabase();
    const collection = db.collection(COLLECTION_NAME);
    const objectId = ObjectId.createFromHexString(id);

    const { _id, createdAt: _createdAt, ...safeUpdates } = updates;

    const updateData = {
      ...safeUpdates,
      updatedAt: new Date(),
    };

    const result = await collection.findOneAndUpdate(
      { _id: objectId },
      { $set: updateData },
    );

    return result;
  } catch (error) {
    console.error("Error updating shopping list:", error);
    return null;
  }
}

export async function deleteShoppingList(id) {
  try {
    const db = getDatabase();
    const collection = db.collection(COLLECTION_NAME);
    const objectId = ObjectId.createFromHexString(id);
    const result = await collection.deleteOne({ _id: objectId });
    return result.deletedCount > 0;
  } catch (error) {
    console.error("Error deleting shopping list:", error);
    return false;
  }
}
