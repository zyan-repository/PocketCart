import "dotenv/config";
import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import cors from "cors";
import passport from "./config/passport.js";
import { connectToDatabase, getClient } from "./config/database.js";
import shoppingListsRouter from "./routes/shoppingLists.js";
import shoppingTripsRouter from "./routes/shoppingTrips.js";
import authRouter from "./routes/auth.js";

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration for credentials
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
  : ["http://localhost:5173"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  console.log("  Request cookies:", req.headers.cookie || "none");
  console.log("  Request origin:", req.headers.origin || "none");
  next();
});

// Session configuration with MongoDB store
let sessionStore = null;

async function configureSession() {
  await connectToDatabase();
  const client = getClient();

  sessionStore = MongoStore.create({
    client: client,
    dbName: process.env.DB_NAME || "pocketcart",
    collectionName: "sessions",
    touchAfter: 24 * 3600,
    ttl: 24 * 60 * 60,
  });

  const isProduction = process.env.NODE_ENV === "production" || process.env.RENDER;

  app.use(
    session({
      name: "connect.sid",
      secret: process.env.SESSION_SECRET || "pocketcart-secret-key",
      resave: false,
      saveUninitialized: true,
      store: sessionStore,
      cookie: {
        secure: isProduction,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: isProduction ? "none" : "lax",
        path: "/",
      },
    }),
  );

  // Session debugging middleware
  app.use((req, res, next) => {
    const originalEnd = res.end;
    res.end = function (...args) {
      console.log(`  Session ID: ${req.sessionID || "none"}`);
      console.log(`  Is authenticated: ${req.isAuthenticated ? req.isAuthenticated() : "N/A"}`);
      console.log(`  Response headers:`, JSON.stringify(res.getHeaders(), null, 2));
      const setCookie = res.getHeader("set-cookie");
      console.log(`  Set-Cookie header: ${setCookie || "none"}`);
      originalEnd.apply(this, args);
    };
    next();
  });

  // Initialize Passport (must be after session)
  app.use(passport.initialize());
  app.use(passport.session());

  // Routes (must be after Passport)
  app.use("/api/auth", authRouter);
  app.use("/api/shopping-lists", shoppingListsRouter);
  app.use("/api/shopping-trips", shoppingTripsRouter);

  app.use((_req, res) => {
    res.status(404).json({ error: "Route not found" });
  });

  app.use((err, req, res, next) => {
    console.error("Error:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  });
}

async function startServer() {
  try {
    await configureSession();
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
