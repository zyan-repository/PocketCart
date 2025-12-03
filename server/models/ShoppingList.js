import { getDatabase } from "../config/database.js";
import { ObjectId } from "mongodb";

const COLLECTION_NAME = "shoppingLists";

export async function createShoppingList(listData, userId) {
  const db = getDatabase();
  const collection = db.collection(COLLECTION_NAME);

  const listDocument = {
    name: listData.name,
    items: listData.items || [],
    userId: ObjectId.createFromHexString(userId),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await collection.insertOne(listDocument);
  return {
    _id: result.insertedId,
    ...listDocument,
  };
}

export async function getShoppingListById(id, userId) {
  try {
    const db = getDatabase();
    const collection = db.collection(COLLECTION_NAME);
    const objectId = ObjectId.createFromHexString(id);
    const userIdObject = ObjectId.createFromHexString(userId);
    const list = await collection.findOne({
      _id: objectId,
      userId: userIdObject,
    });
    return list;
  } catch (error) {
    console.error("Error fetching shopping list by ID:", error);
    return null;
  }
}

export async function getAllShoppingLists(userId) {
  const db = getDatabase();
  const collection = db.collection(COLLECTION_NAME);
  const userIdObject = ObjectId.createFromHexString(userId);
  const lists = await collection
    .find({ userId: userIdObject })
    .sort({ createdAt: -1 })
    .toArray();
  return lists;
}

export async function updateShoppingList(id, updates, userId) {
  try {
    const db = getDatabase();
    const collection = db.collection(COLLECTION_NAME);
    const objectId = ObjectId.createFromHexString(id);
    const userIdObject = ObjectId.createFromHexString(userId);

    const { _id, createdAt: _createdAt, userId: _userId, ...safeUpdates } =
      updates;

    const updateData = {
      ...safeUpdates,
      updatedAt: new Date(),
    };

    const result = await collection.findOneAndUpdate(
      { _id: objectId, userId: userIdObject },
      { $set: updateData },
    );

    return result;
  } catch (error) {
    console.error("Error updating shopping list:", error);
    return null;
  }
}

export async function deleteShoppingList(id, userId) {
  try {
    const db = getDatabase();
    const collection = db.collection(COLLECTION_NAME);
    const objectId = ObjectId.createFromHexString(id);
    const userIdObject = ObjectId.createFromHexString(userId);
    const result = await collection.deleteOne({
      _id: objectId,
      userId: userIdObject,
    });
    return result.deletedCount > 0;
  } catch (error) {
    console.error("Error deleting shopping list:", error);
    return false;
  }
}
