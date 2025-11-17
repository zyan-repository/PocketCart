import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectToDatabase } from "./config/database.js";
import shoppingListsRouter from "./routes/shoppingLists.js";
import shoppingTripsRouter from "./routes/shoppingTrips.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api/shopping-lists", shoppingListsRouter);
app.use("/api/shopping-trips", shoppingTripsRouter);

app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, _req, res) => {
  console.error("Error:", err);
  res.status(500).json({ error: err.message || "Internal server error" });
});

async function startServer() {
  try {
    await connectToDatabase();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

export default app;
