import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const DB_NAME = process.env.DB_NAME || "pocketcart";

let client = null;
let db = null;

export const connectToDatabase = async () => {
  try {
    if (!client) {
      client = new MongoClient(MONGODB_URI);
      await client.connect();
      console.log("Connected to MongoDB");
    }

    if (!db) {
      db = client.db(DB_NAME);
    }

    return db;
  } catch (error) {
    console.error("Database connection error:", error);
    throw error;
  }
};

export const getDatabase = () => {
  if (!db) {
    throw new Error("Database not connected. Call connectToDatabase() first.");
  }
  return db;
};

export const closeDatabase = async () => {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log("Disconnected from MongoDB");
  }
};
