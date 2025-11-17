import { MongoClient, ServerApiVersion } from "mongodb";

const MONGODB_TYPE = process.env.MONGODB_TYPE || "local";
const DB_NAME = process.env.DB_NAME || "pocketcart";

function buildMongoDBURI() {
  if (MONGODB_TYPE === "atlas") {
    const username = process.env.MONGODB_ATLAS_USERNAME;
    const password = process.env.MONGODB_ATLAS_PASSWORD;
    const cluster = process.env.MONGODB_ATLAS_CLUSTER || "cluster0.tljsb5g.mongodb.net";
    const appName = process.env.MONGODB_ATLAS_APP_NAME || "Cluster0";

    if (!username || !password) {
      throw new Error(
        "MongoDB Atlas requires MONGODB_ATLAS_USERNAME and MONGODB_ATLAS_PASSWORD environment variables",
      );
    }

    return `mongodb+srv://${username}:${password}@${cluster}/?retryWrites=true&w=majority&appName=${appName}`;
  } else {
    return process.env.MONGODB_URI || "mongodb://localhost:27017";
  }
}

const MONGODB_URI = buildMongoDBURI();

function createMongoClientOptions() {
  if (MONGODB_TYPE === "atlas") {
    return {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    };
  }
  return {};
}

let client = null;
let db = null;

export const connectToDatabase = async () => {
  try {
    if (!client) {
      const options = createMongoClientOptions();
      client = new MongoClient(MONGODB_URI, options);
      await client.connect();

      if (MONGODB_TYPE === "atlas") {
        await client.db("admin").command({ ping: 1 });
        console.log("Successfully connected to MongoDB Atlas!");
      } else {
        console.log("Successfully connected to local MongoDB!");
      }
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
