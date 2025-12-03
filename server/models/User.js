import { getDatabase } from "../config/database.js";
import { ObjectId } from "mongodb";

const COLLECTION_NAME = "users";

export async function createUser(userData) {
  const db = getDatabase();
  const collection = db.collection(COLLECTION_NAME);

  const userDocument = {
    email: userData.email,
    password: userData.password,
    name: userData.name,
    createdAt: new Date(),
  };

  const result = await collection.insertOne(userDocument);
  return {
    _id: result.insertedId,
    ...userDocument,
  };
}

export async function findUserByEmail(email) {
  const db = getDatabase();
  const collection = db.collection(COLLECTION_NAME);
  const user = await collection.findOne({ email });
  return user;
}

export async function findUserById(id) {
  try {
    const db = getDatabase();
    const collection = db.collection(COLLECTION_NAME);
    const objectId = ObjectId.createFromHexString(id);
    const user = await collection.findOne({ _id: objectId });
    return user;
  } catch (error) {
    console.error("Error finding user by ID:", error);
    return null;
  }
}
