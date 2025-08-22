import jwt from "jsonwebtoken";
import pool from "../db.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export async function authenticateToken(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const result = await pool.query(
      "SELECT * FROM sessions WHERE token = $1 AND expires_at > NOW()",
      [token],
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ error: "Session expired or invalid" });
    }

    req.user = { userID: decoded.userID }; // match your schema
    next();
  } catch (err) {
    console.error(err);
    res.status(403).json({ error: "Invalid token" });
  }
}
