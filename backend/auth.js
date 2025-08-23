import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "./db.js";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

//sign-up
router.post("/signup", async (req, res) => {
  console.log("Signup request body:", req.body);
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ error: "Form needs to be filled correctly" });
    return;
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING "userID", email',
      [name, email, hash],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "User already exists or bad request" });
  }
});

//login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: "User not found" });
    }
    const user = result.rows[0];

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(400).json({ error: "Invalid credentials" });

    // Create JWT
    const token = jwt.sign({ userID: user.userID }, JWT_SECRET, {
      expiresIn: "1h",
    });

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await pool.query(
      'INSERT INTO sessions ("userID", token, expires_at) VALUES ($1, $2, $3)',
      [user.userID, token, expiresAt],
    );

    // Send as HttpOnly cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 1000, // 1h
    });

    res.json({ message: "Login successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Log-in Failed" });
  }
});

//log-out
router.post("/logout", async (req, res) => {
  const token = req.cookies.token;
  if (token) {
    await pool.query("DELETE FROM sessions WHERE token = $1", [token]);
  }
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

export default router;
