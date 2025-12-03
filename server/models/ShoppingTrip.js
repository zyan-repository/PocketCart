import { getDatabase } from "../config/database.js";
import { ObjectId } from "mongodb";

const COLLECTION_NAME = "shoppingTrips";

function validateItems(items) {
  if (!Array.isArray(items)) {
    throw new Error("Items must be an array");
  }

  items.forEach((item, index) => {
    if (item.checked) {
      if (typeof item.price !== "number") {
        throw new Error(`Item at index ${index} has invalid price type`);
      }
      if (item.price < 0) {
        throw new Error(`Item at index ${index} has negative price`);
      }
    }
  });
}

function calculateTotalAmount(items) {
  return items
    .filter((item) => item.checked && item.price && item.quantity)
    .reduce((total, item) => {
      const price =
        typeof item.price === "number"
          ? item.price
          : parseFloat(item.price || 0);
      const quantity =
        typeof item.quantity === "number"
          ? item.quantity
          : parseFloat(item.quantity || 1);
      return total + price * quantity;
    }, 0);
}

export async function createShoppingTrip(tripData, userId) {
  const items = tripData.items || [];
  validateItems(items);

  const db = getDatabase();
  const collection = db.collection(COLLECTION_NAME);

  const now = new Date();
  const totalAmount = calculateTotalAmount(items);

  const tripDocument = {
    listId: tripData.listId
      ? ObjectId.createFromHexString(tripData.listId)
      : null,
    items: items,
    totalAmount: totalAmount,
    tripDate: tripData.tripDate ? new Date(tripData.tripDate) : now,
    userId: ObjectId.createFromHexString(userId),
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(tripDocument);
  return {
    _id: result.insertedId,
    ...tripDocument,
  };
}

export async function getShoppingTripById(id, userId) {
  try {
    const db = getDatabase();
    const collection = db.collection(COLLECTION_NAME);
    const objectId = ObjectId.createFromHexString(id);
    const userIdObject = ObjectId.createFromHexString(userId);
    const trip = await collection.findOne({
      _id: objectId,
      userId: userIdObject,
    });
    return trip;
  } catch (error) {
    console.error("Error fetching shopping trip by ID:", error);
    return null;
  }
}

export async function getAllShoppingTrips(userId) {
  const db = getDatabase();
  const collection = db.collection(COLLECTION_NAME);
  const userIdObject = ObjectId.createFromHexString(userId);
  const trips = await collection
    .find({ userId: userIdObject })
    .sort({ tripDate: -1 })
    .toArray();
  return trips;
}

export async function updateShoppingTrip(id, updates, userId) {
  try {
    const db = getDatabase();
    const collection = db.collection(COLLECTION_NAME);
    const objectId = ObjectId.createFromHexString(id);
    const userIdObject = ObjectId.createFromHexString(userId);

    const {
      _id,
      createdAt: _createdAt,
      userId: _userId,
      ...safeUpdates
    } = updates;

    const updateData = {
      ...safeUpdates,
      updatedAt: new Date(),
    };

    if (updates.items) {
      validateItems(updates.items);
      updateData.totalAmount = calculateTotalAmount(updates.items);
    }

    if ("listId" in updates) {
      updateData.listId = updates.listId
        ? ObjectId.createFromHexString(updates.listId)
        : null;
    }

    if (updates.tripDate) {
      updateData.tripDate = new Date(updates.tripDate);
    }

    const result = await collection.findOneAndUpdate(
      { _id: objectId, userId: userIdObject },
      { $set: updateData },
    );

    return result;
  } catch (error) {
    console.error("Error updating shopping trip:", error);
    return null;
  }
}

export async function deleteShoppingTrip(id, userId) {
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
    console.error("Error deleting shopping trip:", error);
    return false;
  }
}

export async function getTripsByDateRange(startDate, endDate, userId) {
  if (!startDate || !endDate) {
    throw new Error("startDate and endDate are required");
  }

  const db = getDatabase();
  const collection = db.collection(COLLECTION_NAME);

  const start = startDate instanceof Date ? startDate : new Date(startDate);
  const end = endDate instanceof Date ? endDate : new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error("Invalid date format");
  }

  if (start > end) {
    throw new Error("startDate must be before or equal to endDate");
  }

  const isStartISO = typeof startDate === "string" && startDate.includes("T");
  const isEndISO = typeof endDate === "string" && endDate.includes("T");

  if (!isStartISO) {
    start.setHours(0, 0, 0, 0);
  }
  if (!isEndISO) {
    end.setHours(23, 59, 59, 999);
  }

  const userIdObject = ObjectId.createFromHexString(userId);
  const query = {
    tripDate: {
      $gte: start,
      $lte: end,
    },
    userId: userIdObject,
  };

  const trips = await collection.find(query).sort({ tripDate: -1 }).toArray();
  return trips;
}
