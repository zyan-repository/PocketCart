import express from "express";
import bcrypt from "bcrypt";
import passport from "passport";
import { createUser, findUserByEmail } from "../models/User.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await createUser({
      email,
      password: hashedPassword,
      name,
    });

    const { password: _password, ...userWithoutPassword } = user;

    res.status(201).json({
      message: "User created successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Failed to register user" });
  }
});

router.post("/login", (req, res, next) => {
  console.log("=== LOGIN REQUEST ===");
  console.log("  Initial session ID:", req.sessionID || "none");
  console.log("  Initial cookies:", req.headers.cookie || "none");

  passport.authenticate("local", (err, user, info) => {
    if (err) {
      console.error("  Error during login:", err);
      return res.status(500).json({ error: "Failed to login" });
    }

    if (!user) {
      console.log("  Login failed: Invalid credentials");
      return res.status(401).json({ error: info.message || "Invalid credentials" });
    }

    console.log("  User authenticated:", user.email);
    console.log("  Session ID before logIn:", req.sessionID || "none");

    req.logIn(user, (err) => {
      if (err) {
        console.error("  Error during login session:", err);
        return res.status(500).json({ error: "Failed to create session" });
      }

      console.log("  Session ID after logIn:", req.sessionID || "none");
      console.log("  Session cookie config:", JSON.stringify(req.session.cookie, null, 2));
      console.log("  Session isModified:", req.session.isModified ? req.session.isModified() : "N/A");

      req.session.touch();
      console.log("  Session touched");

      req.session.save((err) => {
        if (err) {
          console.error("  Error saving session:", err);
          return res.status(500).json({ error: "Failed to save session" });
        }

        console.log("  Session saved successfully");
        console.log("  Final session ID:", req.sessionID);
        console.log("  Session cookie:", JSON.stringify(req.session.cookie, null, 2));

        const { password: _password, ...userWithoutPassword } = user;

        res.json({
          message: "Login successful",
          user: userWithoutPassword,
        });

        console.log("=== LOGIN RESPONSE SENT ===");
      });
    });
  })(req, res, next);
});

router.get("/user", isAuthenticated, (req, res) => {
  console.log("=== GET /user ===");
  console.log("  Session ID:", req.sessionID);
  console.log("  User:", req.user?.email || "none");
  const { password: _password, ...userWithoutPassword } = req.user;
  res.json({ user: userWithoutPassword });
});

router.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error("Error during logout:", err);
      return res.status(500).json({ error: "Failed to logout" });
    }
    res.json({ message: "Logout successful" });
  });
});

export default router;
