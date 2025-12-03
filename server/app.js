import "dotenv/config";
import express from "express";
import session from "express-session";
import cors from "cors";
import passport from "./config/passport.js";
import { connectToDatabase } from "./config/database.js";
import shoppingListsRouter from "./routes/shoppingLists.js";
import shoppingTripsRouter from "./routes/shoppingTrips.js";
import authRouter from "./routes/auth.js";

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration for credentials
app.use(
  cors({
    origin: ["http://localhost:5173", "https://pocketcart.onrender.com"],
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "pocketcart-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }),
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api/auth", authRouter);
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
