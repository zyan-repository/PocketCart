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
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      console.error("Error during login:", err);
      return res.status(500).json({ error: "Failed to login" });
    }

    if (!user) {
      return res.status(401).json({ error: info.message || "Invalid credentials" });
    }

    req.logIn(user, (err) => {
      if (err) {
        console.error("Error during login session:", err);
        return res.status(500).json({ error: "Failed to create session" });
      }

      const { password: _password, ...userWithoutPassword } = user;

      res.json({
        message: "Login successful",
        user: userWithoutPassword,
      });
    });
  })(req, res, next);
});

router.get("/user", isAuthenticated, (req, res) => {
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
