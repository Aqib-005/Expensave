import express from "express";
import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "./db.js";
import nodemailer from "nodemailer";
import { authenticateToken } from "./middleware/auth.js";
import passport from "passport";
import "./passport.js";

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
    res.status(400).json({ error: "User already exists " });
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
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
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

//get deets
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const userResult = await pool.query(
      'SELECT "userID", name, email FROM users WHERE "userID" = $1',
      [req.user.id],
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(userResult.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// forgot password route
router.post("/forgotpassword", async (req, res) => {
  const { email } = req.body;

  try {
    // check if user exists
    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );
    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: "User not found" });
    }
    const user = userResult.rows[0];

    // generate reset token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    await pool.query(
      "INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1, $2, $3)",
      [user.userID, token, expires],
    );

    const resetLink = `http://localhost:5173/reset-password?token=${token}`;

    await transporter.sendMail({
      from: `"Expensave Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset Request",
      html: `
        <p>Hello ${user.name || "User"},</p>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetLink}" target="_blank">${resetLink}</a>
        <p>If you didn’t request this, you can ignore this email.</p>
      `,
    });

    res.json({ message: "Password reset link sent to your email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error sending reset email" });
  }
});

// Reset passworbbd
router.post("/resetpassword", async (req, res) => {
  const { token, password } = req.body;

  const resetResult = await pool.query(
    `SELECT * FROM password_resets WHERE token = $1 AND used = FALSE AND expires_at > NOW()`,
    [token],
  );

  if (resetResult.rows.length === 0) {
    return res.status(400).json({ error: "Invalid or expired token" });
  }

  const resetEntry = resetResult.rows[0];
  const hash = await bcrypt.hash(password, 10);

  await pool.query(`UPDATE users SET password_hash = $1 WHERE "userID" = $2`, [
    hash,
    resetEntry.user_id,
  ]);

  await pool.query(`UPDATE password_resets SET used = TRUE WHERE id = $1`, [
    resetEntry.id,
  ]);

  res.json({ message: "Password has been reset successfully" });
});

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    res.cookie("token", req.user.jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 60 * 60 * 1000,
    });

    res.redirect("http://localhost:5173/dashboard");
  },
);

router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"], session: false }),
);

router.get(
  "/github/callback",
  passport.authenticate("github", { session: false }),
  (req, res) => {
    res.cookie("token", req.user.jwt, { httpOnly: true });
    res.redirect("http://localhost:5173/dashboard");
  },
);

export default router;
